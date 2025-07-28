import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../pages/play_page.dart'; // for QUESTZONE
import '../utils/jwt_storage.dart';
import '../utils/get_path.dart';
import '../widgets/inventory_modal.dart';
import '../widgets/fight_footer.dart';

// Import the modals
import '../widgets/modals.dart';

class BossFightPage extends StatefulWidget {
  final String bossId;

  const BossFightPage({Key? key, required this.bossId}) : super(key: key);

  @override
  _BossFightPageState createState() => _BossFightPageState();
}

class _BossFightPageState extends State<BossFightPage> {
  Map<String, dynamic>? encounterData;
  Map<String, dynamic>? userData;
  late Map<String, dynamic> questData;

  bool loading = true;
  bool inventoryOpen = false;

  // Modal states
  bool showDeath = false;
  bool showRun = false;
  bool showWon = false;
  bool showCharmed = false;
  bool showDice = false;
  bool showCharmAnim = false;

  // Dice & charm animation data
  int diceRoll = 0;
  String diceText = "";
  int charmValue = 0;
  int rewardsXP = 0;

  // Animation states
  bool playerAttacking = false;
  bool bossAttacking = false;
  String damageText = "";

  @override
  void initState() {
    super.initState();
    try {
      questData = QUESTZONE.firstWhere((q) => q['id'] == widget.bossId);
    } catch (e) {
      debugPrint("Boss with ID ${widget.bossId} not found in QUESTZONE");
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacementNamed(context, "/play");
      });
      return;
    }
    startEncounter();
    fetchUserData();
  }

  Future<void> fetchUserData() async {
    try {
      final token = await fetchJWT();
      final res = await http.get(
        Uri.parse('${getPath()}/api/auth/profile'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() => userData = data['userProfile']);
        await storeJWT(data['token']);
      } else if (res.statusCode == 401 || res.statusCode == 403) {
        Navigator.pushReplacementNamed(context, '/');
      }
    } catch (e) {
      debugPrint("Error fetching user data: $e");
    }
  }

  Future<void> startEncounter() async {
    try {
      final token = await fetchJWT();
      final response = await http.post(
        Uri.parse('${getPath()}/api/fight/startEncounter'),
        headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },

        body: jsonEncode({'enemyId': widget.bossId, 'enemyType': 'boss'}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          encounterData = data;
          loading = false;
        });
        await storeJWT(data['token']);
      } else {
        debugPrint("Failed to start encounter: ${response.body}");
        setState(() => loading = false);
      }
    } catch (e) {
      debugPrint("Error starting encounter: $e");
      setState(() => loading = false);
    }
  }

  // --- Dice animation then callback ---
  Future<void> animateDice(int roll, String text, VoidCallback callback) async {
    setState(() {
      diceRoll = roll;
      diceText = text;
      showDice = true;
    });
    await Future.delayed(const Duration(seconds: 2));
    setState(() => showDice = false);
    callback();
  }

  // --- Animate player attack ---
  Future<void> animatePlayerAttack(String dmg, VoidCallback callback) async {
    setState(() {
      damageText = dmg;
      playerAttacking = true;
    });
    await Future.delayed(const Duration(milliseconds: 600));
    setState(() {
      playerAttacking = false;
      damageText = "";
    });
    callback();
  }

  // --- Animate boss attack ---
  Future<void> animateBossAttack(String dmg, VoidCallback callback) async {
    setState(() {
      damageText = dmg;
      bossAttacking = true;
    });
    await Future.delayed(const Duration(milliseconds: 600));
    setState(() {
      bossAttacking = false;
      damageText = "";
    });
    callback();
  }


  Future<void> animateCharm(int value, VoidCallback callback) async {
    setState(() {
      charmValue = value;
      showCharmAnim = true;
    });
    await Future.delayed(const Duration(seconds: 2));
    setState(() => showCharmAnim = false);
    callback();
  }

  // --- Handle updating UI after a move ---
  void updateUIAfterMove(Map<String, dynamic> data) {
    setState(() => encounterData = data);

    if (data['postTurnEnemyHP'] != null && data['postTurnEnemyHP'] <= 0) {
      setState(() {
        rewardsXP = data['rewards']?['xp'] ?? 0;
        showWon = true;
      });
      return;
    }
    if (data['enemyResult']?['postTurnUserHP'] != null &&
        data['enemyResult']['postTurnUserHP'] <= 0) {
      setState(() => showDeath = true);
    }
    if (data['message'] == "Enemy charmed successfully!") {
      setState(() {
        rewardsXP = data['rewards']?['xp'] ?? 0;
        showCharmed = true;
      });
    }
  }


  Future<void> handleAttack() async {
    try {
      final token = await fetchJWT();
      final response = await http.post(
        Uri.parse('${getPath()}/api/fight/userTurn'),
        headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },

        body: jsonEncode({'action': 'attack', 'item': null}),
      );
      final data = jsonDecode(response.body);

      final userAttack = data['userAttack'] ?? data['userResult']['userAttack'];
      final bossResponse = data['enemyResult'];
      final userDmg = userAttack['hit'] ? userAttack['damage'].toString() : "MISS";
      final bossDmg = bossResponse != null
          ? (bossResponse['enemyAttack']['hit']
              ? bossResponse['enemyAttack']['damage'].toString()
              : "MISS")
          : "";

      await animateDice(userAttack['d20'], "Attack Roll!", () async {
        await animatePlayerAttack(userDmg, () async {
          if (bossResponse != null) {
            await animateBossAttack(bossDmg, () => updateUIAfterMove(data));
          } else {
            updateUIAfterMove(data);
          }
        });
      });
    } catch (e) {
      debugPrint("Error on attack: $e");
    }
  }


  Future<void> handleTalk() async {
    try {
      final token = await fetchJWT();
      final response = await http.post(
        Uri.parse('${getPath()}/api/fight/userTurn'),
        headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
        body: jsonEncode({'action': 'talk', 'item': null}),
      );
      final data = jsonDecode(response.body);

      final userTalk = data['userTalk'] ?? data['userResult']['userTalk'];
      final bossResponse = data['enemyResult'];
      final bossDmg = bossResponse != null
          ? (bossResponse['enemyAttack']['hit']
              ? bossResponse['enemyAttack']['damage'].toString()
              : "MISS")
          : "";

      await animateDice(userTalk['d20'], "Charm Roll!", () async {
        if (userTalk['success'] == true) {
          await animateCharm(userTalk['friendshipContribution'], () async {
            if (bossResponse != null) {
              await animateBossAttack(bossDmg, () => updateUIAfterMove(data));
            } else {
              updateUIAfterMove(data);
            }
          });
        } else {
          if (bossResponse != null) {
            await animateBossAttack(bossDmg, () => updateUIAfterMove(data));
          } else {
            updateUIAfterMove(data);
          }
        }
      });
    } catch (e) {
      debugPrint("Error on talk: $e");
    }
  }


  Future<void> handleRun() async {
    try {
      final token = await fetchJWT();
      final response = await http.post(
        Uri.parse('${getPath()}/api/fight/userTurn'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },

        body: jsonEncode({'action': 'flee', 'item': null}),
      );
      final data = jsonDecode(response.body);

      if (data['success'] == true) {
        setState(() => showRun = true);
      } else if (data['enemyResult']?['postTurnUserHP'] != null &&
          data['enemyResult']['postTurnUserHP'] <= 0) {
        setState(() => showDeath = true);
      }

      updateUIAfterMove(data);
    } catch (e) {
      debugPrint("Error on run: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final enemyCurrentHP =
        encounterData?['enemy']?['currentHP'] ?? questData['maxHP'];
    final enemyMaxHP = questData['maxHP'];
    final hpPercent = (enemyCurrentHP / enemyMaxHP).clamp(0.0, 1.0);

    return Scaffold(
      body: Stack(
        children: [
          //Container(color: Colors.grey[900]), Background Color

          // Background image
          Positioned(
            bottom: 200,
            child: Image.asset(
              'assets/img/backgrounds/fight_bg_2.png',
              fit: BoxFit.cover,
            ),
          ),

          // Player
          Positioned(
            bottom: 215,
            left: 30,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              transform: Matrix4.translationValues(
                  playerAttacking ? 30 : 0, 0, 0),
              child: Column(
                children: [
                  if (damageText.isNotEmpty && playerAttacking)
                    Text(damageText,
                        style: const TextStyle(
                            color: Colors.purple,
                            fontSize: 32,
                            fontWeight: FontWeight.bold)),
                  if (userData != null)
                    Image.asset(
                      'assets/img/playableCharacter/${userData?["Character"]["class"].toString().toLowerCase()}/pixel.png',
                      height: 150,
                    ),
                ],
              ),
            ),
          ),

          // Boss
          Positioned(
            bottom: 400,
            right: 10,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              transform: Matrix4.translationValues(
                  bossAttacking ? -30 : 0, 0, 0),
              child: Column(
                children: [
                  Text(
                    "${questData['name']}",
                    style: const TextStyle(
                        fontSize: 26,
                        color: Colors.white,
                        fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    "$enemyCurrentHP / $enemyMaxHP HP",
                    style: const TextStyle(
                        fontSize: 20,
                        color: Colors.white,
                        fontWeight: FontWeight.bold),
                  ),
                  Container(
                    width: 200,
                    height: 20,
                    decoration: BoxDecoration(
                      color: Colors.blueGrey,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.blue, width: 2),
                    ),
                    child: FractionallySizedBox(
                      widthFactor: hpPercent,
                      child: Container(
                        decoration: BoxDecoration(
                          color: hpPercent > 0.8
                              ? Colors.green
                              : hpPercent > 0.4
                                  ? Colors.orange
                                  : Colors.red,
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (damageText.isNotEmpty && bossAttacking)
                    Text(damageText,
                        style: const TextStyle(
                            color: Colors.red,
                            fontSize: 32,
                            fontWeight: FontWeight.bold)),
                  Transform(
                    alignment: Alignment.center,
                    transform: Matrix4.identity()..scale(-1.0, 1.0),
                    child:
                    Image.asset(
                      'assets/img/boss/${questData["name"].toString().toLowerCase().split(" ").first}/pixel.png',
                      height: 150,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Inventory
          if (inventoryOpen)
            Positioned.fill(
              child: InventorySystem(
                onClose: () => setState(() => inventoryOpen = false),
              ),
            ),

          // Fight footer
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: FightFooter(
              isInventoryOpen: inventoryOpen, //to make footer dissapear when inventory is opened
              onClickInventory: () => setState(() => inventoryOpen = true),
              onClickAttack: () => handleAttack(),
              onClickTalk: () => handleTalk(),
              onClickRun: () => handleRun(),
              userData: encounterData?['user'] ?? userData ?? {},
            ),
          ),

          // --- Modals ---
          if (showDeath)
            Positioned.fill(
              child: DeathScreenModal(
                onClickRespawn: () =>
                    Navigator.pushReplacementNamed(context, "/play"),
              ),
            ),
          if (showRun)
            Positioned.fill(
              child: RunScreenModal(
                onClickLeave: () =>
                    Navigator.pushReplacementNamed(context, "/play"),
              ),
            ),
          if (showWon)
            Positioned.fill(
              child: WonScreenModal(
                xp: rewardsXP,
                onClickLeave: () =>
                    Navigator.pushReplacementNamed(context, "/play"),
              ),
            ),
          if (showCharmed)
            Positioned.fill(
              child: CharmedScreenModal(
                xp: rewardsXP,
                onClickLeave: () =>
                    Navigator.pushReplacementNamed(context, "/play"),
              ),
            ),
          if (showDice)
            Positioned.fill(
              child: CurrentMoveScreen(
                diceRoll: diceRoll,
                mainText: diceText,
              ),
            ),
          if (showCharmAnim)
            Positioned.fill(
              child: CharmedActivatedScreen(value: charmValue),
            ),
        ],
      ),
    );
  }
}
