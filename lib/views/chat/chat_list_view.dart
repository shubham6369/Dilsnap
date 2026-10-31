import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/chat_controller.dart';
import '../../controllers/home_controller.dart';
import '../../core/constants/app_colors.dart';

class ChatListView extends GetView<ChatController> {
  const ChatListView({super.key});

  @override
  Widget build(BuildContext context) {
    final homeController = Get.find<HomeController>();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Obx(() {
        final hosts = homeController.listenerList;
        if (hosts.isEmpty) {
          return const Center(child: CircularProgressIndicator(color: AppColors.primary));
        }

        return ListView.separated(
          padding: const EdgeInsets.symmetric(vertical: 12),
          itemCount: hosts.length,
          separatorBuilder: (_, __) => const Divider(color: Colors.white10, height: 1, indent: 76),
          itemBuilder: (context, index) {
            final host = hosts[index];
            final messages = controller.getMessagesFor(host.id);
            final lastMsg = messages.isNotEmpty ? messages.last : null;

            return ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              onTap: () => controller.openChat(host),
              leading: Stack(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundImage: NetworkImage(host.avatarUrl),
                  ),
                  if (host.isOnline)
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        width: 13,
                        height: 13,
                        decoration: BoxDecoration(
                          color: AppColors.online,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.background, width: 2),
                        ),
                      ),
                    ),
                ],
              ),
              title: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    host.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  Text(
                    lastMsg?.formattedTime ?? 'Just now',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                  ),
                ],
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Obx(() {
                  final isTyping = controller.isHostTyping(host.id);
                  if (isTyping) {
                    return const Row(
                      children: [
                        Text(
                          'typing... ',
                          style: TextStyle(color: AppColors.primary, fontStyle: FontStyle.italic, fontSize: 13),
                        ),
                        SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(strokeWidth: 1.5, color: AppColors.primary),
                        ),
                      ],
                    );
                  }

                  return Text(
                    lastMsg?.text ?? 'Tap to chat with ${host.name}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: lastMsg != null && !lastMsg.isUser ? Colors.white70 : AppColors.textMuted,
                      fontSize: 13,
                    ),
                  );
                }),
              ),
              trailing: const Icon(Icons.arrow_forward_ios, color: Colors.white24, size: 14),
            );
          },
        );
      }),
    );
  }
}
