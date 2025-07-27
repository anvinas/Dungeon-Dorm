import 'package:flutter/material.dart';

class DeathScreenModal extends StatelessWidget {
  final VoidCallback onClickRespawn;
  const DeathScreenModal({super.key, required this.onClickRespawn});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black87,
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('YOU DIED!',
                style: TextStyle(
                    color: Colors.red, fontSize: 48, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            const Text('You lost 10 gold',
                style: TextStyle(color: Colors.white, fontSize: 18)),
            const SizedBox(height: 24),
            ElevatedButton(
                onPressed: onClickRespawn,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
                child: const Text('Respawn')),
          ],
        ),
      ),
    );
  }
}

class RunScreenModal extends StatelessWidget {
  final VoidCallback onClickLeave;
  const RunScreenModal({super.key, required this.onClickLeave});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black87,
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Successfully Fled!',
                style: TextStyle(
                    color: Colors.green, fontSize: 36, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            ElevatedButton(
                onPressed: onClickLeave,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
                child: const Text('Leave Area')),
          ],
        ),
      ),
    );
  }
}

class WonScreenModal extends StatelessWidget {
  final int xp;
  final VoidCallback onClickLeave;
  const WonScreenModal({super.key, required this.xp, required this.onClickLeave});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black87,
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Boss Defeated!',
                style: TextStyle(
                    color: Colors.green, fontSize: 36, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Text('You gained $xp XP',
                style: const TextStyle(color: Colors.white, fontSize: 18)),
            const SizedBox(height: 24),
            ElevatedButton(
                onPressed: onClickLeave,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
                child: const Text('Leave Area')),
          ],
        ),
      ),
    );
  }
}

class CharmedScreenModal extends StatelessWidget {
  final int xp;
  final VoidCallback onClickLeave;
  const CharmedScreenModal({super.key, required this.xp, required this.onClickLeave});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black87,
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Successfully Charmed!',
                style: TextStyle(
                    color: Colors.pink, fontSize: 36, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Text('You gained $xp XP',
                style: const TextStyle(color: Colors.white, fontSize: 18)),
            const SizedBox(height: 24),
            ElevatedButton(
                onPressed: onClickLeave,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
                child: const Text('Leave Area')),
          ],
        ),
      ),
    );
  }
}

class CurrentMoveScreen extends StatelessWidget {
  final int diceRoll;
  final String mainText;
  const CurrentMoveScreen({super.key, required this.diceRoll, required this.mainText});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black54,
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(mainText,
                style: const TextStyle(color: Colors.white, fontSize: 32)),
            const SizedBox(height: 16),
            Stack(
              alignment: Alignment.center,
              children: [
                Image.asset('assets/img/20dice.png', width: 150),
                Text(
                  '$diceRoll',
                  style: const TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      shadows: [Shadow(blurRadius: 2, color: Colors.black)]),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class CharmedActivatedScreen extends StatelessWidget {
  final int value;
  const CharmedActivatedScreen({super.key, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black54,
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('CHARMED + $value',
                style: const TextStyle(
                    color: Colors.red, fontSize: 36, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Image.asset('assets/img/heart.png', width: 120),
          ],
        ),
      ),
    );
  }
}
