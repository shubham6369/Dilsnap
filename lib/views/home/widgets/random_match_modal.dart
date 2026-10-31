import 'package:flutter/material.dart';
import 'package:dilsnap/core/constants/app_colors.dart';

class RandomMatchModal extends StatelessWidget {
  const RandomMatchModal({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
      decoration: const BoxDecoration(
        color: Color(0xFF1B182B),
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: AppColors.purpleGradient,
              boxShadow: [
                BoxShadow(
                  color: AppColors.purple.withValues(alpha: 0.5),
                  blurRadius: 30,
                  spreadRadius: 8,
                )
              ],
            ),
            child: const Center(
              child: Icon(Icons.shuffle_rounded, size: 48, color: Colors.white),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Finding Best Match...',
            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Connecting you with an active listener who speaks your language',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: 32,
            height: 32,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}
