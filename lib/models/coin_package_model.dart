class CoinPackageModel {
  final String id;
  final String name;
  final int coins;
  final int bonusCoins;
  final double priceInr;
  final String iconAsset;
  final bool isPopular;

  const CoinPackageModel({
    required this.id,
    required this.name,
    required this.coins,
    required this.bonusCoins,
    required this.priceInr,
    required this.iconAsset,
    this.isPopular = false,
  });

  factory CoinPackageModel.fromJson(Map<String, dynamic> json) {
    final dynamic rawCoins = json['coins'];
    int coinAmount = 100;
    if (rawCoins is num) {
      coinAmount = rawCoins.toInt();
    } else if (rawCoins is String) {
      coinAmount = int.tryParse(rawCoins) ?? 100;
    }

    final dynamic rawBonus = json['bonusCoins'];
    int bonusAmount = 0;
    if (rawBonus is num) {
      bonusAmount = rawBonus.toInt();
    } else if (rawBonus is String) {
      bonusAmount = int.tryParse(rawBonus) ?? 0;
    }

    final dynamic rawPrice = json['priceInr'];
    double price = 99.0;
    if (rawPrice is num) {
      price = rawPrice.toDouble();
    } else if (rawPrice is String) {
      price = double.tryParse(rawPrice) ?? 99.0;
    }

    final dynamic rawPopular = json['isPopular'];
    final bool isPop = rawPopular == true || rawPopular == 'true' || rawPopular == 1;

    String icon = 'assets/image/emerald.png';
    if (coinAmount >= 1500) {
      icon = 'assets/image/diamond.png';
    } else if (coinAmount >= 650) {
      icon = 'assets/image/sapphire.png';
    } else if (coinAmount >= 300) {
      icon = 'assets/image/ruby.png';
    }

    return CoinPackageModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Coins Pack',
      coins: coinAmount,
      bonusCoins: bonusAmount,
      priceInr: price,
      iconAsset: icon,
      isPopular: isPop,
    );
  }

  static List<CoinPackageModel> defaultPackages = const [
    CoinPackageModel(
      id: 'pkg_emerald',
      name: 'Emerald Pack',
      coins: 100,
      bonusCoins: 10,
      priceInr: 99.0,
      iconAsset: 'assets/image/emerald.png',
    ),
    CoinPackageModel(
      id: 'pkg_ruby',
      name: 'Ruby Pack',
      coins: 300,
      bonusCoins: 50,
      priceInr: 249.0,
      iconAsset: 'assets/image/ruby.png',
      isPopular: true,
    ),
    CoinPackageModel(
      id: 'pkg_sapphire',
      name: 'Sapphire Pack',
      coins: 650,
      bonusCoins: 120,
      priceInr: 499.0,
      iconAsset: 'assets/image/sapphire.png',
    ),
    CoinPackageModel(
      id: 'pkg_diamond',
      name: 'Diamond VIP',
      coins: 1500,
      bonusCoins: 350,
      priceInr: 999.0,
      iconAsset: 'assets/image/diamond.png',
    ),
  ];
}
