// ignore_for_file: avoid_print
import 'package:flutter_test/flutter_test.dart';
import 'package:dilsnap/services/api_service.dart';

void main() {
  test('Test API sync with live Vercel admin', () async {
    final apiService = ApiService();
    try {
      final listeners = await apiService.fetchListeners();
      print('Fetched ${listeners.length} listeners:');
      for (final l in listeners) {
        print('- ${l.name} (${l.id})');
      }
      final packages = await apiService.fetchPackages();
      print('Fetched ${packages.length} packages:');
      for (final p in packages) {
        print('- ${p.name} (${p.id}): ${p.coins} coins');
      }
    } catch (e, st) {
      print('FAILED WITH ERROR: $e');
      print(st);
    }
  });
}
