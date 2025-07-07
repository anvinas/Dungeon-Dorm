import 'package:flutter/material.dart';
import 'modal_overlay.dart';

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

  void handleSignup() {
    final gamerTag = _gamerTagController.text;
    final email = _emailController.text;
    final password = _passwordController.text;

    setState(() => error = '');

    if (gamerTag.isEmpty || email.isEmpty || password.isEmpty) {
      setState(() => error = "Please fill out all fields");
      return;
    }

    // Simulate signup success
    Navigator.pushReplacementNamed(context, '/play');
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