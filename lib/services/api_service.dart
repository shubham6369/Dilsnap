import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../core/constants/app_constants.dart';
import '../models/listener_model.dart';
import '../models/coin_package_model.dart';
import '../models/gift_model.dart';

class ApiService extends GetxService {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  ));

  Map<String, dynamic>? _extractMap(dynamic data) {
    if (data == null) return null;
    if (data is Map) {
      return Map<String, dynamic>.from(data);
    }
    if (data is String && data.trim().isNotEmpty) {
      try {
        final decoded = jsonDecode(data);
        if (decoded is Map) {
          return Map<String, dynamic>.from(decoded);
        }
      } catch (e) {
        debugPrint('JSON decode error: $e');
      }
    }
    return null;
  }

  final List<ListenerModel> _mockListeners = [
    ListenerModel(
      id: 'lst_101',
      name: 'Priya Sharma',
      age: 22,
      gender: 'Female',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      languages: ['Hindi', 'English'],
      interests: ['Singing', 'Late Night Talk', 'Movies'],
      bio: 'Sweet, friendly and love listening to your day stories! ✨',
      coinRatePerMinute: 30,
      isOnline: true,
      isInCall: false,
      rating: 4.9,
      totalCalls: 340,
    ),
    ListenerModel(
      id: 'lst_102',
      name: 'Aanya Verma',
      age: 24,
      gender: 'Female',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      languages: ['Hindi', 'Punjabi'],
      interests: ['Dance', 'Travel', 'Fashion'],
      bio: 'Full of positive energy! Call me for fun conversation ❤️',
      coinRatePerMinute: 40,
      isOnline: true,
      isInCall: false,
      rating: 4.8,
      totalCalls: 215,
    ),
    ListenerModel(
      id: 'lst_103',
      name: 'Riya Sen',
      age: 21,
      gender: 'Female',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      languages: ['Bengali', 'Hindi', 'English'],
      interests: ['Poetry', 'Books', 'Chai'],
      bio: 'A good listener is a silent healer. Feel free to open up 🌸',
      coinRatePerMinute: 25,
      isOnline: true,
      isInCall: false,
      rating: 4.9,
      totalCalls: 480,
    ),
    ListenerModel(
      id: 'lst_104',
      name: 'Kabir Mehta',
      age: 25,
      gender: 'Male',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      languages: ['Hindi', 'English'],
      interests: ['Fitness', 'Gaming', 'Music'],
      bio: 'Let’s talk about life, gym, tech or anything under the sun! 🎮',
      coinRatePerMinute: 20,
      isOnline: true,
      isInCall: false,
      rating: 4.7,
      totalCalls: 110,
    ),
    ListenerModel(
      id: 'lst_105',
      name: 'Neha Kapoor',
      age: 23,
      gender: 'Female',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      languages: ['Hindi', 'English', 'Gujarati'],
      interests: ['Cooking', 'Art', 'Romance'],
      bio: 'Always here to brighten your mood and share laughs 😊',
      coinRatePerMinute: 35,
      isOnline: false,
      isInCall: false,
      rating: 4.8,
      totalCalls: 180,
    ),
    ListenerModel(
      id: 'lst_106',
      name: 'Sneha Roy',
      age: 23,
      gender: 'Female',
      avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
      languages: ['Hindi', 'English'],
      interests: ['Music', 'Dating Tips', 'Fun'],
      bio: 'Never feel lonely again. Tap call to connect instantly! 💫',
      coinRatePerMinute: 30,
      isOnline: true,
      isInCall: false,
      rating: 4.9,
      totalCalls: 520,
    ),
  ];

  // Fetch verified hosts from live Vercel Admin API
  Future<List<ListenerModel>> fetchListeners({String? gender, bool onlineOnly = false}) async {
    try {
      final queryParams = <String, dynamic>{
        '_t': DateTime.now().millisecondsSinceEpoch,
      };
      if (gender != null && gender != 'All') queryParams['gender'] = gender;
      if (onlineOnly) queryParams['online'] = 'true';

      final response = await _dio.get(
        '${AppConstants.adminApiUrl}/api/hosts',
        queryParameters: queryParams,
      );

      final map = _extractMap(response.data);
      if (response.statusCode == 200 && map != null && map['success'] == true) {
        final dynamic rawList = map['data'];
        if (rawList is List && rawList.isNotEmpty) {
          final List<ListenerModel> parsed = [];
          for (final item in rawList) {
            try {
              if (item is Map) {
                parsed.add(ListenerModel.fromJson(Map<String, dynamic>.from(item)));
              }
            } catch (itemErr) {
              debugPrint('Error parsing individual host item: $itemErr');
            }
          }
          if (parsed.isNotEmpty) {
            return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('DilSnap ApiService.fetchListeners failed: $e');
    }

    var result = List<ListenerModel>.from(_mockListeners);
    if (gender != null && gender.isNotEmpty && gender != 'All') {
      result = result.where((l) => l.gender.toLowerCase() == gender.toLowerCase()).toList();
    }
    if (onlineOnly) {
      result = result.where((l) => l.isOnline).toList();
    }
    return result;
  }

  // Fetch active coin packages from live Vercel Admin API
  Future<List<CoinPackageModel>> fetchPackages() async {
    try {
      final response = await _dio.get(
        '${AppConstants.adminApiUrl}/api/packages',
        queryParameters: {'_t': DateTime.now().millisecondsSinceEpoch},
      );
      final map = _extractMap(response.data);
      if (response.statusCode == 200 && map != null && map['success'] == true) {
        final dynamic rawList = map['data'];
        if (rawList is List && rawList.isNotEmpty) {
          final List<CoinPackageModel> parsed = [];
          for (final item in rawList) {
            try {
              if (item is Map) {
                parsed.add(CoinPackageModel.fromJson(Map<String, dynamic>.from(item)));
              }
            } catch (err) {
              debugPrint('Error parsing coin package item: $err');
            }
          }
          if (parsed.isNotEmpty) {
            return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('DilSnap ApiService.fetchPackages failed: $e');
    }
    return CoinPackageModel.defaultPackages;
  }

  // Fetch virtual gifts catalog from live Vercel Admin API
  Future<List<GiftModel>> fetchGifts() async {
    try {
      final response = await _dio.get(
        '${AppConstants.adminApiUrl}/api/gifts',
        queryParameters: {'_t': DateTime.now().millisecondsSinceEpoch},
      );
      final map = _extractMap(response.data);
      if (response.statusCode == 200 && map != null && map['success'] == true) {
        final dynamic rawList = map['data'];
        if (rawList is List && rawList.isNotEmpty) {
          final List<GiftModel> parsed = [];
          for (final item in rawList) {
            try {
              if (item is Map) {
                parsed.add(GiftModel.fromJson(Map<String, dynamic>.from(item)));
              }
            } catch (err) {
              debugPrint('Error parsing gift item: $err');
            }
          }
          if (parsed.isNotEmpty) {
            GiftModel.activeGifts = parsed;
            return parsed;
          }
        }
      }
    } catch (e) {
      debugPrint('DilSnap ApiService.fetchGifts failed: $e');
    }
    return GiftModel.activeGifts;
  }

  // Fetch global config & announcements from live Vercel Admin API
  Future<Map<String, dynamic>?> fetchAppConfig() async {
    try {
      final response = await _dio.get(
        '${AppConstants.adminApiUrl}/api/config',
        queryParameters: {'_t': DateTime.now().millisecondsSinceEpoch},
      );
      final map = _extractMap(response.data);
      if (response.statusCode == 200 && map != null && map['success'] == true) {
        final dynamic rawData = map['data'];
        if (rawData is Map) {
          return Map<String, dynamic>.from(rawData);
        }
      }
    } catch (e) {
      debugPrint('DilSnap ApiService.fetchAppConfig failed: $e');
    }
    return null;
  }

  Future<ListenerModel?> findRandomMatch() async {
    await Future.delayed(const Duration(seconds: 1));
    final currentHosts = await fetchListeners(onlineOnly: true);
    final available = currentHosts.where((l) => !l.isInCall).toList();
    if (available.isEmpty) return null;
    available.shuffle();
    return available.first;
  }
}
