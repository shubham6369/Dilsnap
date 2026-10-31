import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/auth_controller.dart';
import '../../core/constants/app_colors.dart';
import '../../services/storage_service.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({super.key});

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  final StorageService _storage = Get.find<StorageService>();
  final AuthController _auth = Get.find<AuthController>();

  late bool _isHost;
  late bool _isHostOnline;

  @override
  void initState() {
    super.initState();
    _isHost = _storage.isHost;
    _isHostOnline = true;
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Profile Header Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white10),
            ),
            child: Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: AppColors.primaryGradient,
                  ),
                  child: Center(
                    child: Text(
                      _storage.userName.isNotEmpty ? _storage.userName[0].toUpperCase() : 'U',
                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _storage.userName,
                        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '+91 ${_storage.userPhone}',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _storage.userGender,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Listener / Host Mode Toggle Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [const Color(0xFF2E1A47), AppColors.surface],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.purple.withValues(alpha: 0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.headset_mic_rounded, color: AppColors.purpleLight),
                        SizedBox(width: 10),
                        Text('Host / Listener Mode', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Switch(
                      value: _isHost,
                      activeTrackColor: AppColors.primary,
                      onChanged: (val) {
                        setState(() {
                          _isHost = val;
                          _storage.isHost = val;
                        });
                        Get.snackbar(
                          val ? 'Host Mode Enabled 🎙️' : 'Host Mode Disabled',
                          val ? 'You can now receive video calls and earn coins' : 'Switched to user browsing mode',
                          backgroundColor: AppColors.primary,
                          colorText: Colors.white,
                        );
                      },
                    ),
                  ],
                ),
                if (_isHost) ...[
                  const Divider(color: Colors.white12, height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Ready to Receive Calls', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      Row(
                        children: [
                          Text(_isHostOnline ? 'ONLINE' : 'OFFLINE', style: TextStyle(color: _isHostOnline ? AppColors.online : AppColors.textMuted, fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(width: 8),
                          Switch(
                            value: _isHostOnline,
                            activeTrackColor: AppColors.online,
                            onChanged: (v) {
                              setState(() => _isHostOnline = v);
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text('Earnings: 30 Coins / minute from callers', style: TextStyle(color: AppColors.coinGold, fontSize: 12)),
                ],
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Menu Options
          _buildMenuTile(
            icon: Icons.language,
            title: 'Languages',
            subtitle: 'Hindi, English',
            onTap: () {},
          ),
          _buildMenuTile(
            icon: Icons.history,
            title: 'Call & Coin History',
            subtitle: 'Recent calls and coin transactions',
            onTap: () {},
          ),
          _buildMenuTile(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy & Permissions',
            subtitle: 'Screen protection and camera permissions',
            onTap: () {},
          ),
          _buildMenuTile(
            icon: Icons.info_outline,
            title: 'App Version',
            subtitle: 'v1.0.0 (Build 1) • Production',
            onTap: () {},
          ),

          const SizedBox(height: 16),

          // Logout Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.redAccent,
                side: const BorderSide(color: Colors.redAccent),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () {
                _auth.logout();
              },
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildMenuTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.surfaceLight,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.primary, size: 20),
        ),
        title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
        onTap: onTap,
      ),
    );
  }
}
