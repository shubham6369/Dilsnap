import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../core/constants/app_colors.dart';
import '../models/gift_model.dart';
import '../models/listener_model.dart';
import '../services/webrtc_service.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';
import 'wallet_controller.dart';

enum CallState { connecting, ringing, connected, ended }
enum CallType { video, audio }

class CallController extends GetxController {
  final WebRTCService webrtcService = Get.find<WebRTCService>();
  final WalletController walletController = Get.find<WalletController>();
  final StorageService _storage = Get.find<StorageService>();
  final ApiService _apiService = Get.find<ApiService>();

  ListenerModel? currentHost;
  String? currentSessionId;
  final Rx<CallType> callType = CallType.video.obs;
  final Rx<CallState> callState = CallState.connecting.obs;
  final RxInt callDurationSeconds = 0.obs;
  final RxInt remainingCoins = 0.obs;

  // Controls
  final RxBool isMuted = false.obs;
  final RxBool isSpeakerOn = true.obs;
  final RxBool isVideoOff = false.obs;
  final RxBool isBeautyOn = true.obs;

  // Real-time floating coin deduction alert
  final RxString floatingDeductionText = ''.obs;

  // Active floating gift animation
  final Rx<GiftModel?> activeGift = Rx<GiftModel?>(null);

  // Live in-call comments
  final RxList<String> inCallComments = <String>[].obs;

  Timer? _callDurationTimer;
  Timer? _coinDeductionTimer;
  Timer? _commentTimer;

  final List<String> _simulatedComments = [
    'Hey! So glad we connected ❤️',
    'Can you hear me loud and clear?',
    'You have such a warm smile 😊',
    'Tap the gift box to send me flowers 🌸',
    'I love having private chats with you 💕',
    'Tell me what makes you happy ✨',
    'You are so sweet! 🥰',
  ];
  int _commentIndex = 0;

