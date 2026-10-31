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
