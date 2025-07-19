import 'package:flutter/material.dart';

class FightFooter extends StatelessWidget {
  final VoidCallback onClickAttack;
  final VoidCallback onClickTalk;
  final VoidCallback onClickInventory;
  final VoidCallback onClickRun;
  final Map<String, dynamic> userData;

  const FightFooter({
    super.key,
    required this.onClickAttack,
    required this.onClickTalk,
    required this.onClickInventory,
    required this.onClickRun,
    required this.userData,
  });

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 768;

    if (isMobile) {
      return Column(
        children: [
          // 🔼 Action Buttons
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _actionButton("/assets/img/fight.webp", "attack", onClickAttack),
                _actionButton("/assets/img/run.png", "run", onClickRun),
                _actionButton("/assets/img/talk.png", "talk", onClickTalk),
              ],
            ),
          ),

          // 🔽 Health + Inventory
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _avatarHealth(userData),
                GestureDetector(
                  onTap: onClickInventory,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.red[100],
                      border: Border.all(width: 4, color: Colors.blue),
                      shape: BoxShape.circle,
                    ),
                    child: Transform(
                      alignment: Alignment.center,
                      transform: Matrix4.identity()..scale(-1.0, 1.0),
                      child: Image.asset(
                        'assets/satchel.png',
                        height: 64,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }

    // Desktop Layout
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          _avatarHealth(userData),
          Row(
            children: [
              _actionButton("/assets/fight.webp", "attack", onClickAttack),
              const SizedBox(width: 10),
              _actionButton("/assets/run.png", "run", onClickRun),
              const SizedBox(width: 10),
              _actionButton("/assets/talk.png", "talk", onClickTalk),
            ],
          ),
          GestureDetector(
            onTap: onClickInventory,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red[100],
                border: Border.all(width: 4, color: Colors.blue),
                shape: BoxShape.circle,
              ),
              child: Transform(
                alignment: Alignment.center,
                transform: Matrix4.identity()..scale(-1.0, 1.0),
                child: Image.asset(
                  'assets/satchel.png',
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

  Widget _actionButton(String assetPath, String label, VoidCallback onTap) {
    return Column(
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: Colors.grey[400],
              border: Border.all(width: 3, color: Colors.grey[600]!),
              shape: BoxShape.circle,
            ),
            padding: const EdgeInsets.all(4),
            child: Image.asset(assetPath, fit: BoxFit.cover),
          ),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _avatarHealth(Map<String, dynamic> user) {
    final int hp = user["currentHP"] ?? 0;
    final int max = user["maxHP"] ?? 1;
    final percent = hp / max;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$hp / $max HP',
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Container(
          width: 120,
          height: 12,
          decoration: BoxDecoration(
            color: Colors.grey.shade600,
            borderRadius: BorderRadius.circular(6),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: percent,
            child: Container(
              decoration: BoxDecoration(
                color: percent > 0.6 ? Colors.green : percent > 0.3 ? Colors.orange : Colors.red,
                borderRadius: BorderRadius.circular(6),
              ),
            ),
          ),
        )
      ],
    );
  }
}
