import 'package:flutter/material.dart';

class FightFooter extends StatelessWidget {
  final VoidCallback onClickAttack;
  final VoidCallback onClickTalk;
  final VoidCallback onClickInventory;
  final VoidCallback onClickRun;
  final Map<String, dynamic> userData;
  final bool isInventoryOpen;

  const FightFooter({
    super.key,
    required this.onClickAttack,
    required this.onClickTalk,
    required this.onClickInventory,
    required this.onClickRun,
    required this.userData,
    required this.isInventoryOpen,
  });

  @override
  Widget build(BuildContext context) {
    if (isInventoryOpen) {
      return const SizedBox.shrink(); //hides fight footer when inventory opened
    }

    final isMobile = MediaQuery.of(context).size.width < 768;
    final int hp = (userData["currentHP"] ?? 0);
    final int max = (userData["maxHP"] ?? 1);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 20, 1, 43).withOpacity(1),//0.8
        border: const Border(top: BorderSide(color: Color.fromARGB(255, 20, 1, 43), width: 2)),
      ),
      child: isMobile ? _mobileLayout(hp, max) : _desktopLayout(hp, max),
    );
  }

  Widget _mobileLayout(int hp, int max) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _actionButton("assets/img/fight.webp", "Attack", onClickAttack),
              _actionButton("assets/img/run.png", "Run", onClickRun),
              _actionButton("assets/img/talk.png", "Talk", onClickTalk),
            ],
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _avatarHealth(hp, max),
            _inventoryButton(),
          ],
        ),
      ],
    );
  }

  Widget _desktopLayout(int hp, int max) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        _avatarHealth(hp, max),
        Row(
          children: [
            _actionButton("assets/img/fight.webp", "Attack", onClickAttack),
            const SizedBox(width: 10),
            _actionButton("assets/img/run.png", "Run", onClickRun),
            const SizedBox(width: 10),
            _actionButton("assets/img/talk.png", "Talk", onClickTalk),
          ],
        ),
        _inventoryButton(),
      ],
    );
  }

  Widget _actionButton(String assetPath, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(40),
      child: Column(
        children: [
          Container(
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
          const SizedBox(height: 4),
          Text(label,
              style:
                  const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        ],
      ),
    );
  }

  Widget _inventoryButton() {
    return InkWell(
      onTap: onClickInventory,
      borderRadius: BorderRadius.circular(50),
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
            'assets/img/satchel.png',
            height: 64,
            fit: BoxFit.cover,
          ),
        ),
      ),
    );
  }

  Widget _avatarHealth(int hp, int max) {
    final percent = (hp / (max > 0 ? max : 1)).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$hp / $max HP',
            style: const TextStyle(
                color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
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
                color: percent > 0.6
                    ? Colors.green
                    : percent > 0.3
                        ? Colors.orange
                        : Colors.red,
                borderRadius: BorderRadius.circular(6),
              ),
            ),
          ),
        )
      ],
    );
  }
}
