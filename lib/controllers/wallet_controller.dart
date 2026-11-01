import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../models/coin_package_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class WalletController extends GetxController {
  final StorageService _storage = Get.find<StorageService>();
  final ApiService _apiService = Get.find<ApiService>();

  final RxInt coinBalance = 120.obs;
  final RxBool isPurchasing = false.obs;
  final RxList<CoinPackageModel> packages = <CoinPackageModel>[].obs;
  final RxBool isLoadingPackages = true.obs;

  @override
  void onInit() {
    super.onInit();
    coinBalance.value = _storage.userCoins;
    loadPackages();
    fetchBalanceFromBackend();
  }

  Future<void> fetchBalanceFromBackend() async {
    final userIdentifier = _storage.userId.isNotEmpty ? _storage.userId : _storage.userPhone;
    if (userIdentifier.isEmpty) return;

    final remoteBalance = await _apiService.fetchWalletBalance(userIdentifier);
    if (remoteBalance != null) {
      coinBalance.value = remoteBalance;
      _storage.userCoins = remoteBalance;
    }
  }

  Future<void> loadPackages() async {
    isLoadingPackages.value = true;
    try {
      final list = await _apiService.fetchPackages();
      packages.assignAll(list);
    } finally {
      isLoadingPackages.value = false;
    }
  }

  void refreshBalance() {
    fetchBalanceFromBackend();
    loadPackages();
  }

  bool deductCoins(int amount, {String reason = 'Wallet deduction'}) {
    if (coinBalance.value >= amount) {
      coinBalance.value -= amount;
      _storage.userCoins = coinBalance.value;

      final userIdentifier = _storage.userId.isNotEmpty ? _storage.userId : _storage.userPhone;
      if (userIdentifier.isNotEmpty) {
        _apiService.deductWalletCoins(
          userId: userIdentifier,
          amount: amount,
          reason: reason,
        ).then((res) {
          if (res != null && res['data'] is Map) {
            final serverBal = res['data']['newBalance'];
            if (serverBal is int) {
              coinBalance.value = serverBal;
              _storage.userCoins = serverBal;
            }
          }
        });
      }
      return true;
    }
    return false;
  }

  void addCoins(int amount, {String reason = 'Wallet coin recharge'}) {
    coinBalance.value += amount;
    _storage.userCoins = coinBalance.value;

    final userIdentifier = _storage.userId.isNotEmpty ? _storage.userId : _storage.userPhone;
    if (userIdentifier.isNotEmpty) {
      _apiService.creditWalletCoins(
        userId: userIdentifier,
        amount: amount,
        reason: reason,
      ).then((res) {
        if (res != null && res['data'] is Map) {
          final serverBal = res['data']['newBalance'];
          if (serverBal is int) {
            coinBalance.value = serverBal;
            _storage.userCoins = serverBal;
          }
        }
      });
    }
  }

  void purchasePackage(CoinPackageModel package) async {
    isPurchasing.value = true;
    final userIdentifier = _storage.userId.isNotEmpty ? _storage.userId : _storage.userPhone;

    String? orderId;
    if (userIdentifier.isNotEmpty) {
      final orderRes = await _apiService.createPaymentOrder(
        userId: userIdentifier,
        packageId: package.id,
      );
      if (orderRes != null && orderRes['data'] is Map) {
        orderId = orderRes['data']['orderId']?.toString();
      }
    }

    // Cashfree Seamless Payment checkout bottomsheet
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
                  _processPaymentSuccess(package, orderId: orderId);
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

  void _processPaymentSuccess(CoinPackageModel package, {String? orderId}) async {
    final totalAdded = package.coins + package.bonusCoins;

    if (orderId != null && orderId.isNotEmpty) {
      final verifyRes = await _apiService.verifyPaymentOrder(orderId: orderId);
      if (verifyRes != null && verifyRes['data'] is Map) {
        final newBal = verifyRes['data']['newBalance'];
        if (newBal is int) {
          coinBalance.value = newBal;
          _storage.userCoins = newBal;
        } else {
          addCoins(totalAdded, reason: 'Purchased ${package.name}');
        }
      } else {
        addCoins(totalAdded, reason: 'Purchased ${package.name}');
      }
    } else {
      addCoins(totalAdded, reason: 'Purchased ${package.name}');
    }

    isPurchasing.value = false;
    Get.snackbar(
      'Payment Successful! 🎉',
      'Added $totalAdded coins to your DilSnap wallet',
      backgroundColor: Colors.green,
      colorText: Colors.white,
      snackPosition: SnackPosition.TOP,
      duration: const Duration(seconds: 4),
    );
  }
}
