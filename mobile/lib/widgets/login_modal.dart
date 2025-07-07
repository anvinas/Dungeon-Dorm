import 'package:flutter/material.dart';
import 'modal_overlay.dart';

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

  void handleLogin() {
    final gamerTag = _gamerTagController.text;
    final password = _passwordController.text;

    setState(() => error = '');

    if (gamerTag.isEmpty || password.isEmpty) {
      setState(() => error = "Please fill out all fields");
      return;
    }

    // Simulate login success
    Navigator.pushReplacementNamed(context, '/play');
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
