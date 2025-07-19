// Flutter version of InventorySystem.tsx, updated to align with the provided types.dart structure

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
      final token = await fetchJWT();
      final res = await http.get(
        Uri.parse("${getPath()}/api/auth/profile"),
        headers: {"Authorization": "Bearer $token"},
      );
      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);
        final profile = UserProfile.fromJson(json['userProfile']);
        await storeJWT(json['token']);
        setState(() {
          userData = profile;
        });
        createInventorySections(profile.currentLoot);
      }
    } catch (e) {
      print("Failed to load user data: $e");
    }
  }

  Future<void> fetchItemShop() async {
    try {
      final token = await fetchJWT();
      final res = await http.get(
        Uri.parse("${getPath()}/api/auth/inventory"),
        headers: {"Authorization": "Bearer $token"},
      );
      if (res.statusCode == 200) {
        final json = jsonDecode(res.body);
        final items = (json as List)
            .map((itemJson) => InventoryItem.fromJson(itemJson))
            .toList();
        setState(() {
          itemShopList = items;
        });
      }
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
    if (userData == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final userHPPercent =
        (userData!.currentHP / userData!.maxHP).clamp(0.0, 1.0) * 100;
    final userXPPercent =
        (userData!.currentXP / userData!.toLevelUpXP).clamp(0.0, 1.0) * 100;

    return Column(
      children: [
        ElevatedButton(
          onPressed: widget.onClose,
          style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
          child: const Text("Close"),
        ),
        Expanded(
          child: Row(
            children: [
              Expanded(child: buildInventorySection()),
              Expanded(child: buildCharacterSection(userHPPercent, userXPPercent)),
              Expanded(child: buildStatsSection()),
            ],
          ),
        )
      ],
    );
  }

  Widget buildInventorySection() {
    return Container(
      color: Colors.grey[800],
      padding: const EdgeInsets.all(10),
      child: Column(
        children: [
          const Text("Inventory", style: TextStyle(color: Colors.white, fontSize: 20)),
          const SizedBox(height: 10),
          const Text("Potions"),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: potions
                .map((entry) => buildItemSlot(entry))
                .toList(),
          ),
          const SizedBox(height: 10),
          const Text("Weapon"),
          if (weapons.isNotEmpty) buildItemSlot(weapons.first),
          const SizedBox(height: 10),
          const Text("Keys"),
          Wrap(
            children: keys.map((entry) => buildItemSlot(entry)).toList(),
          )
        ],
      ),
    );
  }

  Widget buildItemSlot(CurrentLootItem entry) {
    return Padding(
      padding: const EdgeInsets.all(4.0),
      child: GestureDetector(
        onTap: () {
          if (entry.itemId.itemType == 'Potion') {
            setState(() => usingItem = entry.itemId);
          }
        },
        child: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: Colors.black45,
            shape: BoxShape.circle,
            image: entry.itemId.imageURL != null
                ? DecorationImage(
                    image: AssetImage('assets/item/${entry.itemId.imageURL}'),
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
        ),
      ),
    );
  }

  Widget buildCharacterSection(double hpPercent, double xpPercent) {
    return Container(
      color: Colors.grey[700],
      padding: const EdgeInsets.all(10),
      child: Column(
        children: [
          const Text("Character", style: TextStyle(color: Colors.white, fontSize: 20)),
          const SizedBox(height: 10),
          Image.asset(
            'assets/playableCharacter/${userData!.character.characterClass.toLowerCase()}/pixel.png',
            height: 100,
          ),
          const SizedBox(height: 10),
          Text("HP: ${userData!.currentHP}/${userData!.maxHP}"),
          buildProgressBar(hpPercent, Colors.red),
          const SizedBox(height: 10),
          Text("XP: ${userData!.currentXP}/${userData!.toLevelUpXP}"),
          buildProgressBar(xpPercent, Colors.blue),
        ],
      ),
    );
  }

  Widget buildStatsSection() {
    final stats = userData!.currentStats;
    final values = [
      stats.strength,
      stats.dexterity,
      stats.intelligence,
      stats.charisma,
      stats.defense
    ];
    final maxStat = values.reduce((a, b) => a > b ? a : b);

    return Container(
      color: Colors.grey[600],
      padding: const EdgeInsets.all(10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Stats", style: TextStyle(color: Colors.white, fontSize: 20)),
          const SizedBox(height: 10),
          statRow("Strength", stats.strength, maxStat),
          statRow("Dexterity", stats.dexterity, maxStat),
          statRow("Intelligence", stats.intelligence, maxStat),
          statRow("Charisma", stats.charisma, maxStat),
          statRow("Defense", stats.defense, maxStat),
        ],
      ),
    );
  }

  Widget statRow(String label, int value, int max) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("$label: $value"),
        buildProgressBar((value / max) * 100, Colors.green),
        const SizedBox(height: 5),
      ],
    );
  }

  Widget buildProgressBar(double percent, Color color) {
    return Container(
      width: double.infinity,
      height: 10,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(5),
        color: Colors.black,
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: percent / 100,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(5),
            color: color,
          ),
        ),
      ),
    );
  }
}
