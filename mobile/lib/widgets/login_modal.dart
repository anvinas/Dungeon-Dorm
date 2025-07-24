import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/get_path.dart';
import '../utils/jwt_storage.dart';
import '../pages/play_page.dart';
import '../pages/select_character.dart';

class LoginModal extends StatefulWidget {
  final bool isOpen;
  final VoidCallback onClose;

  const LoginModal({Key? key, required this.isOpen, required this.onClose})
      : super(key: key);

  @override
  _LoginModalState createState() => _LoginModalState();
}

class _LoginModalState extends State<LoginModal> {
  final TextEditingController gamerTagController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController emailController = TextEditingController();

  String error = "";
  bool forgotPasswordMode = false;

  Future<void> handleLogin() async {
    final String gamerTag = gamerTagController.text.trim();
    final String password = passwordController.text.trim();

    if (gamerTag.isEmpty || password.isEmpty) {
      setState(() => error = "Please fill in all fields.");
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('${getPath()}/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({"gamerTag": gamerTag, "password": password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await storeJWT(data['token']);

        // Fetch user profile
        final profileResponse = await http.get(
          Uri.parse('${getPath()}/api/auth/profile'),
          headers: {
            'Authorization': 'Bearer ${data['token']}',
            'Content-Type': 'application/json'
          },
        );

        if (profileResponse.statusCode == 200) {
          final profileData = jsonDecode(profileResponse.body);
          if (profileData['userProfile']['Character'] == null) {
            Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                    builder: (_) => CharacterSelectPage()));
          } else {
            Navigator.pushReplacement(
                context, MaterialPageRoute(builder: (_) => const GameMapPage()));
          }
        } else {
          setState(() => error = "Failed to fetch user profile.");
        }
      } else {
        final data = jsonDecode(response.body);
        setState(() => error = data['error'] ?? "Login failed.");
      }
    } catch (e) {
      setState(() => error = "Server error. Please try again later.");
    }
  }

  Future<void> sendResetLink() async {
    final email = emailController.text.trim();
    if (email.isEmpty) {
      setState(() => error = "Please enter your email.");
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('${getPath()}/api/auth/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({"email": email}),
      );

      if (response.statusCode == 200) {
        setState(() => "Reset link sent to your email!");
      } else {
        final data = jsonDecode(response.body);
        setState(() => error = data['error'] ?? "Failed to send reset link.");
      }
    } catch (e) {
      setState(() => error = "Server error. Please try again later.");
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isOpen) return const SizedBox.shrink();

    return Scaffold(
      backgroundColor: Colors.black.withOpacity(0.85),
      body: Center(
        child: Container(
          width: MediaQuery.of(context).size.width * 0.8,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    forgotPasswordMode ? "Forgot Password" : "Login",
                    style:
                        const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  GestureDetector(
                    onTap: widget.onClose,
                    child: const Icon(Icons.close, color: Colors.red),
                  )
                ],
              ),
              const SizedBox(height: 20),

              if (!forgotPasswordMode) ...[
                TextField(
                  controller: gamerTagController,
                  decoration: const InputDecoration(
                    labelText: 'GamerTag',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 10),
                Align(
                  alignment: Alignment.centerRight,
                  child: GestureDetector(
                    onTap: () => setState(() => forgotPasswordMode = true),
                    child: const Text(
                      "Forgot password?",
                      style: TextStyle(color: Colors.blue),
                    ),
                  ),
                ),
              ] else ...[
                TextField(
                  controller: emailController,
                  decoration: const InputDecoration(
                    labelText: 'Enter your email',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 10),
                ElevatedButton(
                  onPressed: sendResetLink,
                  child: const Text("Send Reset Link"),
                ),
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: () => setState(() => forgotPasswordMode = false),
                  child: const Text(
                    "Back to Login",
                    style: TextStyle(color: Colors.blue),
                  ),
                ),
              ],

              const SizedBox(height: 20),
              if (!forgotPasswordMode)
                ElevatedButton(
                  onPressed: handleLogin,
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    child: Text("Login", style: TextStyle(fontSize: 18)),
                  ),
                ),
              if (error.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(error, style: const TextStyle(color: Colors.red)),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
