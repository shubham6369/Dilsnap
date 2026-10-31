import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:get/get.dart' hide navigator;

class WebRTCService extends GetxService {
  final RTCVideoRenderer localRenderer = RTCVideoRenderer();
  final RTCVideoRenderer remoteRenderer = RTCVideoRenderer();

  MediaStream? _localStream;
  bool _isInitialized = false;
  bool isAudioMuted = false;
  bool isVideoDisabled = false;
  bool isFrontCamera = true;

  Future<void> initRenderers() async {
    if (_isInitialized) return;
    await localRenderer.initialize();
    await remoteRenderer.initialize();
    _isInitialized = true;
  }

  Future<void> startLocalStream() async {
    await initRenderers();

    final Map<String, dynamic> mediaConstraints = {
      'audio': true,
      'video': {
        'mandatory': {
          'minWidth': '640',
          'minHeight': '480',
          'minFrameRate': '30',
        },
        'facingMode': isFrontCamera ? 'user' : 'environment',
        'optional': [],
      }
    };

    try {
      _localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      localRenderer.srcObject = _localStream;
      // In peer connection mode, remote renderer will receive stream from peer
      remoteRenderer.srcObject = _localStream; // Fallback preview until remote peer joins
    } catch (e) {
      // In emulator or environments without physical camera, video stream may be simulated
    }
  }

  void toggleMute() {
    if (_localStream != null) {
      final audioTracks = _localStream!.getAudioTracks();
      if (audioTracks.isNotEmpty) {
        isAudioMuted = !isAudioMuted;
        audioTracks.first.enabled = !isAudioMuted;
      }
    }
  }

  void toggleVideo() {
    if (_localStream != null) {
      final videoTracks = _localStream!.getVideoTracks();
      if (videoTracks.isNotEmpty) {
        isVideoDisabled = !isVideoDisabled;
        videoTracks.first.enabled = !isVideoDisabled;
      }
    }
  }

  Future<void> switchCamera() async {
    if (_localStream != null) {
      final videoTracks = _localStream!.getVideoTracks();
      if (videoTracks.isNotEmpty) {
        final track = videoTracks.first;
        await Helper.switchCamera(track);
        isFrontCamera = !isFrontCamera;
      }
    }
  }

  Future<void> disposeCall() async {
    try {
      _localStream?.getTracks().forEach((track) => track.stop());
      await _localStream?.dispose();
      _localStream = null;
      localRenderer.srcObject = null;
      remoteRenderer.srcObject = null;
    } catch (e) {
      // Ignore cleanup exceptions
    }
  }

  @override
  void onClose() {
    localRenderer.dispose();
    remoteRenderer.dispose();
    super.onClose();
  }
}
