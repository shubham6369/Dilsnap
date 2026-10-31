import 'package:get/get.dart';
import '../models/listener_model.dart';
import '../services/api_service.dart';
import 'call_controller.dart';

class HomeController extends GetxController {
  final ApiService _apiService = Get.find<ApiService>();
  final CallController _callController = Get.find<CallController>();

  final RxInt selectedTabIndex = 0.obs;
  final RxString selectedGenderFilter = 'All'.obs;
  final RxBool onlineOnly = false.obs;

  final RxList<ListenerModel> listenerList = <ListenerModel>[].obs;
  final RxBool isLoading = true.obs;
  final RxBool isMatching = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadListeners();
  }

  void changeTab(int index) {
    selectedTabIndex.value = index;
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
