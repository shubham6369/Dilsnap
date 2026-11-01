import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/call_controller.dart';
import '../../controllers/chat_controller.dart';
import '../../controllers/wallet_controller.dart';
import '../../core/constants/app_colors.dart';
import '../../models/chat_message_model.dart';
import '../../models/gift_model.dart';

class ChatDetailView extends StatefulWidget {
  const ChatDetailView({super.key});

  @override
  State<ChatDetailView> createState() => _ChatDetailViewState();
}

class _ChatDetailViewState extends State<ChatDetailView> {
  final ChatController chatController = Get.find<ChatController>();
  final CallController callController = Get.find<CallController>();
  final WalletController walletController = Get.find<WalletController>();
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final host = chatController.activeHost.value;
    if (host == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chat')),
        body: const Center(child: Text('No host selected')),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 19,
              backgroundImage: NetworkImage(host.avatarUrl),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    host.name,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  Obx(() {
                    final isTyping = chatController.isHostTyping(host.id);
                    return Text(
                      isTyping ? 'typing...' : 'Online',
                      style: TextStyle(
                        fontSize: 11,
                        color: isTyping ? AppColors.primary : AppColors.online,
                        fontWeight: isTyping ? FontWeight.bold : FontWeight.normal,
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
        actions: [
          // Audio Call button
          IconButton(
            icon: const Icon(Icons.call_rounded, color: Colors.white),
            tooltip: 'Audio Call',
            onPressed: () => callController.startAudioCall(host),
          ),
          // Video Call button
          IconButton(
            icon: const Icon(Icons.videocam_rounded, color: AppColors.primary),
            tooltip: 'Video Call',
            onPressed: () => callController.startVideoCall(host),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          // Message List
          Expanded(
            child: Obx(() {
              final messages = chatController.getMessagesFor(host.id);
              _scrollToBottom();

              return ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                itemCount: messages.length,
                itemBuilder: (context, index) {
                  final msg = messages[index];
                  final isUser = msg.isUser;

                  if (msg.isGift) {
                    return _buildGiftBubble(msg);
                  }

                  return Align(
                    alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                      decoration: BoxDecoration(
                        gradient: isUser ? AppColors.primaryGradient : null,
                        color: isUser ? null : AppColors.surface,
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(16),
                          topRight: const Radius.circular(16),
                          bottomLeft: Radius.circular(isUser ? 16 : 4),
                          bottomRight: Radius.circular(isUser ? 4 : 16),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.15),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          )
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                        children: [
                          Text(
                            msg.text,
                            style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.3),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                msg.formattedTime,
                                style: const TextStyle(color: Colors.white54, fontSize: 10),
                              ),
                              if (isUser) ...[
                                const SizedBox(width: 4),
                                const Icon(Icons.done_all, color: Colors.white70, size: 14),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            }),
          ),

          // Typing indicator banner
          Obx(() {
            if (!chatController.isHostTyping(host.id)) return const SizedBox.shrink();
            return Container(
              alignment: Alignment.centerLeft,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
              child: Row(
                children: [
                  CircleAvatar(radius: 8, backgroundImage: NetworkImage(host.avatarUrl)),
                  const SizedBox(width: 6),
                  Text(
                    '${host.name} is typing...',
                    style: const TextStyle(color: AppColors.primary, fontStyle: FontStyle.italic, fontSize: 12),
                  ),
                ],
              ),
            );
          }),

          // Input field row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(top: BorderSide(color: Colors.white10)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // Gift Button in chat
                  IconButton(
                    icon: const Icon(Icons.card_giftcard, color: Colors.pinkAccent),
                    onPressed: () => _openChatGiftSheet(context, host.id),
                  ),
                  // Text input
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: TextField(
                        controller: _textController,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: const InputDecoration(
                          hintText: 'Type your message...',
                          hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14),
                          border: InputBorder.none,
                        ),
                        onSubmitted: (text) {
                          if (text.trim().isNotEmpty) {
                            chatController.sendMessage(host.id, text);
                            _textController.clear();
                          }
                        },
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Send button
                  GestureDetector(
                    onTap: () {
                      final text = _textController.text;
                      if (text.trim().isNotEmpty) {
                        chatController.sendMessage(host.id, text);
                        _textController.clear();
                      }
                    },
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGiftBubble(ChatMessageModel msg) {
    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF6A1B9A), Color(0xFF8E24AA)],
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.amber, width: 1.5),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              msg.giftAsset ?? 'assets/image/diamond.png',
              width: 36,
              height: 36,
              errorBuilder: (_, __, ___) => const Icon(Icons.card_giftcard, color: Colors.white),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Sent ${msg.giftName ?? "Gift"} 🎁',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
                Text(
                  '${msg.coins ?? 0} coins deducted',
                  style: const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _openChatGiftSheet(BuildContext context, String hostId) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1B1926),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Send In-Chat Gift 🎁', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  Obx(() => Text(
                    'Balance: ${walletController.coinBalance.value} 💎',
                    style: const TextStyle(color: AppColors.coinGold, fontWeight: FontWeight.bold),
                  )),
                ],
              ),
              const SizedBox(height: 16),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.85,
                ),
                itemCount: GiftModel.activeGifts.length,
                itemBuilder: (ctx, idx) {
                  final gift = GiftModel.activeGifts[idx];
                  return GestureDetector(
                    onTap: () {
                      Navigator.pop(ctx);
                      chatController.sendGiftInChat(hostId, gift);
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Image.asset(
                            gift.assetPath,
                            width: 50,
                            height: 50,
                            errorBuilder: (_, __, ___) => const Icon(Icons.card_giftcard, color: Colors.pinkAccent),
                          ),
                          const SizedBox(height: 6),
                          Text(gift.name, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold), maxLines: 1),
                          const SizedBox(height: 4),
                          Text('${gift.coinCost} 💎', style: const TextStyle(color: AppColors.coinGold, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
