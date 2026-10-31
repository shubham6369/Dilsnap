class UserModel {
  final String id;
  final String name;
  final String phoneNumber;
  final String gender;
  final String avatarUrl;
  int coinBalance;
  bool isHost;
  int hostRatePerMinute;

  UserModel({
    required this.id,
    required this.name,
    required this.phoneNumber,
    required this.gender,
    required this.avatarUrl,
    this.coinBalance = 120,
    this.isHost = false,
    this.hostRatePerMinute = 30,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      name: json['name'] ?? 'User',
      phoneNumber: json['phoneNumber'] ?? '',
      gender: json['gender'] ?? 'Male',
      avatarUrl: json['avatarUrl'] ?? '',
      coinBalance: json['coinBalance'] ?? 120,
      isHost: json['isHost'] ?? false,
      hostRatePerMinute: json['hostRatePerMinute'] ?? 30,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phoneNumber': phoneNumber,
      'gender': gender,
      'avatarUrl': avatarUrl,
      'coinBalance': coinBalance,
      'isHost': isHost,
      'hostRatePerMinute': hostRatePerMinute,
    };
  }
}
