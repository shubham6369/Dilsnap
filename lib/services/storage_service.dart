import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../core/constants/app_constants.dart';

class StorageService extends GetxService {
  late final GetStorage _box;

  Future<StorageService> init() async {
    await GetStorage.init();
    _box = GetStorage();
    return this;
  }

  bool get isLoggedIn => _box.read<bool>(AppConstants.keyIsLoggedIn) ?? false;
  set isLoggedIn(bool value) => _box.write(AppConstants.keyIsLoggedIn, value);

  String get userPhone => _box.read<String>(AppConstants.keyUserPhone) ?? '';
  set userPhone(String value) => _box.write(AppConstants.keyUserPhone, value);

  String get userName => _box.read<String>(AppConstants.keyUserName) ?? 'DilSnap User';
  set userName(String value) => _box.write(AppConstants.keyUserName, value);

  String get userGender => _box.read<String>(AppConstants.keyUserGender) ?? 'Male';
  set userGender(String value) => _box.write(AppConstants.keyUserGender, value);

  int get userCoins => _box.read<int>(AppConstants.keyUserCoins) ?? AppConstants.defaultInitialCoins;
  set userCoins(int value) => _box.write(AppConstants.keyUserCoins, value);

  bool get isHost => _box.read<bool>(AppConstants.keyIsHost) ?? false;
  set isHost(bool value) => _box.write(AppConstants.keyIsHost, value);

  int get hostRate => _box.read<int>(AppConstants.keyHostRate) ?? 30;
  set hostRate(int value) => _box.write(AppConstants.keyHostRate, value);

  void clear() {
    _box.erase();
  }
}
