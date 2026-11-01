import 'dart:async';
import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import '../models/listener_model.dart';
import '../services/api_service.dart';
import 'call_controller.dart';

class HomeController extends GetxController with WidgetsBindingObserver {
  final ApiService _apiService = Get.find<ApiService>();
  final CallController _callController = Get.find<CallController>();

  final RxInt selectedTabIndex = 0.obs;
  final RxString selectedGenderFilter = 'All'.obs;
  final RxBool onlineOnly = false.obs;

  final RxList<ListenerModel> listenerList = <ListenerModel>[].obs;
  final RxBool isLoading = true.obs;
  final RxBool isMatching = false.obs;

  // Dynamic live announcements from Admin Panel
  final RxBool announcementActive = false.obs;
  final RxString announcementTitle = ''.obs;
  final RxString announcementMessage = ''.obs;

  Timer? _periodicSyncTimer;

  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance.addObserver(this);
    loadListeners();
    checkAppConfig();

    // Auto-poll live admin updates every 25 seconds
    _periodicSyncTimer = Timer.periodic(const Duration(seconds: 25), (_) {
      silentSync();
    });
  }

  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    _periodicSyncTimer?.cancel();
    super.onClose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      silentSync();
    }
  }

  Future<void> silentSync() async {
    try {
      checkAppConfig();
      final list = await _apiService.fetchListeners(
        gender: selectedGenderFilter.value,
        onlineOnly: onlineOnly.value,
      );
      if (list.isNotEmpty) {
        listenerList.assignAll(list);
      }
    } catch (_) {}
  }

  Future<void> checkAppConfig() async {
    final cfg = await _apiService.fetchAppConfig();
    if (cfg != null && cfg['broadcastNotice'] != null) {
      final notice = cfg['broadcastNotice'];
      announcementActive.value = notice['active'] == true;
      announcementTitle.value = notice['title'] ?? '';
      announcementMessage.value = notice['message'] ?? '';
    }
  }

  void changeTab(int index) {
    selectedTabIndex.value = index;
    // Auto-sync data when user clicks tabs
    if (index == 0 || index == 1) {
      silentSync();
    }
  }

  void setGenderFilter(String gender) {
    selectedGenderFilter.value = gender;
    loadListeners();
  }

  void toggleOnlineOnly() {
    onlineOnly.value = !onlineOnly.value;
    loadListeners();
  }

  Future<void> loadListeners() async {
    isLoading.value = true;
    try {
      checkAppConfig();
      final list = await _apiService.fetchListeners(
        gender: selectedGenderFilter.value,
        onlineOnly: onlineOnly.value,
      );
      listenerList.assignAll(list);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> triggerRandomMatch() async {
    isMatching.value = true;
    final match = await _apiService.findRandomMatch();
    isMatching.value = false;

    if (match != null) {
      _callController.startCall(match);
    } else {
      Get.snackbar('No Matches Found', 'All hosts are currently busy in calls. Please try in 1 minute.',
          snackPosition: SnackPosition.BOTTOM);
    }
  }
}
