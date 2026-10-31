import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../models/coin_package_model.dart';
import '../services/storage_service.dart';

class WalletController extends GetxController {
  final StorageService _storage = Get.find<StorageService>();

  final RxInt coinBalance = 120.obs;
  final RxBool isPurchasing = false.obs;

  @override
  void onInit() {
    super.onInit();
    coinBalance.value = _storage.userCoins;
  }

  void refreshBalance() {
    coinBalance.value = _storage.userCoins;
  }

  bool deductCoins(int amount) {
    if (coinBalance.value >= amount) {
      coinBalance.value -= amount;
      _storage.userCoins = coinBalance.value;
      return true;
    }
    return false;
  }

  void addCoins(int amount) {
    coinBalance.value += amount;
    _storage.userCoins = coinBalance.value;
  }

  void purchasePackage(CoinPackageModel package) {
    isPurchasing.value = true;

    // Simulate Cashfree Seamless Payment SDK flow
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Color(0xFF1E1C2E),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Image.asset('assets/image/wallet.png', width: 32, height: 32, errorBuilder: (_, __, ___) => const Icon(Icons.account_balance_wallet, color: Colors.amber)),
                const SizedBox(width: 12),
                const Text('Cashfree Secure Checkout', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
              ],
            ),
            const Divider(color: Colors.white24, height: 28),
            Text('Package: ${package.name}', style: const TextStyle(color: Colors.white70, fontSize: 16)),
            const SizedBox(height: 6),
            Text('Coins: ${package.coins} + ${package.bonusCoins} Bonus', style: const TextStyle(color: Colors.amber, fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Amount Payable: ₹${package.priceInr.toStringAsFixed(0)}', style: const TextStyle(color: Colors.greenAccent, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00C853),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  Get.back();
                  _processPaymentSuccess(package);
                },
                child: const Text('Pay via UPI / GPay / PhonePe', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  void _processPaymentSuccess(CoinPackageModel package) {
    Future.delayed(const Duration(milliseconds: 500), () {
      isPurchasing.value = false;
      final totalAdded = package.coins + package.bonusCoins;
      addCoins(totalAdded);
      Get.snackbar(
        'Payment Successful! 🎉',
        'Added $totalAdded coins to your DilSnap wallet',
        backgroundColor: Colors.green,
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP,
        duration: const Duration(seconds: 4),
      );
    });
  }
}
