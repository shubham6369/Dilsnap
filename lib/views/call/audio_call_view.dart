import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/call_controller.dart';
import '../../core/constants/app_colors.dart';
import '../../models/gift_model.dart';

class AudioCallView extends StatefulWidget {
  const AudioCallView({super.key});

  @override
  State<AudioCallView> createState() => _AudioCallViewState();
}

class _AudioCallViewState extends State<AudioCallView> with TickerProviderStateMixin {
  final CallController controller = Get.find<CallController>();
  late AnimationController _pulseController;
  late AnimationController _waveformController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _waveformController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _waveformController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final host = controller.currentHost;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          _confirmEndCall();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0F0E17),
        body: SafeArea(
          child: Stack(
            children: [
              // Subtle background atmospheric ambient light
              Positioned(
                top: 100,
                left: 50,
                right: 50,
                child: Container(
                  height: 300,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.18),
                        blurRadius: 100,
                        spreadRadius: 30,
                      )
                    ],
                  ),
                ),
              ),

              // Main Column
              Column(
                children: [
                  // 1. Top Bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white70),
                          onPressed: _confirmEndCall,
                        ),
                        // Coin Balance Chip
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white12,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.coinGold.withValues(alpha: 0.4)),
                          ),
                          child: Row(
                            children: [
                              Image.asset(
                                'assets/image/diamond.png',
                                width: 16,
                                height: 16,
                                errorBuilder: (_, __, ___) => const Icon(Icons.monetization_on, size: 16, color: AppColors.coinGold),
                              ),
                              const SizedBox(width: 6),
                              Obx(() => Text(
                                '${controller.remainingCoins.value} coins',
                                style: const TextStyle(color: AppColors.coinGold, fontWeight: FontWeight.bold, fontSize: 13),
                              )),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const Spacer(flex: 1),

                  // 2. Pulsing Avatar with Rings
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      final scale = 1.0 + (_pulseController.value * 0.08);
                      return Stack(
                        alignment: Alignment.center,
                        children: [
                          // Outer Ripple Ring
                          Container(
                            width: 190 * scale,
                            height: 190 * scale,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.3 * (1 - _pulseController.value)),
                                width: 3,
                              ),
                            ),
                          ),
                          // Inner Ripple Ring
                          Container(
                            width: 165 + (_pulseController.value * 12),
                            height: 165 + (_pulseController.value * 12),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.5),
                                width: 2,
                              ),
                            ),
                          ),
                          // Avatar Container
                          Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(alpha: 0.4),
                                  blurRadius: 24,
                                  spreadRadius: 2,
                                )
                              ],
                              border: Border.all(color: Colors.white, width: 3),
                              image: DecorationImage(
                                image: NetworkImage(host?.avatarUrl ?? ''),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),

                  const SizedBox(height: 24),

                  // 3. Host Name & Status
                  Text(
                    host?.name ?? 'Connecting...',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Obx(() {
                    if (controller.callState.value == CallState.connected) {
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.online,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'Connected • HD Voice',
                            style: TextStyle(color: AppColors.online, fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                        ],
                      );
                    } else {
                      return const Text(
                        'Ringing...',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                      );
                    }
                  }),

                  const SizedBox(height: 16),

                  // Call Duration Timer
                  Obx(() => Text(
                    controller.formattedDuration,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1,
                    ),
                  )),

                  const SizedBox(height: 20),

                  // 4. Live Audio Equalizer Waveform Animation
                  Obx(() {
                    if (controller.callState.value != CallState.connected) {
                      return const SizedBox(height: 36);
                    }
                    return AnimatedBuilder(
                      animation: _waveformController,
                      builder: (context, _) {
                        return SizedBox(
                          height: 36,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(12, (index) {
                              final wave = sin((index * 0.5) + (_waveformController.value * pi));
                              final height = 8.0 + (wave.abs() * 24.0);
                              return Container(
                                margin: const EdgeInsets.symmetric(horizontal: 2.5),
                                width: 4,
                                height: height,
                                decoration: BoxDecoration(
                                  color: index % 2 == 0 ? AppColors.primary : AppColors.accent,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              );
                            }),
                          ),
                        );
                      },
                    );
                  }),

                  const Spacer(flex: 2),

                  // 5. Upgrade to Video Call Banner
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 32),
                    child: OutlinedButton.icon(
                      onPressed: controller.switchToVideo,
                      icon: const Icon(Icons.videocam_rounded, color: Colors.white, size: 20),
                      label: const Text(
                        'Switch to Video Call',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.primary, width: 1.5),
                        backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      ),
                    ),
                  ),

                  const SizedBox(height: 28),

                  // 6. Bottom Call Controls (Mute, Speaker, Gift, End)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 36, left: 24, right: 24),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        // Mic Mute Toggle
                        Obx(() => _buildActionButton(
                          icon: controller.isMuted.value ? Icons.mic_off : Icons.mic,
                          label: controller.isMuted.value ? 'Unmute' : 'Mute',
                          isActive: controller.isMuted.value,
                          activeColor: Colors.redAccent,
                          onTap: controller.toggleMute,
                        )),

                        // Speaker Toggle
                        Obx(() => _buildActionButton(
                          icon: controller.isSpeakerOn.value ? Icons.volume_up : Icons.volume_off,
                          label: 'Speaker',
                          isActive: controller.isSpeakerOn.value,
                          activeColor: AppColors.primary,
                          onTap: controller.toggleSpeaker,
                        )),

                        // Gift Button
                        _buildActionButton(
                          icon: Icons.card_giftcard,
                          label: 'Gift',
                          isActive: false,
                          activeColor: Colors.purpleAccent,
                          onTap: () => _openGiftSheet(context),
                        ),

                        // End Call
                        _buildActionButton(
                          icon: Icons.call_end,
                          label: 'End',
                          isActive: true,
                          activeColor: Colors.red,
                          onTap: () => controller.endCall(reason: 'Call Ended'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              // 7. Floating Animated Coin Deduction Alert
              Obx(() {
                final deduction = controller.floatingDeductionText.value;
                if (deduction.isEmpty) return const SizedBox.shrink();

                return Positioned(
                  top: 80,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0.0, end: 1.0),
                      duration: const Duration(milliseconds: 400),
                      curve: Curves.easeOutBack,
                      builder: (context, value, child) {
                        return Transform.scale(
                          scale: value,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFE53935), Color(0xFFFF8F00)],
                              ),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.red.withValues(alpha: 0.5),
                                  blurRadius: 16,
                                  offset: const Offset(0, 4),
                                )
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.arrow_downward_rounded, color: Colors.white, size: 16),
                                const SizedBox(width: 6),
                                Text(
                                  deduction,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 14,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                );
              }),

              // 8. Floating Active Gift Animation
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
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.black87,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.primary, width: 1.5),
                        ),
                        child: Text(
                          'Sent ${gift.name} 🎁',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required bool isActive,
    required Color activeColor,
    required VoidCallback onTap,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isActive ? activeColor : Colors.white12,
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: activeColor.withValues(alpha: 0.4),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      )
                    ]
                  : null,
            ),
            child: Icon(icon, color: Colors.white, size: 26),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
        ),
      ],
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
      title: 'End Call?',
      titleStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      middleText: 'Are you sure you want to end this call?',
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
