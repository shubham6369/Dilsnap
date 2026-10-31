import 'package:flutter/material.dart';

class AppColors {
  // Brand gradient colors
  static const Color primary = Color(0xFFFF2D55); // Vivid rose/pink
  static const Color primaryDark = Color(0xFFC70039);
  static const Color accent = Color(0xFFFF7A00); // Orange/coral
  static const Color purple = Color(0xFF8B2CF5);
  static const Color purpleLight = Color(0xFFA855F7);
  
  // Background & surfaces
  static const Color background = Color(0xFF0F0E17);
  static const Color surface = Color(0xFF1B1A28);
  static const Color surfaceLight = Color(0xFF28273D);
  static const Color card = Color(0xFF222035);

  // Currency & Badges
  static const Color coinGold = Color(0xFFFFD700);
  static const Color emerald = Color(0xFF10B981);
  static const Color ruby = Color(0xFFEF4444);
  static const Color sapphire = Color(0xFF3B82F6);
  static const Color diamond = Color(0xFF06B6D4);

  // Status
  static const Color online = Color(0xFF22C55E);
  static const Color inCall = Color(0xFFF59E0B);
  static const Color offline = Color(0xFF6B7280);

  // Text colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF9CA3AF);
  static const Color textMuted = Color(0xFF6B7280);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFFFF2D55), Color(0xFFFF7A00)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient purpleGradient = LinearGradient(
    colors: [Color(0xFF8B2CF5), Color(0xFFFF2D55)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFFFD700), Color(0xFFFFA500)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
