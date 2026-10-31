class GiftModel {
  final String id;
  final String name;
  final int coinCost;
  final String assetPath;
  final bool isGif;

  const GiftModel({
    required this.id,
    required this.name,
    required this.coinCost,
    required this.assetPath,
    this.isGif = false,
  });

  static List<GiftModel> defaultGifts = const [
    GiftModel(
      id: 'gift_like',
      name: 'Thumbs Up',
      coinCost: 5,
      assetPath: 'assets/gif/like.gif',
      isGif: true,
    ),
    GiftModel(
      id: 'gift_heart',
      name: 'Heart Shower',
      coinCost: 15,
      assetPath: 'assets/gif/love.gif',
      isGif: true,
    ),
    GiftModel(
      id: 'gift_box',
      name: 'Mystery Gift',
      coinCost: 30,
      assetPath: 'assets/gif/gift.gif',
      isGif: true,
    ),
    GiftModel(
      id: 'gift_cake',
      name: 'Celebration Cake',
      coinCost: 50,
      assetPath: 'assets/image/cake.png',
      isGif: false,
    ),
    GiftModel(
      id: 'gift_diamond',
      name: 'Blue Diamond',
      coinCost: 100,
      assetPath: 'assets/image/diamond.png',
      isGif: false,
    ),
  ];
}
