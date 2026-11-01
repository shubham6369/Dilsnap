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
    List<String> parseList(dynamic raw, List<String> fallback) {
      if (raw is List) {
        return raw.map((e) => e?.toString() ?? '').where((s) => s.isNotEmpty).toList();
      } else if (raw is String && raw.isNotEmpty) {
        return raw.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
      }
      return fallback;
    }

    final dynamic rawRating = json['rating'];
    double parsedRating = 4.8;
    if (rawRating is num) {
      parsedRating = rawRating.toDouble();
    } else if (rawRating is String) {
      parsedRating = double.tryParse(rawRating) ?? 4.8;
    }

    final dynamic rawCoins = json['coinRatePerMinute'];
    int parsedCoins = 30;
    if (rawCoins is num) {
      parsedCoins = rawCoins.toInt();
    } else if (rawCoins is String) {
      parsedCoins = int.tryParse(rawCoins) ?? 30;
    }

    final dynamic rawAge = json['age'];
    int parsedAge = 22;
    if (rawAge is num) {
      parsedAge = rawAge.toInt();
    } else if (rawAge is String) {
      parsedAge = int.tryParse(rawAge) ?? 22;
    }

    final dynamic rawCalls = json['totalCalls'];
    int parsedCalls = 0;
    if (rawCalls is num) {
      parsedCalls = rawCalls.toInt();
    } else if (rawCalls is String) {
      parsedCalls = int.tryParse(rawCalls) ?? 0;
    }

    final dynamic rawOnline = json['isOnline'];
    final bool parsedOnline = rawOnline == true || rawOnline == 'true' || rawOnline == 1;

    final dynamic rawInCall = json['isInCall'];
    final bool parsedInCall = rawInCall == true || rawInCall == 'true' || rawInCall == 1;

    return ListenerModel(
      id: json['id']?.toString() ?? '',
      name: (json['name']?.toString() ?? '').trim(),
      age: parsedAge,
      gender: json['gender']?.toString() ?? 'Female',
      avatarUrl: json['avatarUrl']?.toString() ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      languages: parseList(json['languages'], ['Hindi', 'English']),
      interests: parseList(json['interests'], ['Singing', 'Late Night Talk', 'Movies']),
      bio: json['bio']?.toString() ?? 'Verified listener on DilSnap ready to connect!',
      coinRatePerMinute: parsedCoins,
      isOnline: parsedOnline,
      isInCall: parsedInCall,
      rating: parsedRating,
      totalCalls: parsedCalls,
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
