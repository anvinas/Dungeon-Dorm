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
          // Background
          SizedBox.expand(
            child: Image.asset(
              'assets/login/pixel_bg2.png',
              fit: BoxFit.cover,
            ),
          ),

          // Banner + Buttons
          Center(
            child: Stack(
              alignment: Alignment.center,
              children: [
                Image.asset(
                  'assets/login/wood_texture2.png',
                  height: 200,
                ),
                Positioned(
                  bottom: 25,
                  child: Row(
                    children: [
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6b8e23),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 12),
                        ),
                        onPressed: () => setState(() => signupModalOpen = true),
                        child: const Text("Signup",
                            style: TextStyle(color: Colors.white)),
                      ),
                      const SizedBox(width: 20),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.indigo,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 12),
                        ),
                        onPressed: () => setState(() => loginModalOpen = true),
                        child: const Text("Login",
                            style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Chains
          Positioned(
            top: MediaQuery.of(context).size.height * 0.15,
            left: MediaQuery.of(context).size.width * 0.35,
            child: Image.asset('assets/login/chain.png', height: 100),
          ),
          Positioned(
            top: MediaQuery.of(context).size.height * 0.05,
            right: MediaQuery.of(context).size.width * 0.35,
            child: Image.asset('assets/login/chain.png', height: 100),
          ),

          // Modals
          if (loginModalOpen)
            LoginModal(
              onClose: () => setState(() => loginModalOpen = false),
              isOpen: true,
            ),
          if (signupModalOpen)
            SignupModal(
              onClose: () => setState(() => signupModalOpen = false),
            ),
        ],
      ),
    );
  }
}
