import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/auth_controller.dart';
import '../../core/constants/app_colors.dart';

class ProfileSetupView extends GetView<AuthController> {
  const ProfileSetupView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Complete Profile'),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              const Text(
                'Tell us about yourself',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 6),
              const Text(
                'Choose your gender and choose a display name to start chatting',
                style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 32),
              const Text('Select Gender', style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.bold)),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: Obx(() {
                      final isSelected = controller.selectedGender.value == 'Female';
                      return GestureDetector(
                        onTap: () => controller.selectedGender.value = 'Female',
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primary.withValues(alpha: 0.2) : AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : Colors.white12,
                              width: 2,
                            ),
                          ),
                          child: Column(
                            children: [
                              Image.asset(
                                'assets/image/female.png',
                                width: 54,
                                height: 54,
                                errorBuilder: (_, __, ___) => const Icon(Icons.female, size: 54, color: Colors.pinkAccent),
                              ),
                              const SizedBox(height: 8),
                              const Text('Female', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                            ],
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Obx(() {
                      final isSelected = controller.selectedGender.value == 'Male';
                      return GestureDetector(
                        onTap: () => controller.selectedGender.value = 'Male',
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.sapphire.withValues(alpha: 0.2) : AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? AppColors.sapphire : Colors.white12,
                              width: 2,
                            ),
                          ),
                          child: Column(
                            children: [
                              Image.asset(
                                'assets/image/male.png',
                                width: 54,
                                height: 54,
                                errorBuilder: (_, __, ___) => const Icon(Icons.male, size: 54, color: Colors.blueAccent),
                              ),
                              const SizedBox(height: 8),
                              const Text('Male', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                            ],
                          ),
                        ),
                      );
                    }),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              const Text('Nickname', style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white12),
                ),
                child: TextField(
                  controller: controller.nameController,
                  style: const TextStyle(color: Colors.white, fontSize: 16),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Enter your name or nickname',
                    hintStyle: TextStyle(color: AppColors.textMuted),
                    icon: Icon(Icons.person_outline, color: AppColors.primary),
                  ),
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: controller.completeProfile,
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Ink(
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Container(
                      alignment: Alignment.center,
                      child: const Text(
                        'Start Exploring DilSnap',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
