import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:uuid/uuid.dart';
import '../models/chat_message_model.dart';
import '../models/gift_model.dart';
import '../models/listener_model.dart';
import 'wallet_controller.dart';

class ChatController extends GetxController {
  final WalletController _walletController = Get.find<WalletController>();
  final _uuid = const Uuid();

  // Messages map keyed by hostId
  final RxMap<String, List<ChatMessageModel>> chatHistory = <String, List<ChatMessageModel>>{}.obs;

  // Typing state per host
  final RxMap<String, bool> typingState = <String, bool>{}.obs;

  // Last active host for quick navigation
  final Rx<ListenerModel?> activeHost = Rx<ListenerModel?>(null);

  // List of pre-configured realistic automated replies
  final Map<String, List<String>> _autoReplies = {
    'default': [
      'Hey handsome! So happy you texted me ❤️',
      'I was just thinking about you! Call me when you are free 😘',
      'You are so sweet! Let’s do a quick video call, I’m free right now 🙈',
      'Aww thank you! You just made my day ✨',
      'Hit that Video Call button at the top! Let’s talk face-to-face 💕',
      'I am listening! Tell me more about your day 😊',
      'Send me a rose! 🌹 I’ll send you a special smile!',
      'You have the cutest vibe! Can’t wait to hear your voice 💖'
    ],
  };

  int _replyCounter = 0;

  @override
  void onInit() {
    super.onInit();
    _initSampleChats();
  }

  void _initSampleChats() {
    final now = DateTime.now();
    // Priya Sharma
    chatHistory['1'] = [
      ChatMessageModel(
        id: 'p1',
        hostId: '1',
        text: 'Hey handsome! Loved connecting with you! Are you free for a video call? 💕',
        isUser: false,
        timestamp: now.subtract(const Duration(minutes: 15)),
      ),
    ];

    // Ananya Verma
    chatHistory['2'] = [
      ChatMessageModel(
        id: 'a1',
        hostId: '2',
        text: 'Hi there! Thanks for visiting my profile 😊 Call me anytime!',
        isUser: false,
        timestamp: now.subtract(const Duration(hours: 1)),
      ),
    ];

    // Neha Patel
    chatHistory['3'] = [
      ChatMessageModel(
        id: 'n1',
        hostId: '3',
        text: 'Hello! I am online now, let’s talk if you are feeling bored ✨',
        isUser: false,
        timestamp: now.subtract(const Duration(hours: 2)),
      ),
    ];

    // Kavya Reddy
    chatHistory['4'] = [
      ChatMessageModel(
        id: 'k1',
        hostId: '4',
        text: 'Hey! Send me a Hi 👋',
        isUser: false,
        timestamp: now.subtract(const Duration(hours: 5)),
      ),
    ];
  }

  List<ChatMessageModel> getMessagesFor(String hostId) {
    return chatHistory[hostId] ?? [];
  }

  bool isHostTyping(String hostId) {
    return typingState[hostId] ?? false;
  }

  int get totalUnreadCount => chatHistory.length;

  void openChat(ListenerModel host) {
    activeHost.value = host;
    if (!chatHistory.containsKey(host.id)) {
      chatHistory[host.id] = [
        ChatMessageModel(
          id: _uuid.v4(),
          hostId: host.id,
          text: 'Hi! I’m ${host.name}. Let’s have a wonderful chat! 💕',
          isUser: false,
          timestamp: DateTime.now(),
        ),
      ];
    }
    Get.toNamed('/chat-detail');
  }

  void sendMessage(String hostId, String text) {
    if (text.trim().isEmpty) return;

    final userMsg = ChatMessageModel(
      id: _uuid.v4(),
      hostId: hostId,
      text: text.trim(),
      isUser: true,
      timestamp: DateTime.now(),
    );

    final current = List<ChatMessageModel>.from(chatHistory[hostId] ?? []);
    current.add(userMsg);
    chatHistory[hostId] = current;

    // Simulate host typing and reply
    Timer(const Duration(milliseconds: 600), () {
      typingState[hostId] = true;
    });

    Timer(const Duration(milliseconds: 2200), () {
      typingState[hostId] = false;
      final replies = _autoReplies['default']!;
      final replyText = replies[_replyCounter % replies.length];
      _replyCounter++;

      final hostMsg = ChatMessageModel(
        id: _uuid.v4(),
        hostId: hostId,
        text: replyText,
        isUser: false,
        timestamp: DateTime.now(),
      );

      final updated = List<ChatMessageModel>.from(chatHistory[hostId] ?? []);
      updated.add(hostMsg);
      chatHistory[hostId] = updated;
    });
  }

  bool sendGiftInChat(String hostId, GiftModel gift) {
    if (_walletController.coinBalance.value < gift.coinCost) {
      Get.snackbar(
        'Insufficient Coins',
        'You need ${gift.coinCost} coins to send this gift.',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
      return false;
    }

    _walletController.deductCoins(gift.coinCost);

    final giftMsg = ChatMessageModel(
      id: _uuid.v4(),
      hostId: hostId,
      text: 'Sent ${gift.name} 🎁',
      isUser: true,
      timestamp: DateTime.now(),
      isGift: true,
      giftName: gift.name,
      giftAsset: gift.assetPath,
      coins: gift.coinCost,
    );

    final current = List<ChatMessageModel>.from(chatHistory[hostId] ?? []);
    current.add(giftMsg);
    chatHistory[hostId] = current;

    // Host excited reaction
    Timer(const Duration(milliseconds: 700), () {
      typingState[hostId] = true;
    });

    Timer(const Duration(milliseconds: 2000), () {
      typingState[hostId] = false;
      final hostReaction = ChatMessageModel(
        id: _uuid.v4(),
        hostId: hostId,
        text: 'OMG thank you for the ${gift.name}! 😍 You are the sweetest! Let’s do a video call right now ❤️',
        isUser: false,
        timestamp: DateTime.now(),
      );
      final updated = List<ChatMessageModel>.from(chatHistory[hostId] ?? []);
      updated.add(hostReaction);
      chatHistory[hostId] = updated;
    });

    Get.snackbar(
      'Gift Sent! 🎁',
      'Deducted ${gift.coinCost} coins for ${gift.name}',
      backgroundColor: Colors.purpleAccent,
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
    );

    return true;
  }
}
