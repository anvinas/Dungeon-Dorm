import 'package:dungeon_and_dorms/widgets/avatar_health.dart';
import 'package:flutter/material.dart';

class FightFooterWidget extends StatelessWidget {
  final VoidCallback onClickAttack;
  final VoidCallback onClickTalk;
  final VoidCallback onClickInventory;
  final VoidCallback onClickRun;
  final int currentHP;
  final int maxHP;

  const FightFooterWidget({
    Key? key,
    required this.onClickAttack,
    required this.onClickTalk,
    required this.onClickInventory,
    required this.onClickRun,
    required this.currentHP,
    required this.maxHP,
  }) : super(key: key);

  Widget _buildActionButton({
    required String label,
    required String assetPath,
    required VoidCallback onTap,
  }) {
    return Column(
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: 80,
            height: 80,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey.shade400,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.grey.shade600, width: 3),
            ),
            child: Image.asset(assetPath, fit: BoxFit.cover),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.black87,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            spreadRadius: 2,
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // Avatar health display
          AvatarHealthWidget(currentHP: currentHP, maxHP: maxHP),

          // Action buttons
          Row(
            children: [
              _buildActionButton(
                label: 'attack',
                assetPath: 'assets/img/fight.webp',
                onTap: onClickAttack,
              ),
              const SizedBox(width: 12),
              _buildActionButton(
                label: 'run',
                assetPath: 'assets/img/run.png',
                onTap: onClickRun,
              ),
              const SizedBox(width: 12),
              _buildActionButton(
                label: 'talk',
                assetPath: 'assets/img/talk.png',
                onTap: onClickTalk,
              ),
            ],
          ),

          // Inventory button
          GestureDetector(
            onTap: onClickInventory,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.shade100,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.blue.shade500, width: 4),
              ),
              child: Transform(
                alignment: Alignment.center,
                transform: Matrix4.rotationY(3.14159),
                child: Image.asset(
                  'assets/img/satchel.png',
                  height: 80,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
