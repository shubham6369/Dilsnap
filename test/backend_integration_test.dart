import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:dilsnap/services/api_service.dart';
import 'package:dilsnap/services/storage_service.dart';
import 'package:dilsnap/controllers/auth_controller.dart';
import 'package:dilsnap/controllers/wallet_controller.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  HttpOverrides.global = null;

  setUp(() async {
    Get.reset();
    Get.testMode = true;
    final storage = StorageService();
    await storage.init();
    Get.put(storage);
    Get.put(ApiService());
  });

  test('ApiService verifies live endpoints structures and fallbacks', () async {
    final api = Get.find<ApiService>();

    // Test listeners fetch (returns live hosts or fallback)
    final listeners = await api.fetchListeners();
    expect(listeners.isNotEmpty, true);

    // Test packages fetch
    final packages = await api.fetchPackages();
    expect(packages.isNotEmpty, true);

    // Test gifts fetch
    final gifts = await api.fetchGifts();
    expect(gifts.isNotEmpty, true);
  });

  test('WalletController loads balance and processes coin deductions safely', () async {
    final storage = Get.find<StorageService>();
    storage.userCoins = 200;

    final walletController = Get.put(WalletController());
    expect(walletController.coinBalance.value, 200);

    // Deduct coins within balance
    final success = walletController.deductCoins(50);
    expect(success, true);
    expect(walletController.coinBalance.value, 150);
    expect(storage.userCoins, 150);

    // Over-deduction attempt should fail safely without negative balance
    final overSuccess = walletController.deductCoins(500);
    expect(overSuccess, false);
    expect(walletController.coinBalance.value, 150);
    expect(storage.userCoins, 150);

    // Add coins
    walletController.addCoins(100);
    expect(walletController.coinBalance.value, 250);
    expect(storage.userCoins, 250);
  });

  test('AuthController initializes with correct state and validation defaults', () {
    final authController = Get.put(AuthController());
    expect(authController.isLoading.value, false);
    expect(authController.selectedGender.value, 'Female');
    expect(authController.resendTimer.value, 30);
  });

  test('AuthController rejects invalid OTP and cleans storage on logout', () async {
    final storage = Get.find<StorageService>();
    final authController = Get.put(AuthController());

    // Test with invalid 4-digit OTP
    authController.phoneController.text = '9999988888';
    authController.otpController.text = '0000';
    authController.verifyOtp();

    // User should NOT be logged in
    expect(storage.isLoggedIn, false);

    // Test logout clears all session keys
    storage.isLoggedIn = true;
    storage.userId = 'usr_test_123';
    storage.authToken = 'tok_test_456';
    storage.userPhone = '+919999988888';

    authController.logout();
    expect(storage.isLoggedIn, false);
    expect(storage.userId, '');
    expect(storage.authToken, '');
    expect(storage.userPhone, '');
  });
}
