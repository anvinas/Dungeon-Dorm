import 'package:flutter/material.dart';
import 'modal_overlay.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';


class LoginModal extends StatefulWidget {
  final VoidCallback onClose;
  const LoginModal({super.key, required this.onClose});

  @override
  State<LoginModal> createState() => _LoginModalState();
}

class _LoginModalState extends State<LoginModal> {
  final _gamerTagController = TextEditingController();
  final _passwordController = TextEditingController();
  String error = '';

  Future<void> handleLogin() async {
  final gamerTag = _gamerTagController.text.trim();
  final password = _passwordController.text.trim();

  setState(() => error = '');

  if (gamerTag.isEmpty || password.isEmpty) {
    setState(() => error = "Please fill out all fields");
    return;
  }

  final url = Uri.parse('https://dungeons-dorms.online/api/auth/login');
  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'gamerTag': gamerTag, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', data['token']);

      Navigator.pushReplacementNamed(context, '/select');
    } else {
      final data = jsonDecode(response.body);
      setState(() => error = data['error'] ?? 'Login failed');
    }
  } catch (e) {
    setState(() => error = 'Server error. Please try again later.');
  }
}


  @override
  Widget build(BuildContext context) {
    return ModalOverlay(
      title: "Login",
      onClose: widget.onClose,
      children: [
        TextField(
          controller: _gamerTagController,
          decoration: const InputDecoration(labelText: "Gamertag"),
        ),
        TextField(
          controller: _passwordController,
          obscureText: true,
          decoration: const InputDecoration(labelText: "Password"),
        ),
        if (error.isNotEmpty)
          Text(error, style: const TextStyle(color: Colors.red)),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: handleLogin, child: const Text("Login")),
      ],
    );
  }
}
