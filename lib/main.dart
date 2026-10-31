import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'controllers/auth_controller.dart';
import 'controllers/call_controller.dart';
import 'controllers/chat_controller.dart';
import 'controllers/home_controller.dart';
import 'controllers/wallet_controller.dart';
import 'core/theme/app_theme.dart';
import 'services/api_service.dart';
import 'services/storage_service.dart';
import 'services/webrtc_service.dart';
import 'views/auth/login_view.dart';
import 'views/auth/otp_view.dart';
import 'views/auth/profile_setup_view.dart';
import 'views/call/audio_call_view.dart';
import 'views/call/video_call_view.dart';
import 'views/chat/chat_detail_view.dart';
import 'views/home/home_view.dart';
import 'views/splash/splash_view.dart';
import 'views/wallet/wallet_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set immersive dark status bar
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0F0E17),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  // Initialize Core Services
  final storageService = await StorageService().init();
  Get.put<StorageService>(storageService);
  Get.put<ApiService>(ApiService());
  Get.put<WebRTCService>(WebRTCService());

  // Initialize Core Controllers
  Get.put<WalletController>(WalletController());
  Get.put<ChatController>(ChatController());
  Get.put<CallController>(CallController());
  Get.put<HomeController>(HomeController());
  Get.put<AuthController>(AuthController());

  runApp(const DilSnapApp());
}

class DilSnapApp extends StatelessWidget {
  const DilSnapApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'DilSnap',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      initialRoute: '/splash',
      getPages: [
        GetPage(name: '/splash', page: () => const SplashView()),
        GetPage(name: '/login', page: () => const LoginView()),
        GetPage(name: '/otp', page: () => const OtpView()),
        GetPage(name: '/profile-setup', page: () => const ProfileSetupView()),
        GetPage(name: '/home', page: () => const HomeView()),
        GetPage(name: '/video-call', page: () => const VideoCallView()),
        GetPage(name: '/audio-call', page: () => const AudioCallView()),
        GetPage(name: '/chat-detail', page: () => const ChatDetailView()),
        GetPage(name: '/wallet', page: () => const Scaffold(body: SafeArea(child: WalletView()))),
      ],
    );
  }
}
