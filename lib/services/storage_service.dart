import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../core/constants/app_constants.dart';

class StorageService extends GetxService {
  GetStorage? _box;
  final Map<String, dynamic> _fallbackMemory = {};

  Future<StorageService> init() async {
    try {
      await GetStorage.init();
      _box = GetStorage();
    } catch (_) {
      // Unit tests or environments without native path_provider channel
    }
    return this;
  }

  T? _read<T>(String key) {
    if (_box != null) {
      try {
        return _box!.read<T>(key);
      } catch (_) {}
    }
    return _fallbackMemory[key] as T?;
  }

  void _write(String key, dynamic value) {
    if (_box != null) {
      try {
        _box!.write(key, value);
      } catch (_) {}
    }
    _fallbackMemory[key] = value;
  }

  bool get isLoggedIn => _read<bool>(AppConstants.keyIsLoggedIn) ?? false;
  set isLoggedIn(bool value) => _write(AppConstants.keyIsLoggedIn, value);

  String get userPhone => _read<String>(AppConstants.keyUserPhone) ?? '';
  set userPhone(String value) => _write(AppConstants.keyUserPhone, value);

  String get userName => _read<String>(AppConstants.keyUserName) ?? 'DilSnap User';
  set userName(String value) => _write(AppConstants.keyUserName, value);

  String get userGender => _read<String>(AppConstants.keyUserGender) ?? 'Male';
  set userGender(String value) => _write(AppConstants.keyUserGender, value);

  int get userCoins => _read<int>(AppConstants.keyUserCoins) ?? AppConstants.defaultInitialCoins;
  set userCoins(int value) => _write(AppConstants.keyUserCoins, value);

  bool get isHost => _read<bool>(AppConstants.keyIsHost) ?? false;
  set isHost(bool value) => _write(AppConstants.keyIsHost, value);

  int get hostRate => _read<int>(AppConstants.keyHostRate) ?? 30;
  set hostRate(int value) => _write(AppConstants.keyHostRate, value);

  String get userId => _read<String>(AppConstants.keyUserId) ?? '';
  set userId(String value) => _write(AppConstants.keyUserId, value);

  String get authToken => _read<String>(AppConstants.keyAuthToken) ?? '';
  set authToken(String value) => _write(AppConstants.keyAuthToken, value);

  void clear() {
    _box?.erase();
    _fallbackMemory.clear();
  }
}
