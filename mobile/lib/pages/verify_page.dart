import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/get_path.dart';

class VerifyEmailPage extends StatefulWidget {
  const VerifyEmailPage({super.key});

  @override
  State<VerifyEmailPage> createState() => _VerifyEmailPageState();
}

class _VerifyEmailPageState extends State<VerifyEmailPage> {
  final int codeLength = 6;
  late List<TextEditingController> controllers;
  late List<FocusNode> focusNodes;
  String message =
      "A verification code and link was sent to your email. Please enter the code or click the link.";

  @override
  void initState() {
    super.initState();
    controllers = List.generate(codeLength, (_) => TextEditingController());
    focusNodes = List.generate(codeLength, (_) => FocusNode());
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = ModalRoute.of(context)?.settings.arguments as String?;
      if (token != null && token.isNotEmpty) {
        _verifyToken(token);
      }
    });
  }

  @override
  void dispose() {
    for (final c in controllers) {
      c.dispose();
    }
    for (final f in focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  void _onCodeChanged(int index, String value) {
    if (value.isNotEmpty && RegExp(r'^\d$').hasMatch(value)) {
      controllers[index].text = value;
      if (index < codeLength - 1) {
        focusNodes[index + 1].requestFocus();
      } else {
        focusNodes[index].unfocus();
      }
    } else if (value.isEmpty && index > 0) {
      focusNodes[index - 1].requestFocus();
    }
  }

  String _getEnteredCode() {
    return controllers.map((c) => c.text).join();
  }

  Future<void> _submitCode() async {
    final code = _getEnteredCode();
    if (code.length != codeLength) {
      setState(() => message = "❌ Entered code is invalid.");
      return;
    }
    await _verifyToken(code);
  }

  Future<void> _verifyToken(String token) async {
    try {
      final response = await http.post(
        Uri.parse('${getPath()}/api/auth/verify-email'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'token': token}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['message'] != null) {
          setState(() => message = "✅ Email verified successfully! You may now log in.");
          Future.delayed(const Duration(seconds: 1), () {
            Navigator.pushReplacementNamed(context, '/select');
          });
        } else {
          setState(() => message = "❌ Something went wrong. Please try again.");
        }
      } else {
        setState(() => message = "❌ Invalid or expired token.");
      }
    } catch (e) {
      setState(() => message = "❌ Server error. Please try again.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background
          SizedBox.expand(
            child: Image.asset(
              'assets/login/pixel_bg2.png',
              fit: BoxFit.cover,
            ),
          ),
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight),
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
                        width: MediaQuery.of(context).size.width * 0.9,
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text(
                              "Email Verification",
                              style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white),
                            ),
                            const SizedBox(height: 20),
                            // Code Input Fields
                            Wrap(
                              alignment: WrapAlignment.center,
                              spacing: 8,
                              children: List.generate(codeLength, (index) {
                                return SizedBox(
                                  width: 50,
                                  child: TextField(
                                    controller: controllers[index],
                                    focusNode: focusNodes[index],
                                    textAlign: TextAlign.center,
                                    maxLength: 1,
                                    keyboardType: TextInputType.number,
                                    onChanged: (val) => _onCodeChanged(index, val),
                                    decoration: const InputDecoration(
                                      counterText: '',
                                      filled: true,
                                      fillColor: Colors.white,
                                      border: OutlineInputBorder(),
                                    ),
                                    onTap: () => controllers[index].clear(),
                                  ),
                                );
                              }),
                            ),
                            const SizedBox(height: 20),
                            ElevatedButton(
                              onPressed: _submitCode,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF6b8e23),
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8)),
                              ),
                              child: const Text(
                                "Confirm",
                                style: TextStyle(color: Colors.white, fontSize: 18),
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
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
