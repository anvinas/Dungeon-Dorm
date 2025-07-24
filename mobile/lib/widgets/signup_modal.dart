import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/get_path.dart';

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

  String globalError = '';
  bool isLoading = false;

  // Field-specific error flags (like React's inputErrorDisplay)
  bool gamerTagError = false;
  bool emailError = false;
  bool passwordError = false;

  Future<void> handleSignup() async {
  final gamerTag = _gamerTagController.text.trim();
  final email = _emailController.text.trim();
  final password = _passwordController.text.trim();

  print("DEBUG: Starting signup...");
  print("DEBUG: Input values => gamerTag: '$gamerTag', email: '$email', password length: ${password.length}");

  setState(() {
    globalError = '';
    gamerTagError = false;
    emailError = false;
    passwordError = false;
    isLoading = true;
  });

  // Password validation
  final passwordRegex =
      RegExp(r'^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$');
  if (!passwordRegex.hasMatch(password)) {
    print("DEBUG: Password validation failed.");
    setState(() {
      globalError =
          "Password must be at least 5 characters long and include a number & symbol.";
      isLoading = false;
    });
    return;
  }

  // Field validation
  bool hasErrors = false;
  if (gamerTag.isEmpty) {
    print("DEBUG: Gamertag is empty.");
    gamerTagError = true;
    hasErrors = true;
  }
  if (email.isEmpty) {
    print("DEBUG: Email is empty.");
    emailError = true;
    hasErrors = true;
  }
  if (password.isEmpty) {
    print("DEBUG: Password is empty.");
    passwordError = true;
    hasErrors = true;
  }
  if (hasErrors) {
    print("DEBUG: Field validation failed. Errors present.");
    setState(() => isLoading = false);
    return;
  }

  // API request
  final url = Uri.parse('${getPath()}/api/auth/register');
  print("DEBUG: Sending POST request to $url");

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

    print("DEBUG: Response status: ${response.statusCode}");
    print("DEBUG: Raw response body: ${response.body}");

    if (response.statusCode == 200 || response.statusCode == 201) {
      print("DEBUG: Signup successful. Parsing response...");
      final data = jsonDecode(response.body);
      print("DEBUG: Received token: ${data['token']}");

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('jwt_token', data['token']);
      print("DEBUG: Token saved to SharedPreferences.");

      if (mounted) {
        print("DEBUG: Navigating to /verify...");
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Account created! Redirecting...")),
        );
        await Future.delayed(const Duration(seconds: 1));
        Navigator.of(context, rootNavigator: true).pushReplacementNamed('/verify');
      }
    } else {
      print("DEBUG: Signup failed. Status: ${response.statusCode}");
      try {
        final data = jsonDecode(response.body);
        print("DEBUG: Server error message: ${data['error']}");
        setState(() => globalError = data['error'] ?? 'Signup failed.');
      } catch (decodeError) {
        print("DEBUG: Failed to decode error response: $decodeError");
        setState(() => globalError = 'Signup failed. Please try again.');
      }
    }
  } catch (e) {
    print("DEBUG: Exception during signup: $e");
    setState(() => globalError = 'Server error. Please try again later.');
  }

  setState(() => isLoading = false);
  print("DEBUG: Signup process finished.");
}


  @override
  Widget build(BuildContext context) {
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
                  const Text(
                    "Signup",
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  GestureDetector(
                    onTap: widget.onClose,
                    child: const Icon(Icons.close, color: Colors.red),
                  )
                ],
              ),
              const SizedBox(height: 20),

              // Gamertag
              TextField(
                controller: _gamerTagController,
                decoration: InputDecoration(
                  labelText: "Gamertag",
                  border: const OutlineInputBorder(),
                  errorText: gamerTagError ? "Please input a valid gamertag" : null,
                ),
              ),
              const SizedBox(height: 10),

              // Email
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: "Email",
                  border: const OutlineInputBorder(),
                  errorText: emailError ? "Please input a valid email" : null,
                ),
              ),
              const SizedBox(height: 10),

              // Password
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: "Password",
                  border: const OutlineInputBorder(),
                  errorText: passwordError ? "Please input a valid password" : null,
                ),
              ),
              const SizedBox(height: 5),
              const Text(
                "Password must be at least 5 characters and include a number & symbol.",
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),

              const SizedBox(height: 10),

              // Global Error
              if (globalError.isNotEmpty)
                Text(globalError, style: const TextStyle(color: Colors.red)),

              const SizedBox(height: 20),

              // Submit Button
              ElevatedButton(
                onPressed: isLoading ? null : handleSignup,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        "Create Account",
                        style: TextStyle(fontSize: 18, color: Colors.white),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
