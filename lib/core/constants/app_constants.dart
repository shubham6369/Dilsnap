class AppConstants {
  static const String appName = 'DilSnap';
  static const String appTagline = 'Connect, Chat & Video Call in Seconds';
  
  // Storage Keys
  static const String keyIsLoggedIn = 'is_logged_in';
  static const String keyUserPhone = 'user_phone';
  static const String keyUserName = 'user_name';
  static const String keyUserGender = 'user_gender';
  static const String keyUserCoins = 'user_coins';
  static const String keyIsHost = 'is_host';
  static const String keyHostRate = 'host_coin_rate';

  // Default values
  static const int defaultInitialCoins = 120; // Free welcome bonus
  static const int defaultCoinPerMin = 40;
  
  // Endpoints
  static const String baseUrl = 'https://api.masticall.in';
  static const String socketUrl = 'https://api.masticall.in';
  
  // Vercel Admin Backend URL (Change to your deployed Vercel domain)
  static const String adminApiUrl = 'https://dilsnap-admin.vercel.app';
}