  void startCall(ListenerModel host, {CallType type = CallType.video}) async {
    currentHost = host;
    callType.value = type;
    remainingCoins.value = walletController.coinBalance.value;

    final rate = type == CallType.video ? host.coinRatePerMinute : (host.coinRatePerMinute * 0.7).round();

    // Check minimum coins required for at least 1 interval
    if (remainingCoins.value < rate) {
      Get.snackbar(
        'Insufficient Coins 💎',
        'You need at least $rate coins to start an ${type == CallType.video ? 'video' : 'audio'} call with ${host.name}',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP,
        margin: const EdgeInsets.all(16),
      );
      Get.toNamed('/wallet');
      return;
    }

    callState.value = CallState.connecting;
    inCallComments.clear();
    floatingDeductionText.value = '';

    // Start live backend call session
    final userIdentifier = _storage.userId.isNotEmpty ? _storage.userId : _storage.userPhone;
    if (userIdentifier.isNotEmpty) {
      final res = await _apiService.startCallSession(
        userId: userIdentifier,
        hostId: host.id,
        callType: type == CallType.video ? 'video' : 'audio',
      );
      if (res != null) {
        if (res['success'] == false) {
          callState.value = CallState.ended;
          Get.snackbar(
            'Cannot Connect',
            res['error']?.toString() ?? 'Unable to initiate call session',
            backgroundColor: Colors.redAccent,
            colorText: Colors.white,
          );
          return;
        }
        if (res['data'] is Map) {
          currentSessionId = res['data']['sessionId']?.toString();
        }
      }
    }

    if (type == CallType.video) {
      Get.toNamed('/video-call');
      await webrtcService.startLocalStream();
    } else {
      Get.toNamed('/audio-call');
    }

    // Realistic ringing delay (2.5 seconds)
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (callState.value == CallState.connecting) {
        callState.value = CallState.connected;
        _startTimers(rate);
        // Immediate deduction upon connecting
        _burnCoins(rate);
      }
    });
  }

  void startVideoCall(ListenerModel host) => startCall(host, type: CallType.video);
  void startAudioCall(ListenerModel host) => startCall(host, type: CallType.audio);

  void switchToVideo() async {
    if (currentHost == null) return;
    callType.value = CallType.video;
    Get.offNamed('/video-call');
    await webrtcService.startLocalStream();
  }

  void _startTimers(int rate) {
    callDurationSeconds.value = 0;
    _callDurationTimer?.cancel();
    _callDurationTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      callDurationSeconds.value++;
    });

    // Deduct coins every 30 seconds for live demo feedback
    _coinDeductionTimer?.cancel();
    _coinDeductionTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      _burnCoins(rate);
    });

    // In-call live comments every 7 seconds
    _commentTimer?.cancel();
    _commentTimer = Timer.periodic(const Duration(seconds: 7), (timer) {
      if (currentHost != null && inCallComments.length < 15) {
        final comment = '${currentHost!.name}: ${_simulatedComments[_commentIndex % _simulatedComments.length]}';
        _commentIndex++;
        inCallComments.add(comment);
      }
    });
  }

  void _burnCoins(int rate) {
    if (currentHost == null) return;

    if (currentSessionId != null && currentSessionId!.isNotEmpty) {
      // Backend live session: pulse route atomically debits host rate and maintains session ledger
      _apiService.pulseCallSession(currentSessionId!).then((pulseRes) {
        if (pulseRes != null) {
          if (pulseRes['success'] == true && pulseRes['data'] is Map) {
            final newBal = pulseRes['data']['remainingCoins'];
            if (newBal is int) {
              walletController.coinBalance.value = newBal;
              _storage.userCoins = newBal;
              remainingCoins.value = newBal;
            } else if (walletController.coinBalance.value >= rate) {
              walletController.coinBalance.value -= rate;
              _storage.userCoins = walletController.coinBalance.value;
              remainingCoins.value = walletController.coinBalance.value;
            }
          } else {
            // Pulse failed on server (e.g. 402 insufficient coins or 400 ended session)
            endCall(reason: pulseRes['error']?.toString() ?? 'Call ended: Out of coins. Recharge to keep talking!');
            return;
          }
        } else {
          // Network dropped / offline fallback: debit locally
          if (walletController.coinBalance.value >= rate) {
            walletController.deductCoins(rate, reason: 'Live call rate (${callType.value == CallType.video ? 'video' : 'audio'})');
            remainingCoins.value = walletController.coinBalance.value;
          } else {
            endCall(reason: 'Call ended: Out of coins. Recharge to keep talking!');
            return;
          }
        }

        _notifyDeduction(rate);
      });
    } else {
      // Offline / mock session without live backend session
      if (walletController.coinBalance.value >= rate) {
        walletController.deductCoins(rate, reason: 'Live call rate (${callType.value == CallType.video ? 'video' : 'audio'})');
        remainingCoins.value = walletController.coinBalance.value;
        _notifyDeduction(rate);
      } else {
        endCall(reason: 'Call ended: Out of coins. Recharge to keep talking!');
      }
    }
  }

  void _notifyDeduction(int rate) {
    // Trigger floating deduction popup
    floatingDeductionText.value = '-$rate 💎 Coins';
    Timer(const Duration(milliseconds: 2200), () {
      floatingDeductionText.value = '';
    });

    // Low balance warning when coins are low
    if (remainingCoins.value < rate) {
      Get.snackbar(
        'Low Coin Balance ⚠️',
        'Only ${remainingCoins.value} coins remaining! Call will end shortly.',
        backgroundColor: Colors.orangeAccent,
        colorText: Colors.black,
        duration: const Duration(seconds: 4),
        snackPosition: SnackPosition.TOP,
      );
    }
  }

  void sendGift(GiftModel gift) {
    if (walletController.coinBalance.value < gift.coinCost) {
      Get.snackbar(
        'Insufficient Coins',
        'You need ${gift.coinCost} coins to send ${gift.name}',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      return;
    }

    walletController.deductCoins(gift.coinCost, reason: 'Gift: ${gift.name}');
    remainingCoins.value = walletController.coinBalance.value;

    // Trigger visual floating gift overlay
    activeGift.value = gift;
    floatingDeductionText.value = '-${gift.coinCost} 💎 (${gift.name})';

    Future.delayed(const Duration(seconds: 3), () {
      activeGift.value = null;
      floatingDeductionText.value = '';
    });

    // Add comment from host reacting to gift
    inCallComments.add('${currentHost?.name ?? "Host"}: Wow, thank you so much for the ${gift.name}! 😍❤️');

    Get.snackbar(
      'Gift Sent! 🎁',
      'You gifted ${gift.name} to ${currentHost?.name}',
      backgroundColor: AppColors.primary,
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
    );
  }

  void toggleMute() {
    webrtcService.toggleMute();
    isMuted.value = !isMuted.value;
  }

  void toggleSpeaker() {
    isSpeakerOn.value = !isSpeakerOn.value;
  }

  void toggleVideo() {
    webrtcService.toggleVideo();
    isVideoOff.value = !isVideoOff.value;
  }

  void switchCamera() {
    webrtcService.switchCamera();
  }

  void toggleBeauty() {
    isBeautyOn.value = !isBeautyOn.value;
    Get.snackbar(
      'Beauty Filter',
      isBeautyOn.value ? 'AI Smooth Beauty ON ✨' : 'Natural Camera Mode',
      snackPosition: SnackPosition.TOP,
      duration: const Duration(seconds: 1),
    );
  }

  void endCall({String? reason}) async {
    _callDurationTimer?.cancel();
    _coinDeductionTimer?.cancel();
    _commentTimer?.cancel();

    // End backend call session
    final sessId = currentSessionId;
    currentSessionId = null;
    if (sessId != null && sessId.isNotEmpty) {
      _apiService.endCallSession(
        sessId,
        durationSeconds: callDurationSeconds.value,
      );
    }

    await webrtcService.disposeCall();
    callState.value = CallState.ended;

    if (reason != null) {
      Get.snackbar('Call Ended', reason,
          backgroundColor: Colors.black87, colorText: Colors.white, duration: const Duration(seconds: 3));
    }

    if (Get.currentRoute == '/video-call' || Get.currentRoute == '/audio-call') {
      Get.back();
    }
  }

  String get formattedDuration {
    final minutes = (callDurationSeconds.value ~/ 60).toString().padLeft(2, '0');
    final seconds = (callDurationSeconds.value % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  void onClose() {
    _callDurationTimer?.cancel();
    _coinDeductionTimer?.cancel();
    _commentTimer?.cancel();
    webrtcService.disposeCall();
    super.onClose();
  }
}
