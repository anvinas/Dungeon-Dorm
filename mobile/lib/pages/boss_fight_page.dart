import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../utils/get_path.dart';
import '../utils/jwt_storage.dart';

class Enemy {
  final String name;
  int currentHP;
  final int maxHP;
  Enemy({required this.name, required this.currentHP, required this.maxHP});

  factory Enemy.fromJson(Map<String, dynamic> json) {
    return Enemy(
      name: json['name'] ?? '',
      currentHP: json['currentHP'] ?? 0,
      maxHP: json['maxHP'] ?? 1,
    );
  }
}

class EncounterData {
  Enemy enemy;
  Map<String, dynamic> user;
  EncounterData({required this.enemy, required this.user});

  factory EncounterData.fromJson(Map<String, dynamic> json) {
    return EncounterData(
      enemy: Enemy.fromJson(json['enemy']),
      user: json['user'] ?? {},
    );
  }
}

class BossFightPage extends StatefulWidget {
  final String bossId;
  const BossFightPage({super.key, required this.bossId});

  @override
  State<BossFightPage> createState() => _BossFightPageState();
}

class _BossFightPageState extends State<BossFightPage> {
  EncounterData? encounterData;
  bool loading = true;

  // Animation/Modal states
  bool userAttackAnimating = false;
  bool enemyAttackAnimating = false;
  String damageText = '';
  bool diedScreen = false;
  bool runScreen = false;

  @override
  void initState() {
    super.initState();
    startEncounter();
  }

  Future<void> startEncounter() async {
    try {
      final token = await fetchJWT();
      final res = await http.post(
        Uri.parse("${getPath()}/api/fight/startEncounter"),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
        body: jsonEncode({
          "enemyId": widget.bossId,
          "enemyType": "boss",
        }),
      );
      if (res.statusCode == 200) {
        setState(() {
          encounterData = EncounterData.fromJson(jsonDecode(res.body));
          loading = false;
        });
      } else {
        debugPrint("Failed: ${res.body}");
      }
    } catch (e) {
      debugPrint("Error starting encounter: $e");
    }
  }

  Future<void> handleClickAttack() async {
    await _sendTurnAction("attack");
    // For now simulate:
    _animateUserAttack(hit: true, dmg: 5);
  }

  Future<void> handleClickTalk() async {
    await _sendTurnAction("talk");
  }

  Future<void> handleClickRun() async {
    await _sendTurnAction("flee");
    setState(() {
      runScreen = true;
    });
  }

  Future<void> _sendTurnAction(String action) async {
    try {
      final token = await fetchJWT();
      final res = await http.post(
        Uri.parse("${getPath()}/api/fight/userTurn"),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token",
        },
        body: jsonEncode({
          "action": action,
          "item": null,
        }),
      );
      debugPrint("Turn result: ${res.body}");
    } catch (e) {
      debugPrint("Error sending turn action: $e");
    }
  }

  void _animateUserAttack({required bool hit, required int dmg}) {
    setState(() {
      userAttackAnimating = true;
      damageText = hit ? dmg.toString() : "MISS";
    });
    Future.delayed(const Duration(milliseconds: 600), () {
      setState(() {
        userAttackAnimating = false;
        damageText = '';
      });
      // Example: reduce enemy hp locally
      if (encounterData != null) {
        setState(() {
          encounterData!.enemy.currentHP -= dmg;
          if (encounterData!.enemy.currentHP <= 0) {
            encounterData!.enemy.currentHP = 0;
            diedScreen = false; // they won
          }
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading || encounterData == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final enemy = encounterData!.enemy;
    final hpPercent = (enemy.currentHP / enemy.maxHP);

    return Scaffold(
      body: Stack(
        children: [
          // Background
          Container(color: Colors.grey.shade900),

          // Dark overlay
          Container(color: Colors.black.withOpacity(0.5)),

          // Foreground content
          Positioned.fill(
            child: Stack(
              children: [
                // Player Image
                Positioned(
                  bottom: MediaQuery.of(context).size.height * 0.2,
                  left: 20,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Image.asset(
                        'assets/playableCharacter/warlock/pixel.png',
                        width: MediaQuery.of(context).size.width * 0.3,
                      ),
                      if (userAttackAnimating && damageText.isNotEmpty)
                        Positioned(
                          top: 0,
                          child: Text(
                            damageText,
                            style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: Colors.purple,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                // Boss Image + HP
                Positioned(
                  bottom: MediaQuery.of(context).size.height * 0.3,
                  right: MediaQuery.of(context).size.width * 0.05,
                  child: Column(
                    children: [
                      Text(
                        '${enemy.currentHP}/${enemy.maxHP} HP',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          shadows: [
                            Shadow(
                              blurRadius: 2,
                              color: Colors.black,
                              offset: Offset(1, 1),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: 200,
                        height: 10,
                        decoration: BoxDecoration(
                          color: Colors.blueGrey.shade400,
                          border: Border.all(color: Colors.blue.shade800),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: FractionallySizedBox(
                            widthFactor: hpPercent,
                            child: Container(
                              decoration: BoxDecoration(
                                color: hpPercent > 0.8
                                    ? Colors.green
                                    : hpPercent > 0.4
                                        ? Colors.orange
                                        : Colors.red,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Image.asset(
                        'assets/boss/andrea/pixel.png',
                        width: 150,
                        fit: BoxFit.cover,
                      ),
                    ],
                  ),
                ),


                // Overlays/Modals
                if (diedScreen) DeathScreenModal(onRespawn: () {}),
                if (runScreen) RunScreenModal(onLeave: () {}),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// ---------- MODALS ----------
class DeathScreenModal extends StatelessWidget {
  final VoidCallback onRespawn;
  const DeathScreenModal({super.key, required this.onRespawn});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.8),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('YOU DIED!', style: TextStyle(color: Colors.red, fontSize: 48, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onRespawn,
              child: const Text('Respawn'),
            ),
          ],
        ),
      ),
    );
  }
}

class RunScreenModal extends StatelessWidget {
  final VoidCallback onLeave;
  const RunScreenModal({super.key, required this.onLeave});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.8),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Successfully Fled!', style: TextStyle(color: Colors.green, fontSize: 36, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onLeave,
              child: const Text('Leave Area'),
            ),
          ],
        ),
      ),
    );
  }
}