import 'package:flutter/material.dart';
import '../components/login_modal.dart';
import '../components/signup_modal.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  void openLoginModal() {
    showDialog(
      context: context,
      builder: (context) => const LoginModal(),
    );
  }

  void openSignupModal() {
    showDialog(
      context: context,
      builder: (context) => const SignupModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Image
          Positioned.fill(
            child: Image.asset(
              'assets/img/pixel_bg2.png',
              fit: BoxFit.cover,
            ),
          ),

          // Banner and Buttons
          Center(
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Left Chain
                Positioned(
                  top: MediaQuery.of(context).size.height * 0.98,
                  left: MediaQuery.of(context).size.width * 0.405,
                  child: Image.asset(
                    'assets/img/chain.png',
                    height: 100,
                  ),
                ),

                // Right Chain
                Positioned(
                  top: 0,
                  left: MediaQuery.of(context).size.width * 0.5975,
                  child: Image.asset(
                    'assets/img/chain.png',
                    height: 100,
                  ),
                ),

                // Wood Texture Banner
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset(
                      'assets/img/wood_texture2.png',
                      height: 120,
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        GestureDetector(
                          onTap: openSignupModal,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                vertical: 12, horizontal: 24),
                            decoration: BoxDecoration(
                              color: const Color(0xFF6B8E23),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Signup',
                              style: TextStyle(color: Colors.white),
                            ),
                          ),
                        ),
                        const SizedBox(width: 20),
                        GestureDetector(
                          onTap: openLoginModal,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                vertical: 12, horizontal: 24),
                            decoration: BoxDecoration(
                              color: Colors.indigo,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Login',
                              style: TextStyle(color: Colors.white),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
