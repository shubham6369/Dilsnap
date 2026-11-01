import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:get/get.dart';
import '../../controllers/call_controller.dart';
import '../../core/constants/app_colors.dart';
import '../../models/gift_model.dart';

class VideoCallView extends GetView<CallController> {
  const VideoCallView({super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          _confirmEndCall();
        }
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: Stack(
          children: [
            // 1. Remote Video / Live Host Stream
            Positioned.fill(
              child: Obx(() {
                if (controller.callState.value == CallState.connected) {
                  return Stack(
                    fit: StackFit.expand,
                    children: [
                      // Video stream renderer
                      RTCVideoView(
                        controller.webrtcService.remoteRenderer,
                        objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
                      ),
                      // Fallback simulated HD Host Video if stream is pending
                      if (controller.webrtcService.remoteRenderer.srcObject == null)
                        Image.network(
                          controller.currentHost?.avatarUrl ?? '',
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(color: const Color(0xFF1B1926)),
                        ),
                      // Atmospheric cinematic gradient overlay
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.black.withValues(alpha: 0.5),
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.8),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                    ],
                  );
                } else {
                  // Connecting / Ringing Screen
                  return Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.black, Color(0xFF231E3D), Colors.black],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.primary, width: 3),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(alpha: 0.5),
                                  blurRadius: 30,
                                  spreadRadius: 4,
                                )
                              ],
                              image: DecorationImage(
                                image: NetworkImage(controller.currentHost?.avatarUrl ?? ''),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(
                            controller.currentHost?.name ?? 'Connecting...',
                            style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Connecting encrypted 1-on-1 video call...',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                          ),
                          const SizedBox(height: 28),
                          const CircularProgressIndicator(color: AppColors.primary),
                        ],
                      ),
                    ),
                  );
                }
              }),
            ),

            // 2. Picture-in-Picture Local User Video Preview (Top Right)
            Positioned(
              top: 50,
              right: 16,
              child: Container(
                width: 105,
                height: 145,
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white38, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.6),
                      blurRadius: 14,
                    )
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Stack(
                    children: [
                      RTCVideoView(
                        controller.webrtcService.localRenderer,
                        mirror: controller.webrtcService.isFrontCamera,
                        objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
                      ),
                      Positioned(
                        bottom: 4,
                        right: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('You', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // 3. Top Header: Host Name, Live indicator & Coins
            Positioned(
              top: 50,
              left: 16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.65),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 13,
                          backgroundImage: NetworkImage(controller.currentHost?.avatarUrl ?? ''),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          controller.currentHost?.name ?? '',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(color: AppColors.online, shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 6),
                        Obx(() => Text(
                          controller.formattedDuration,
                          style: const TextStyle(color: AppColors.online, fontWeight: FontWeight.bold, fontSize: 13),
                        )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Real-time coin balance
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.65),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.coinGold.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        Image.asset(
                          'assets/image/diamond.png',
                          width: 15,
                          height: 15,
                          errorBuilder: (_, __, ___) => const Icon(Icons.monetization_on, size: 15, color: AppColors.coinGold),
                        ),
                        const SizedBox(width: 6),
                        Obx(() => Text(
                          '${controller.remainingCoins.value} coins',
                          style: const TextStyle(color: AppColors.coinGold, fontWeight: FontWeight.bold, fontSize: 12),
                        )),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // 4. Floating Animated Coin Deduction Alert
            Obx(() {
              final deduction = controller.floatingDeductionText.value;
              if (deduction.isEmpty) return const SizedBox.shrink();

              return Positioned(
                top: 135,
                left: 16,
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeOutBack,
                  builder: (context, value, child) {
                    return Transform.scale(
                      scale: value,
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFFE53935), Color(0xFFFF6F00)],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.red.withValues(alpha: 0.4),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            )
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.arrow_downward_rounded, color: Colors.white, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              deduction,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              );
            }),

            // 5. In-Call Live Chat Comments (Bottom-Left)
            Positioned(
              left: 16,
              bottom: 110,
              width: 250,
              child: Obx(() {
                final comments = controller.inCallComments;
                if (comments.isEmpty) return const SizedBox.shrink();

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: (comments.length > 3 ? comments.sublist(comments.length - 3) : comments).map((cmt) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.65),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Text(
                        cmt,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    );
                  }).toList(),
                );
              }),
            ),

            // 6. Floating Active Gift Animation
            Obx(() {
              final gift = controller.activeGift.value;
              if (gift == null) return const SizedBox.shrink();
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset(
                      gift.assetPath,
                      width: 140,
                      height: 140,
                      errorBuilder: (_, __, ___) => const Icon(Icons.card_giftcard, size: 100, color: Colors.pinkAccent),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.black87,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.primary, width: 1.5),
                      ),
                      child: Text(
                        'Sent ${gift.name} 🎁',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                  ],
                ),
              );
            }),

            // 7. Bottom Controls (Mute, Flip, Beauty, Gift, Hangup)
            Positioned(
              left: 0,
              right: 0,
              bottom: 36,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Mic Mute
                    Obx(() => _buildCircleAction(
                      icon: controller.isMuted.value ? Icons.mic_off : Icons.mic,
                      color: controller.isMuted.value ? Colors.redAccent : Colors.white24,
                      onTap: controller.toggleMute,
                    )),

                    // Camera Switch (Front/Back)
                    _buildCircleAction(
                      icon: Icons.flip_camera_ios,
                      color: Colors.white24,
                      onTap: controller.switchCamera,
                    ),

                    // Beauty Filter Toggle
                    Obx(() => _buildCircleAction(
                      icon: Icons.face_retouching_natural,
                      color: controller.isBeautyOn.value ? AppColors.accent : Colors.white24,
                      onTap: controller.toggleBeauty,
                    )),

                    // Gift Button
                    _buildCircleAction(
                      icon: Icons.card_giftcard,
                      color: Colors.pinkAccent,
                      onTap: () => _openGiftSheet(context),
                    ),

                    // Hangup / End Call
                    _buildCircleAction(
                      icon: Icons.call_end,
                      color: Colors.red,
                      onTap: () => controller.endCall(reason: 'Call Ended'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCircleAction({
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Icon(icon, color: Colors.white, size: 24),
      ),
    );
  }

  void _openGiftSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1B1926),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Send a Gift 🎁',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  Obx(() => Text(
                    'Balance: ${controller.remainingCoins.value} 💎',
                    style: const TextStyle(color: AppColors.coinGold, fontWeight: FontWeight.bold),
                  )),
                ],
              ),
              const SizedBox(height: 16),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.85,
                ),
                itemCount: GiftModel.activeGifts.length,
                itemBuilder: (ctx, idx) {
                  final gift = GiftModel.activeGifts[idx];
                  return GestureDetector(
                    onTap: () {
                      Navigator.pop(ctx);
                      controller.sendGift(gift);
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Image.asset(
                            gift.assetPath,
                            width: 50,
                            height: 50,
                            errorBuilder: (_, __, ___) => const Icon(Icons.card_giftcard, color: Colors.pinkAccent),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            gift.name,
                            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.asset('assets/image/diamond.png', width: 12, height: 12, errorBuilder: (_, __, ___) => const Icon(Icons.monetization_on, size: 12, color: AppColors.coinGold)),
                              const SizedBox(width: 4),
                              Text(
                                '${gift.coinCost}',
                                style: const TextStyle(color: AppColors.coinGold, fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _confirmEndCall() {
    Get.defaultDialog(
      title: 'End Video Call?',
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      middleText: 'Are you sure you want to end this video call?',
      middleTextStyle: const TextStyle(color: Colors.white70),
      backgroundColor: const Color(0xFF1E1C2E),
      textConfirm: 'End Call',
      textCancel: 'Cancel',
      confirmTextColor: Colors.white,
      buttonColor: Colors.redAccent,
      onConfirm: () {
        Get.back();
        controller.endCall();
      },
    );
  }
}
