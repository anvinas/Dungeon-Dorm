import 'package:flutter/material.dart';
import 'modal_overlay.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';



class SignupModal extends StatefulWidget {
  final VoidCallback onClose;
  const SignupModal({super.key, required this.onClose});

  @override
  State<SignupModal> createState() => _SignupModalState();
}

class _SignupModalState extends State<SignupModal> {
  final _gamerTagController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String error = '';

  Future<void> handleSignup() async {
  final gamerTag = _gamerTagController.text.trim();
  final email = _emailController.text.trim();
  final password = _passwordController.text.trim();

  setState(() => error = '');

  if (gamerTag.isEmpty || email.isEmpty || password.isEmpty) {
    setState(() => error = "Please fill out all fields");
    return;
  }

  final url = Uri.parse('https://dungeons-dorms.online/api/auth/register');
  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'gamerTag': gamerTag,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', data['token']);

      Navigator.pushReplacementNamed(context, '/play');
    } else {
      final data = jsonDecode(response.body);
      setState(() => error = data['error'] ?? 'Signup failed');
    }
  } catch (e) {
    setState(() => error = 'Server error. Please try again later.');
  }
}


  @override
  Widget build(BuildContext context) {
    return ModalOverlay(
      title: "Signup",
      onClose: widget.onClose,
      children: [
        TextField(
          controller: _gamerTagController,
          decoration: const InputDecoration(labelText: "Gamertag"),
        ),
        TextField(
          controller: _emailController,
          decoration: const InputDecoration(labelText: "Email"),
        ),
        TextField(
          controller: _passwordController,
          obscureText: true,
          decoration: const InputDecoration(labelText: "Password"),
        ),
        if (error.isNotEmpty)
          Text(error, style: const TextStyle(color: Colors.red)),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: handleSignup, child: const Text("Signup")),
      ],
    );
  }
}