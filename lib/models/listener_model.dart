class ListenerModel {
  final String id;
  final String name;
  final int age;
  final String gender;
  final String avatarUrl;
  final List<String> languages;
  final List<String> interests;
  final String bio;
  final int coinRatePerMinute;
  final bool isOnline;
  final bool isInCall;
  final double rating;
  final int totalCalls;

  ListenerModel({
    required this.id,
    required this.name,
    required this.age,
    required this.gender,
    required this.avatarUrl,
    required this.languages,
    required this.interests,
    required this.bio,
    required this.coinRatePerMinute,
    required this.isOnline,
    this.isInCall = false,
    this.rating = 4.8,
    this.totalCalls = 120,
  });

  factory ListenerModel.fromJson(Map<String, dynamic> json) {
    return ListenerModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      age: json['age'] ?? 22,
      gender: json['gender'] ?? 'Female',
      avatarUrl: json['avatarUrl'] ?? '',
      languages: List<String>.from(json['languages'] ?? []),
      interests: List<String>.from(json['interests'] ?? []),
      bio: json['bio'] ?? '',
      coinRatePerMinute: json['coinRatePerMinute'] ?? 30,
      isOnline: json['isOnline'] ?? true,
      isInCall: json['isInCall'] ?? false,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      totalCalls: json['totalCalls'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'age': age,
      'gender': gender,
      'avatarUrl': avatarUrl,
      'languages': languages,
      'interests': interests,
      'bio': bio,
      'coinRatePerMinute': coinRatePerMinute,
      'isOnline': isOnline,
      'isInCall': isInCall,
      'rating': rating,
      'totalCalls': totalCalls,
    };
  }
}
