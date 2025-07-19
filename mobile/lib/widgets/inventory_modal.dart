import 'package:flutter/material.dart';
import '../utils/types.dart';
import '../utils/get_path.dart';
import '../utils/jwt_storage.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class InventorySystem extends StatefulWidget {
  final VoidCallback onClose;

  const InventorySystem({
    required this.onClose,
    Key? key,
  }) : super(key: key);

  @override
  State<InventorySystem> createState() => _InventorySystemState();
}

class _InventorySystemState extends State<InventorySystem> {
  UserProfile? userData;
  List<InventoryItem> itemShopList = [];
  InventoryItem? usingItem;

  List<CurrentLootItem> weapons = [];
  List<CurrentLootItem> potions = [];
  List<CurrentLootItem> keys = [];

  @override
  void initState() {
    super.initState();
    fetchUserData();
    fetchItemShop();
  }

  Future<void> fetchUserData() async {
    try {
      // final token = await fetchJWT();
      // final res = await http.get(
      //   Uri.parse("${getPath()}/api/auth/profile"),
      //   headers: {"Authorization": "Bearer $token"},
      // );
      // if (res.statusCode == 200) {
      //   final json = jsonDecode(res.body);
      //   final profile = UserProfile.fromJson(json['userProfile']);
      //   await storeJWT(json['token']);
      //   setState(() {
      //     userData = profile;
      //   });
      //   createInventorySections(profile.currentLoot);
      // }

      final dummyProfile = UserProfile(
        id: 'u001',
        email: 'mock@user.com',
        gamerTag: 'MockHero',
        level: 5,
        currency: 100,
        maxHP: 100,
        currentHP: 80,
        currentStats: UserStats(
          strength: 6,
          dexterity: 4,
          intelligence: 8,
          charisma: 5,
          defense: 3,
        ),
        currentLoot: [
          CurrentLootItem(
            id: 'c001',
            quantity: 2,
            itemId: InventoryItem(
              id: 'potion001',
              name: 'Health Potion',
              description: 'Restores 50 HP',
              damage: 0,
              itemType: 'Potion',
              imageURL: null,
              healthAmount: 50,
            ),
          ),
          CurrentLootItem(
            id: 'c002',
            quantity: 1,
            itemId: InventoryItem(
              id: 'sword001',
              name: 'Steel Sword',
              description: 'A sturdy sword',
              damage: 10,
              itemType: 'Weapon',
              imageURL: null,
            ),
          ),
        ],
        character: Character(
          id: 'char001',
          species: 'Human',
          characterClass: 'Rogue',
          maxHP: 100,
          stats: {
            'strength': 6,
            'dexterity': 4,
            'intelligence': 8,
            'charisma': 5,
            'defense': 3,
          },
        ),
        bosses: [],
        currentActiveBoss: null,
        createdAt: '',
        updatedAt: '',
        currentXP: 75,
        toLevelUpXP: 100,
      );

      setState(() {
        userData = dummyProfile;
      });
      createInventorySections(dummyProfile.currentLoot);
    } catch (e) {
      print("Failed to load user data: $e");
    }
  }

  Future<void> fetchItemShop() async {
    try {
      // final token = await fetchJWT();
      // final res = await http.get(
      //   Uri.parse("${getPath()}/api/auth/inventory"),
      //   headers: {"Authorization": "Bearer $token"},
      // );
      // if (res.statusCode == 200) {
      //   final json = jsonDecode(res.body);
      //   final items = (json as List)
      //       .map((itemJson) => InventoryItem.fromJson(itemJson))
      //       .toList();
      //   setState(() {
      //     itemShopList = items;
      //   });
      // }

      setState(() {
        itemShopList = [
          InventoryItem(
            id: 'key001',
            name: 'Rusty Key',
            description: 'Opens an old door.',
            itemType: 'Key',
            damage: 0,
          ),
          InventoryItem(
            id: 'potion001',
            name: 'Health Potion',
            description: 'Restores 50 HP',
            itemType: 'Potion',
            healthAmount: 50,
            damage: 0,
          ),
        ];
      });
    } catch (e) {
      print("Failed to load shop items: $e");
    }
  }

  void createInventorySections(List<CurrentLootItem> loot) {
    weapons.clear();
    potions.clear();
    keys.clear();

    for (final entry in loot) {
      switch (entry.itemId.itemType) {
        case 'Weapon':
          weapons.add(entry);
          break;
        case 'Potion':
          potions.add(entry);
          break;
        case 'Key':
          keys.add(entry);
          break;
      }
    }
  }

