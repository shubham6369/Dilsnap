import 'package:dio/dio.dart';
import 'package:get/get.dart';
import '../core/constants/app_constants.dart';
import '../models/listener_model.dart';

class ApiService extends GetxService {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 3),
    receiveTimeout: const Duration(seconds: 3),
  ));
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

  Future<List<ListenerModel>> fetchListeners({String? gender, bool onlineOnly = false}) async {
    // Attempt dynamic fetch from Vercel Admin Backend
    try {
      final queryParams = <String, dynamic>{};
      if (gender != null && gender != 'All') queryParams['gender'] = gender;
      if (onlineOnly) queryParams['online'] = 'true';

      final response = await _dio.get(
        '${AppConstants.adminApiUrl}/api/hosts',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List raw = response.data['data'] ?? [];
        if (raw.isNotEmpty) {
          return raw.map((json) => ListenerModel.fromJson(json)).toList();
        }
      }
    } catch (_) {
      // Graceful offline fallback
    }

    // High quality offline fallback
    await Future.delayed(const Duration(milliseconds: 200));
    var result = List<ListenerModel>.from(_mockListeners);
    if (gender != null && gender.isNotEmpty && gender != 'All') {
      result = result.where((l) => l.gender.toLowerCase() == gender.toLowerCase()).toList();
    }
    if (onlineOnly) {
      result = result.where((l) => l.isOnline).toList();
    }
    return result;
  }

  Future<ListenerModel?> findRandomMatch() async {
    await Future.delayed(const Duration(seconds: 2));
    final online = _mockListeners.where((l) => l.isOnline && !l.isInCall).toList();
    if (online.isEmpty) return null;
    online.shuffle();
    return online.first;
  }
}
