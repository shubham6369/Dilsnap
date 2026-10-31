import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import '../../controllers/call_controller.dart';
import '../../controllers/chat_controller.dart';
import '../../controllers/home_controller.dart';
import '../../controllers/wallet_controller.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../chat/chat_list_view.dart';
import '../profile/profile_view.dart';
import '../wallet/wallet_view.dart';
import 'widgets/host_card.dart';
import 'widgets/random_match_modal.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    final walletController = Get.find<WalletController>();
    final callController = Get.find<CallController>();
    final chatController = Get.find<ChatController>();

    return Obx(() {
      final tabIndex = controller.selectedTabIndex.value;

      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Row(
            children: [
              Image.asset('assets/image/logo.png', width: 28, height: 28, errorBuilder: (_, __, ___) => const Icon(Icons.favorite, color: AppColors.primary)),
              const SizedBox(width: 8),
              const Text(AppConstants.appName, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
            ],
          ),
          actions: [
            // Coin Balance Pill
            GestureDetector(
              onTap: () => controller.changeTab(3), // Switch to wallet
              child: Container(
                margin: const EdgeInsets.only(right: 16),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.coinGold.withValues(alpha: 0.4)),
                ),
                child: Row(
                  children: [
                    Image.asset('assets/image/diamond.png', width: 18, height: 18, errorBuilder: (_, __, ___) => const Icon(Icons.monetization_on, size: 18, color: AppColors.coinGold)),
                    const SizedBox(width: 6),
                    Obx(() => Text(
                      '${walletController.coinBalance.value}',
                      style: const TextStyle(color: AppColors.coinGold, fontWeight: FontWeight.bold, fontSize: 13),
                    )),
                    const SizedBox(width: 4),
                    const Icon(Icons.add_circle, color: AppColors.coinGold, size: 14),
                  ],
                ),
              ),
            ),
          ],
        ),
        body: IndexedStack(
          index: tabIndex,
          children: [
            // Tab 0: Explore / Home Feed
            _buildExploreTab(context, callController, chatController),

            // Tab 1: Live Listeners Feed
            _buildLiveTab(context, callController, chatController),

            // Tab 2: Messages / Interactive Chats
            const ChatListView(),

            // Tab 3: Wallet Screen
            const WalletView(),

            // Tab 4: Profile Screen
            const ProfileView(),
          ],
        ),
        bottomNavigationBar: Container(
          decoration: const BoxDecoration(
            color: AppColors.surface,
            border: Border(top: BorderSide(color: Colors.white10)),
          ),
          child: BottomNavigationBar(
            currentIndex: tabIndex,
            onTap: controller.changeTab,
            backgroundColor: AppColors.surface,
            selectedItemColor: AppColors.primary,
            unselectedItemColor: AppColors.textMuted,
            type: BottomNavigationBarType.fixed,
            elevation: 0,
            items: [
              const BottomNavigationBarItem(icon: Icon(Icons.explore_rounded), label: 'Explore'),
              const BottomNavigationBarItem(icon: Icon(Icons.videocam_rounded), label: 'Live'),
              BottomNavigationBarItem(
                icon: Badge(
                  label: const Text('4', style: TextStyle(color: Colors.white, fontSize: 10)),
                  backgroundColor: AppColors.primary,
                  child: const Icon(Icons.chat_bubble_rounded),
                ),
                label: 'Messages',
              ),
              const BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet_rounded), label: 'Wallet'),
              const BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildExploreTab(BuildContext context, CallController callController, ChatController chatController) {
    return RefreshIndicator(
      onRefresh: controller.loadListeners,
      color: AppColors.primary,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),

            // Random 1-on-1 Matching Banner
            GestureDetector(
              onTap: () {
                Get.bottomSheet(const RandomMatchModal(), isDismissible: false);
                controller.triggerRandomMatch().then((_) {
                  if (Get.isBottomSheetOpen == true) {
                    Get.back();
                  }
                });
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: AppColors.purpleGradient,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.purple.withValues(alpha: 0.4),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    )
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: const BoxDecoration(
                        color: Colors.white24,
                        shape: BoxShape.circle,
                      ),
                      child: SvgPicture.asset(
                        'assets/svg/random.svg',
                        width: 28,
                        height: 28,
                        colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('1-on-1 Random Video Match', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                          SizedBox(height: 4),
                          Text('Match with available verified hosts instantly', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 16),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Gender Filter Row
            Row(
              children: [
                _buildFilterChip('All'),
                const SizedBox(width: 8),
                _buildFilterChip('Female'),
                const SizedBox(width: 8),
                _buildFilterChip('Male'),
                const Spacer(),
                GestureDetector(
                  onTap: controller.toggleOnlineOnly,
                  child: Obx(() => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: controller.onlineOnly.value ? AppColors.online.withValues(alpha: 0.15) : AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: controller.onlineOnly.value ? AppColors.online : Colors.white12,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: controller.onlineOnly.value ? AppColors.online : AppColors.textMuted,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Online Only',
                          style: TextStyle(
                            color: controller.onlineOnly.value ? AppColors.online : AppColors.textSecondary,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  )),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Grid of Hosts
            Obx(() {
              if (controller.isLoading.value) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(40),
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                );
              }

              if (controller.listenerList.isEmpty) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(40),
                    child: Text('No listeners found for selected filter.', style: TextStyle(color: AppColors.textMuted)),
                  ),
                );
              }

              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: controller.listenerList.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.70,
                  crossAxisSpacing: 14,
                  mainAxisSpacing: 14,
                ),
                itemBuilder: (context, index) {
                  final listener = controller.listenerList[index];
                  return HostCard(
                    listener: listener,
                    onCall: () => callController.startVideoCall(listener),
                    onAudioCall: () => callController.startAudioCall(listener),
                    onChat: () => chatController.openChat(listener),
                  );
                },
              );
            }),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label) {
    return Obx(() {
      final isSelected = controller.selectedGenderFilter.value == label;
      return GestureDetector(
        onTap: () => controller.setGenderFilter(label),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: isSelected ? AppColors.primary : Colors.white12),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : AppColors.textSecondary,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    });
  }

  Widget _buildLiveTab(BuildContext context, CallController callController, ChatController chatController) {
    return Obx(() {
      final onlineHosts = controller.listenerList.where((l) => l.isOnline).toList();
      return ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: onlineHosts.length,
        itemBuilder: (context, index) {
          final host = onlineHosts[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            color: AppColors.surface,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundImage: NetworkImage(host.avatarUrl),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: AppColors.online,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.surface, width: 2),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(host.name, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16)),
                        const SizedBox(height: 4),
                        Text(host.languages.join(", "), style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Image.asset('assets/image/diamond.png', width: 12, height: 12, errorBuilder: (_, __, ___) => const Icon(Icons.monetization_on, size: 12, color: AppColors.coinGold)),
                            const SizedBox(width: 4),
                            Text('${host.coinRatePerMinute} coins/min', style: const TextStyle(color: AppColors.coinGold, fontSize: 11, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Chat button
                  IconButton(
                    icon: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.white70),
                    onPressed: () => chatController.openChat(host),
                  ),
                  // Audio Call button
                  IconButton(
                    icon: const Icon(Icons.call_rounded, color: Colors.white),
                    onPressed: () => callController.startAudioCall(host),
                  ),
                  // Video Call button
                  IconButton(
                    icon: const Icon(Icons.videocam_rounded, color: AppColors.primary),
                    onPressed: () => callController.startVideoCall(host),
                  ),
                ],
              ),
            ),
          );
        },
      );
    });
  }
}