 @override
  Widget build(BuildContext context) {
    if (userData == null) return const Center(child: CircularProgressIndicator());

    final screenWidth = MediaQuery.of(context).size.width;
    final slotSize = screenWidth * 0.12;
    final barWidth = screenWidth * 0.2;

    return Column(
      children: [
        GestureDetector(
          onTap: widget.onClose,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            width: double.infinity,
            color: Colors.redAccent,
            child: const Center(
              child: Text(
                "Close",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),
          ),
        ),
        Expanded(
          child: Row(
            children: [
              // Inventory Section
              Expanded(
                child: Container(
                  color: Colors.grey[850],
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Inventory", style: TextStyle(color: Colors.white, fontSize: 20)),
                      const SizedBox(height: 10),
                      _buildLabel("Boss Keys"),
                      Wrap(
                        spacing: 10,
                        children: keys.map((e) => _buildItemSlot(e, size: slotSize)).toList(),
                      ),
                      const SizedBox(height: 15),
                      _buildLabel("Potions"),
                      Wrap(
                        spacing: 10,
                        children: potions.map((e) => _buildItemSlot(e, size: slotSize * 1.3)).toList(),
                      ),
                      const SizedBox(height: 15),
                      _buildLabel("Weapon"),
                      Center(child: _buildItemSlot(weapons[0], size: slotSize * 1.5)),
                    ],
                  ),
                ),
              ),

              // Character Section
              Expanded(
                child: Container(
                  color: Colors.grey[700],
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    children: [
                      const Text("Character", style: TextStyle(color: Colors.white, fontSize: 20)),
                      const SizedBox(height: 10),
                      Text(userData!.gamerTag, style: const TextStyle(color: Colors.white, fontSize: 18)),
                      const SizedBox(height: 10),
                      Expanded(
                        child: Image.asset(
                          'assets/img/playableCharacter/rogue/pixel.png',
                          fit: BoxFit.contain,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text("HP: ${userData!.currentHP} / ${userData!.maxHP}",
                          style: const TextStyle(color: Colors.white)),
                      _buildBar(userData!.currentHP / userData!.maxHP, Colors.red),
                      const SizedBox(height: 10),
                      Text("XP: ${userData!.currentXP} / ${userData!.toLevelUpXP}",
                          style: const TextStyle(color: Colors.white)),
                      _buildBar(userData!.currentXP / userData!.toLevelUpXP, Colors.blue),
                    ],
                  ),
                ),
              ),

              // Stats Section
              Expanded(
                child: Container(
                  color: Colors.grey[600],
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Stats", style: TextStyle(color: Colors.white, fontSize: 20)),
                      const SizedBox(height: 10),
                      ..._buildStats(userData!.currentStats),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildItemSlot(CurrentLootItem entry, {required double size}) {
    final isFake = entry.itemId.itemType == 'fake';

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isFake ? Colors.grey[700] : Colors.black45,
        image: !isFake && entry.itemId.imageURL != null
            ? DecorationImage(
                image: AssetImage('assets/img/item/potion/hyper.png'),
                fit: BoxFit.contain,
              )
            : null,
      ),
      child: entry.quantity > 0
          ? Align(
              alignment: Alignment.bottomRight,
              child: Text(
                'x${entry.quantity}',
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            )
          : null,
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Text(text, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildBar(double percent, Color color) {
    percent = percent.clamp(0.0, 1.0);
    return Container(
      height: 10,
      width: double.infinity,
      margin: const EdgeInsets.symmetric(vertical: 4),
      decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(4)),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: percent,
        child: Container(
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
        ),
      ),
    );
  }

  List<Widget> _buildStats(UserStats stats) {
    final Map<String, int> statMap = {
      'Strength': stats.strength,
      'Dexterity': stats.dexterity,
      'Intelligence': stats.intelligence,
      'Charisma': stats.charisma,
      'Defense': stats.defense,
    };
    final maxVal = statMap.values.reduce((a, b) => a > b ? a : b);

    return statMap.entries.map((entry) {
      final percent = (entry.value / maxVal).clamp(0.05, 1.0);
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("${entry.key}: ${entry.value}", style: const TextStyle(color: Colors.white)),
            _buildBar(percent, Colors.green),
          ],
        ),
      );
    }).toList();
  }
}