import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:dungeon_and_dorms/widgets/fight_footer.dart';
import 'package:dungeon_and_dorms/widgets/inventory_modal.dart';
import 'package:flutter/material.dart';
// import 'package:http/http.dart' as http;
// import '../utils/get_path.dart';
// import '../utils/jwt_storage.dart';

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

class _BossFightPageState extends State<BossFightPage>
    with TickerProviderStateMixin {
  EncounterData? encounterData;
  bool loading = true;
  bool showInventory = false;

  // Animation/Modal states
  bool userAttackAnimating = false;
  bool enemyAttackAnimating = false;
  String damageText = '';
  String messageText = '';
  bool diedScreen = false;
  bool runScreen = false;

  late AnimationController pulseController;
  late AnimationController bobController;

  @override
  void initState() {
    super.initState();
    pulseController = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    )..repeat(reverse: true);

    bobController = AnimationController(
      duration: const Duration(seconds: 5),
      vsync: this,
    )..repeat(reverse: true);

    startEncounter();
  }

  @override
  void dispose() {
    pulseController.dispose();
    bobController.dispose();
    super.dispose();
  }

  Future<void> startEncounter() async {
    try {
       // final token = await fetchJWT();
      // final res = await http.post(
      //   Uri.parse("${getPath()}/api/fight/startEncounter"),
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": "Bearer $token",
      //   },
      //   body: jsonEncode({
      //     "enemyId": widget.bossId,
      //     "enemyType": "boss",
      //   }),
      // );
      // if (res.statusCode == 200) {
      //   setState(() {
      //     encounterData = EncounterData.fromJson(jsonDecode(res.body));
      //     loading = false;
      //   });
      // } else {
      //   debugPrint("Failed: ${res.body}");
      // }

      await Future.delayed(const Duration(milliseconds: 500));
      setState(() {
        encounterData = EncounterData(
          enemy: Enemy(name: "Gabriel the Hidden", currentHP: 100, maxHP: 100),
          user: {
            "name": "MockPlayer",
            "level": 7,
            "currentHP": 100,
            "maxHP": 100,
            "stats": {
              "strength": 5,
              "dexterity": 5,
              "intelligence": 5,
              "charisma": 5,
              "defense": 5,
            },
          },
        );
        loading = false;
      });
    } catch (e) {
      debugPrint("Error starting encounter: $e");
      setState(() => loading = false);
    }
  }

  Future<void> _sendTurnAction(String action) async {
    try {
      // final token = await fetchJWT();
      // final res = await http.post(
      //   Uri.parse("${getPath()}/api/fight/userTurn"),
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": "Bearer $token",
      //   },
      //   body: jsonEncode({
      //     "action": action,
      //     "item": null,
      //   }),
      // );
      // debugPrint("Turn result: ${res.body}");

      debugPrint("Dummy action sent: $action");
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
        if (encounterData != null) {
          encounterData!.enemy.currentHP -= dmg;
          if (encounterData!.enemy.currentHP <= 0) {
            encounterData!.enemy.currentHP = 0;
            messageText = "Enemy Defeated!";
          }
        }
      });
    });
  }

  Future<void> handleClickAttack() async {
    await _sendTurnAction("attack");
    final strength = encounterData!.user['stats']['strength'] ?? 5;
    final roll = Random().nextInt(6) + 1;
    final dmg = roll + strength;
    _animateUserAttack(hit: true, dmg: 5);
  }

  Future<void> handleClickTalk() async {
    await _sendTurnAction("talk");
    final charisma = encounterData!.user['stats']['charisma'] ?? 5;
    final roll = Random().nextInt(20) + 1;
    if (roll + charisma >= 20) {
      setState(() {
        messageText = "You charmed the enemy! They flee peacefully.";
        encounterData!.enemy.currentHP = 0;
      });
    } else {
      setState(() {
        messageText = "Your charm failed.";
      });
    }
  }

  Future<void> handleClickRun() async {
    await _sendTurnAction("flee");
    setState(() {
      runScreen = true;
    });
  }

  void toggleInventory() {
    setState(() {
      showInventory = !showInventory;
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
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/img/backgrounds/fight_bg_2.png'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          FadeTransition(
            opacity: Tween(begin: 0.0, end: 0.1).animate(pulseController),
            child: Container(color: Colors.black),
          ),

          Positioned(
            bottom: MediaQuery.of(context).size.height * 0.2,
            left: 20,
            child: SlideTransition(
              position: Tween(begin: Offset.zero, end: const Offset(0, -0.01))
                  .animate(bobController),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Image.asset(
                    'assets/img/character.png',
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
          ),

          Positioned(
            bottom: MediaQuery.of(context).size.height * 0.3,
            right: MediaQuery.of(context).size.width * 0.05,
            child: SlideTransition(
              position: Tween(begin: Offset.zero, end: const Offset(0, -0.01))
                  .animate(bobController),
              child: Column(
                children: [
                  Text(
                    '${enemy.currentHP}/${enemy.maxHP} HP',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      shadows: [
                        Shadow(blurRadius: 2, color: Colors.black, offset: Offset(1, 1)),
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
                    'assets/img/boss/gabriel/pixel.png',
                    width: 150,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stack) => const Icon(Icons.error, size: 100, color: Colors.red),
                  ),
                ],
              ),
            ),
          ),

          if (messageText.isNotEmpty)
            Positioned(
              top: 40,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    messageText,
                    style: const TextStyle(color: Colors.white, fontSize: 18),
                  ),
                ),
              ),
            ),

          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: FightFooter(
              onClickAttack: handleClickAttack,
              onClickTalk: handleClickTalk,
              onClickInventory: toggleInventory,
              onClickRun: handleClickRun,
              userData: encounterData!.user,
            ),
          ),

          if (showInventory)
            _buildOverlayModal(
              child: InventorySystem(onClose: toggleInventory),
            ),

          if (diedScreen)
            _buildOverlayModal(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('YOU DIED!', style: TextStyle(color: Colors.red, fontSize: 48, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Respawn')),
                ],
              ),
            ),

          if (runScreen)
            _buildOverlayModal(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Successfully Fled!', style: TextStyle(color: Colors.green, fontSize: 36, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Leave Area')),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildOverlayModal({required Widget child}) {
    return Positioned.fill(
      child: Container(
        color: Colors.black.withOpacity(0.8),
        child: Center(child: child),
      ),
    );
  }
}
