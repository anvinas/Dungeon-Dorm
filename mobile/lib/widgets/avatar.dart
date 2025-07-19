import 'package:flutter/material.dart';
import '../utils/types.dart';

class AvatarWidget extends StatelessWidget {
  final UserProfile userData;

  const AvatarWidget({
    Key? key,
    required this.userData,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double userHealthPercentage =
        (userData.currentHP / userData.maxHP).clamp(0.0, 1.0);

    final Color healthColor = userHealthPercentage > 0.8
        ? Colors.green.shade400
        : userHealthPercentage > 0.4
            ? Colors.orange.shade400
            : Colors.red.shade400;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // Avatar Head
            Container(
              width: 60,
              height: 60,
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF60A5FA)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black26,
                    blurRadius: 6,
                    offset: Offset(2, 2),
                  )
                ],
              ),
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Color(0xFF1D4ED8), width: 4),
                  color: Color(0xFFE9D5FF),
                ),
                child: ClipOval(
                  child: Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.rotationY(3.14159), // Flip horizontally
                    child: Image.asset(
                      'assets/img/playableCharacter/warlock/head.png',
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            ),

            const SizedBox(width: 10),

            // HP Text
            Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: Text(
                '${userData.currentHP}/${userData.maxHP} hp',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 24,
                  foreground: Paint()
                    ..style = PaintingStyle.stroke
                    ..strokeWidth = 2
                    ..color = Colors.black,
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 4),

        // Health Bar
        Container(
          height: 10,
          width: 150,
          decoration: BoxDecoration(
            color: const Color(0xFF697284),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF1E3A8A), width: 2),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: userHealthPercentage,
            child: Container(
              decoration: BoxDecoration(
                color: healthColor,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
