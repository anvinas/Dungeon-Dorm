import 'package:flutter/material.dart';
import '../widgets/login_modal.dart';
import '../widgets/signup_modal.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool loginModalOpen = false;
  bool signupModalOpen = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background image
          SizedBox.expand(
            child: Image.asset(
              'assets/pixel_bg2.png',
              fit: BoxFit.cover,
            ),
          ),

          // Banner and buttons
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Image.asset(
                      'assets/wood_texture2.png',
                      height: 150,
                    ),
                    Positioned(
                      bottom: 15,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6b8e23),
                            ),
                            onPressed: () => setState(() {
                              signupModalOpen = true;
                            }),
                            child: const Text("Signup"),
                          ),
                          const SizedBox(width: 20),
                          ElevatedButton(
                            onPressed: () => setState(() {
                              loginModalOpen = true;
                            }),
                            child: const Text("Login"),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Modals
          if (loginModalOpen)
            LoginModal(onClose: () => setState(() => loginModalOpen = false)),
          if (signupModalOpen)
            SignupModal(onClose: () => setState(() => signupModalOpen = false)),
        ],
      ),
    );
  }
}
