import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:dilsnap/core/constants/app_colors.dart';
import 'package:dilsnap/models/listener_model.dart';

class HostCard extends StatelessWidget {
  final ListenerModel listener;
  final VoidCallback onCall;
  final VoidCallback? onAudioCall;
  final VoidCallback? onChat;

  const HostCard({
    super.key,
    required this.listener,
    required this.onCall,
    this.onAudioCall,
    this.onChat,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            // Host Image
            Positioned.fill(
              child: CachedNetworkImage(
                imageUrl: listener.avatarUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: AppColors.surfaceLight,
                  child: const Center(
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  color: AppColors.surfaceLight,
                  child: const Icon(Icons.person, size: 60, color: Colors.white24),
                ),
              ),
            ),

            // Top Badges (Online Indicator + Coin Rate)
            Positioned(
              top: 10,
              left: 10,
              right: 10,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Online pill
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.65),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: listener.isOnline ? AppColors.online : AppColors.offline,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          listener.isOnline ? 'ONLINE' : 'OFFLINE',
                          style: TextStyle(
                            color: listener.isOnline ? AppColors.online : AppColors.offline,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Coin Rate Pill
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.75),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Image.asset(
                          'assets/image/diamond.png',
                          width: 13,
                          height: 13,
                          errorBuilder: (ctx, err, stack) => const Icon(Icons.monetization_on, size: 13, color: AppColors.coinGold),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${listener.coinRatePerMinute}/m',
                          style: const TextStyle(color: AppColors.coinGold, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Dark Gradient Overlay with Info & Call Buttons
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.transparent,
                      Colors.black.withValues(alpha: 0.8),
                      Colors.black.withValues(alpha: 0.96),
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '${listener.name}, ${listener.age}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 13),
                            const SizedBox(width: 2),
                            Text(
                              listener.rating.toString(),
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      listener.languages.join(' • '),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                    ),
                    const SizedBox(height: 8),

                    // Actions Row: Video Call, Audio Call, Chat
                    Row(
                      children: [
                        // Primary Video Call Button
                        Expanded(
                          child: SizedBox(
                            height: 34,
                            child: ElevatedButton(
                              onPressed: onCall,
                              style: ElevatedButton.styleFrom(
                                padding: EdgeInsets.zero,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: Ink(
                                decoration: BoxDecoration(
                                  gradient: AppColors.primaryGradient,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.videocam_rounded, size: 16, color: Colors.white),
                                    SizedBox(width: 4),
                                    Text('Video', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),

                        if (onAudioCall != null) ...[
                          const SizedBox(width: 6),
                          // Audio Call Button
                          GestureDetector(
                            onTap: onAudioCall,
                            child: Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: Colors.white12,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: Colors.white24),
                              ),
                              child: const Icon(Icons.call_rounded, color: Colors.white, size: 16),
                            ),
                          ),
                        ],

                        if (onChat != null) ...[
                          const SizedBox(width: 6),
                          // Chat Button
                          GestureDetector(
                            onTap: onChat,
                            child: Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: Colors.white12,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: Colors.white24),
                              ),
                              child: const Icon(Icons.chat_bubble_rounded, color: AppColors.primary, size: 16),
                            ),
                          ),
                        ],
                      ],
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
}
