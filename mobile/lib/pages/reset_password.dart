import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/get_path.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController retypePasswordController = TextEditingController();
  String message = "Please enter a new password.";
  bool loading = false;

  Future<void> _resetPassword(String token) async {
    final newPassword = newPasswordController.text.trim();
    final retypedPassword = retypePasswordController.text.trim();

    // Password validation
    final passwordRegex =
        RegExp(r'^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$');
    if (!passwordRegex.hasMatch(newPassword)) {
      setState(() => message =
          "Password must be at least 5 characters long and include a number & symbol.");
      return;
    }
    if (newPassword != retypedPassword) {
      setState(() => message = "Passwords do not match.");
      return;
    }

    if (token.isEmpty) {
      setState(() => message = "User token not found.");
      return;
    }

    setState(() {
      loading = true;
      message = "Processing...";
    });

    try {
      final response = await http.post(
        Uri.parse('${getPath()}/api/auth/reset-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'token': token, 'newPassword': newPassword}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        // Store token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', data['token']);

        setState(() => message = "✅ Password reset successful!");
        Future.delayed(const Duration(seconds: 1), () {
          Navigator.pushReplacementNamed(context, '/verify');
        });
      } else {
        final data = jsonDecode(response.body);
        setState(() => message = data['error'] ?? "Reset failed. Try again.");
      }
    } catch (e) {
      setState(() => message = "Server error. Please try again.");
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Token from route args
    final token = ModalRoute.of(context)?.settings.arguments as String? ?? '';

    return Scaffold(
      body: Stack(
        children: [
          // Background image
          SizedBox.expand(
            child: Image.asset(
              'assets/login/pixel_bg2.png',
              fit: BoxFit.cover,
            ),
          ),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  width: MediaQuery.of(context).size.width * 0.9,
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        "Password Reset",
                        style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white),
                      ),
                      const SizedBox(height: 20),
                      // New password
                      TextField(
                        controller: newPasswordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: "New Password",
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 10),
                      // Retype password
                      TextField(
                        controller: retypePasswordController,
                        obscureText: true,
                        decoration: const InputDecoration(
                          labelText: "Re-type Password",
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        "Password should have at least 5 characters, including a number & symbol (!,@ etc).",
                        style: TextStyle(color: Colors.white, fontSize: 12),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: loading ? null : () => _resetPassword(token),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6b8e23),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                        ),
                        child: loading
                            ? const CircularProgressIndicator(
                                color: Colors.white,
                              )
                            : const Text(
                                "Reset Password",
                                style: TextStyle(
                                    color: Colors.white, fontSize: 18),
                              ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        message,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
