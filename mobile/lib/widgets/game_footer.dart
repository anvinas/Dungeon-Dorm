import 'package:dungeon_and_dorms/widgets/avatar.dart';
import 'package:flutter/material.dart';
import '../utils/types.dart';

class GameFooter extends StatelessWidget {
  final VoidCallback onClickInventory;
  final UserProfile? userData;

  const GameFooter({
    Key? key,
    required this.onClickInventory,
    this.userData,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(15),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 👤 Avatar widget placeholder
          if (userData != null) AvatarWidget(userData: userData!),

          // 🎒 Inventory button
          GestureDetector(
            onTap: onClickInventory,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red[100],
                shape: BoxShape.circle,
                border: Border.all(color: Colors.blue.shade500, width: 4),
              ),
              child: Image.asset(
                'assets/img/satchel.png',
                height: 80,
                fit: BoxFit.cover,
                alignment: Alignment.center,
              ),
            ),
          ),

          const SizedBox(width: 50), // Empty placeholder (like the div in React)
        ],
      ),
    );
  }
}