import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../services/storage_service.dart';

class AuthController extends GetxController {
  final StorageService _storage = Get.find<StorageService>();

  final phoneController = TextEditingController();
  final otpController = TextEditingController();
  final nameController = TextEditingController();

  final RxString selectedGender = 'Female'.obs;
  final RxList<String> selectedLanguages = <String>['Hindi', 'English'].obs;
  final RxBool isLoading = false.obs;
  final RxInt resendTimer = 30.obs;

  void startResendTimer() {
    resendTimer.value = 30;
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (resendTimer.value > 0) {
        resendTimer.value--;
        return true;
      }
      return false;
    });
  }

  void sendOtp() {
    if (phoneController.text.trim().length < 10) {
      Get.snackbar('Error', 'Please enter a valid 10-digit mobile number',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    isLoading.value = true;
    Future.delayed(const Duration(milliseconds: 600), () {
      isLoading.value = false;
      startResendTimer();
      // Auto pre-fill demo OTP
      otpController.text = '1234';
      Get.toNamed('/otp');
      Get.snackbar('OTP Sent', 'Demo OTP is 1234',
          backgroundColor: Colors.green, colorText: Colors.white);
    });
  }

  void verifyOtp() {
    if (otpController.text.trim().length != 4) {
      Get.snackbar('Error', 'Please enter a valid 4-digit OTP',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    isLoading.value = true;
    Future.delayed(const Duration(milliseconds: 600), () {
      isLoading.value = false;
      _storage.userPhone = phoneController.text.trim();
      
      // If user hasn't set their profile yet, go to profile setup
      if (_storage.userName == 'DilSnap User') {
        Get.offAllNamed('/profile-setup');
      } else {
        _storage.isLoggedIn = true;
        Get.offAllNamed('/home');
      }
    });
  }

  void completeProfile() {
    if (nameController.text.trim().isEmpty) {
      Get.snackbar('Required', 'Please enter your nickname or name',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    _storage.userName = nameController.text.trim();
    _storage.userGender = selectedGender.value;
    _storage.isLoggedIn = true;
    Get.offAllNamed('/home');
    Get.snackbar('Welcome to DilSnap!', 'You received 120 free coins bonus 🎉',
        backgroundColor: Colors.pinkAccent, colorText: Colors.white);
  }

  void logout() {
    _storage.isLoggedIn = false;
    Get.offAllNamed('/login');
  }

  @override
  void onClose() {
    phoneController.dispose();
    otpController.dispose();
    nameController.dispose();
    super.onClose();
  }
}
