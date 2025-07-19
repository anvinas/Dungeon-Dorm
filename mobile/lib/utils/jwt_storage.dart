import 'package:shared_preferences/shared_preferences.dart';

/// Store a JWT token in persistent storage.
Future<void> storeJWT(String? token) async {
  if (token != null && token.isNotEmpty) {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt', token);
    print("JWT stored");
  } else {
    print("No JWT to store");
  }
}

/// Fetch a JWT token from storage.
Future<String?> fetchJWT() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('jwt');
  return token;
}
