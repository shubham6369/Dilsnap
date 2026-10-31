class ChatMessageModel {
  final String id;
  final String hostId;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final bool isGift;
  final String? giftName;
  final String? giftAsset;
  final int? coins;

  const ChatMessageModel({
    required this.id,
    required this.hostId,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.isGift = false,
    this.giftName,
    this.giftAsset,
    this.coins,
  });

  String get formattedTime {
    final hour = timestamp.hour.toString().padLeft(2, '0');
    final minute = timestamp.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
