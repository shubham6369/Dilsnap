import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../services/storage_service.dart';
import '../services/api_service.dart';

class AuthController extends GetxController {
  final StorageService _storage = Get.find<StorageService>();

  final ApiService _apiService = Get.find<ApiService>();

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

  void sendOtp() async {
    final phone = phoneController.text.trim();
    if (phone.length < 10) {
      Get.snackbar('Error', 'Please enter a valid 10-digit mobile number',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    isLoading.value = true;
    try {
      final res = await _apiService.sendOtp(phone);
      isLoading.value = false;

      if (res != null && res['success'] == false) {
        Get.snackbar('Error', res['error']?.toString() ?? 'Failed to send OTP',
            backgroundColor: Colors.redAccent, colorText: Colors.white);
        return;
      }

      startResendTimer();
      String otpReceived = '1234';
      if (res != null && res['data'] is Map && res['data']['otp'] != null) {
        otpReceived = res['data']['otp'].toString();
      }

      otpController.text = otpReceived;
      Get.toNamed('/otp');
      Get.snackbar('OTP Sent', 'Demo OTP is $otpReceived',
          backgroundColor: Colors.green, colorText: Colors.white);
    } catch (e) {
      isLoading.value = false;
      startResendTimer();
      otpController.text = '1234';
      Get.toNamed('/otp');
      Get.snackbar('OTP Sent', 'Demo OTP is 1234',
          backgroundColor: Colors.green, colorText: Colors.white);
    }
  }

  void verifyOtp() async {
    final otp = otpController.text.trim();
    final phone = phoneController.text.trim();

    if (otp.length != 4) {
      Get.snackbar('Error', 'Please enter a valid 4-digit OTP',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    isLoading.value = true;
    try {
      final res = await _apiService.verifyOtp(phone, otp);
      isLoading.value = false;

      if (res != null) {
        if (res['success'] != true) {
          final errorMsg = res['error']?.toString() ?? 'Invalid or expired OTP';
          Get.snackbar('Verification Failed', errorMsg,
              backgroundColor: Colors.redAccent, colorText: Colors.white);
          return;
        }

        _storage.userPhone = phone;
        if (res['data'] is Map) {
          final data = res['data'] as Map;
          final token = data['token']?.toString() ?? '';
          _storage.authToken = token;

          final userMap = data['user'] as Map?;
          if (userMap != null) {
            final id = userMap['id']?.toString() ?? '';
            if (id.isNotEmpty) _storage.userId = id;

            final userName = userMap['name']?.toString() ?? '';
            if (userName.isNotEmpty && userName != 'DilSnap User') {
              _storage.userName = userName;
            }

            final coins = userMap['coins'] ?? userMap['coinBalance'];
            if (coins is int) _storage.userCoins = coins;
            if (coins is num) _storage.userCoins = coins.toInt();
          }
        }
      } else {
        // Offline / network failure fallback: only accept valid demo OTP '1234'
        if (otp != '1234') {
          Get.snackbar('Verification Failed', 'Invalid OTP',
              backgroundColor: Colors.redAccent, colorText: Colors.white);
          return;
        }
        _storage.userPhone = phone;
      }

      // If user hasn't set their profile yet, go to profile setup
      if (_storage.userName == 'DilSnap User') {
        Get.offAllNamed('/profile-setup');
      } else {
        _storage.isLoggedIn = true;
        Get.offAllNamed('/home');
      }
    } catch (e) {
      isLoading.value = false;
      if (otp != '1234') {
        Get.snackbar('Verification Failed', 'Invalid OTP',
            backgroundColor: Colors.redAccent, colorText: Colors.white);
        return;
      }
      _storage.userPhone = phone;
      if (_storage.userName == 'DilSnap User') {
        Get.offAllNamed('/profile-setup');
      } else {
        _storage.isLoggedIn = true;
        Get.offAllNamed('/home');
      }
    }
  }

  void completeProfile() async {
    final name = nameController.text.trim();
    if (name.isEmpty) {
      Get.snackbar('Required', 'Please enter your nickname or name',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    _storage.userName = name;
    _storage.userGender = selectedGender.value;
    _storage.isLoggedIn = true;

    final userIdentifier = _storage.userId.isNotEmpty ? _storage.userId : _storage.userPhone;
    if (userIdentifier.isNotEmpty) {
      _apiService.updateUserProfile(
        userId: userIdentifier,
        name: name,
        gender: selectedGender.value,
      );
    }

    Get.offAllNamed('/home');
    Get.snackbar('Welcome to DilSnap!', 'You received 120 free coins bonus 🎉',
        backgroundColor: Colors.pinkAccent, colorText: Colors.white);
  }

  void logout() {
    _storage.clear();
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
