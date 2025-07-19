import 'package:flutter/material.dart';
import '../utils/types.dart';
import '../utils/get_path.dart';
import '../utils/jwt_storage.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class InventorySystem extends StatefulWidget {
  final VoidCallback onClose;

  const InventorySystem({required this.onClose, Key? key}) : super(key: key);

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
        gamerTag: 'NewGamer', // Updated gamerTag
        level: 1, // Updated level
        currency: 500, // Updated currency
        maxHP: 100,
        currentHP: 100, // Updated currentHP
        currentStats: UserStats(
          strength: 0, // Updated stats
          dexterity: 0,
          intelligence: 0,
          charisma: 2,
          defense: 0,
        ),
        currentLoot: [
          CurrentLootItem(
            id: 'c001',
            quantity: 3, // Updated quantity
            itemId: InventoryItem(
              id: 'potion001',
              name: 'Health Potion',
              description: 'Restores 50 HP',
              damage: 0,
              itemType: 'Potion',
              imageURL: 'potion/hyper.png', // Assuming this path exists
              healthAmount: 50,
            ),
          ),
          CurrentLootItem(
            id: 'c002',
            quantity: 1,
            itemId: InventoryItem(
              id: 'weapon001', // Changed ID for clarity
              name: 'Wooden Bow', // Changed name for clarity
              description: 'A basic wooden bow.',
              damage: 5,
              itemType: 'Weapon',
              imageURL: 'weapon/bow.png', // Assuming this path exists
            ),
          ),
          CurrentLootItem(
            id: 'c003',
            quantity: 1,
            itemId: InventoryItem(
              id: 'key001',
              name: 'Phantom Eye Key',
              description: 'Key to unlock the Specter boss.',
              itemType: 'Key',
              damage: 0,
              imageURL: 'key/phantom_eye_key.png', // Placeholder image for key
            ),
          ),
          CurrentLootItem(
            id: 'c004',
            quantity: 1,
            itemId: InventoryItem(
              id: 'key002',
              name: 'Whispering Heart Key',
              description: 'Key to unlock another boss.',
              itemType: 'Key',
              damage: 0,
              imageURL: 'key/whispering_heart_key.png', // Placeholder image for key
            ),
          ),
        ],
        character: Character(
          id: 'char001',
          species: 'Elf', // Match image
          characterClass: 'Archer', // Match image
          maxHP: 100,
          stats: {
            'strength': 0,
            'dexterity': 0,
            'intelligence': 0,
            'charisma': 2,
            'defense': 0,
          },
        ),
        bosses: [],
        currentActiveBoss: null,
        createdAt: '',
        updatedAt: '',
        currentXP: 0, // Updated XP
        toLevelUpXP: 1000, // Updated XP
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
            name: 'Phantom Eye Key',
            description: 'Key to unlock the Specter boss.',
            itemType: 'Key',
            damage: 0,
            imageURL: 'key/phantom_eye_key.png',
          ),
          InventoryItem(
            id: 'key002',
            name: 'Whispering Heart Key',
            description: 'Key to unlock another boss.',
            itemType: 'Key',
            damage: 0,
            imageURL: 'key/whispering_heart_key.png',
          ),
          InventoryItem(
            id: 'potion001',
            name: 'Health Potion',
            description: 'Restores 50 HP',
            itemType: 'Potion',
            healthAmount: 50,
            damage: 0,
            imageURL: 'potion/hyper.png',
          ),
          InventoryItem(
            id: 'weapon001',
            name: 'Wooden Bow',
            description: 'A basic wooden bow.',
            damage: 5,
            itemType: 'Weapon',
            imageURL: 'weapon/bow.png',
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

    return Scaffold(
      backgroundColor: const Color(0xFF333642), // Dark grey background from image
      body: Column(
        children: [
          // Close Button (Red Header)
          GestureDetector(
            onTap: widget.onClose,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              width: double.infinity,
              color: const Color(0xFFEC5C54), // Red from image
              child: const Center(
                child: Text(
                  "Close",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  _buildInventory(),
                  const SizedBox(width: 16), // Spacing between sections
                  _buildCharacterSection(),
                  const SizedBox(width: 16), // Spacing between sections
                  _buildStatsSection(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionContainer({required Widget child}) {
    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF282B33), // Slightly lighter dark grey for sections
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.all(16.0),
        child: child,
      ),
    );
  }

  Widget _buildInventory() {
    return _buildSectionContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader("Inventory"),
          const SizedBox(height: 16),
          _buildLabel("Boss Keys"),
          _buildItemGrid(keys, 5, itemType: 'Key'), // 5 slots for boss keys
          const SizedBox(height: 16),
          _buildLabel("Potions"),
          _buildItemGrid(potions, 3, itemType: 'Potion'), // 3 slots for potions
          const SizedBox(height: 16),
          _buildLabel("Weapon"),
          _buildWeaponSlot(weapons.isNotEmpty ? weapons[0] : null),
          const Spacer(),
          // Open Shop and Gold display
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildOpenShopButton(),
              _buildCurrencyDisplay(userData!.currency),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildItemGrid(List<CurrentLootItem> items, int totalSlots, {required String itemType}) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // Calculate item size dynamically based on available width and number of slots
        final double spacing = 8.0;
        final int crossAxisCount = (constraints.maxWidth / (50 + spacing)).floor(); // Approx 50px per item
        final double itemWidth = (constraints.maxWidth - (crossAxisCount - 1) * spacing) / crossAxisCount;
        final double itemSize = itemWidth > 0 ? itemWidth : 50.0; // Fallback for small constraints

        List<Widget> slots = [];
        for (int i = 0; i < totalSlots; i++) {
          if (i < items.length) {
            slots.add(_buildItemSlot(items[i], slotSize: itemSize));
          } else {
            slots.add(_buildEmptySlot(slotSize: itemSize));
          }
        }
        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: slots,
        );
      },
    );
  }

  Widget _buildItemSlot(CurrentLootItem entry, {required double slotSize}) {
    final item = entry.itemId;
    return Container(
      width: slotSize,
      height: slotSize,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1D24), // Darker grey for item slots
        borderRadius: BorderRadius.circular(8), // Square with rounded corners
        border: Border.all(color: Colors.white12, width: 1), // Subtle border
      ),
      child: Stack(
        children: [
          if (item.imageURL != null)
            Center(
              child: Image.asset(
                'assets/img/item/${item.imageURL}', // Ensure this path is correct
                fit: BoxFit.contain,
                width: slotSize * 0.7, // Adjust image size within slot
                height: slotSize * 0.7,
              ),
            ),
          if (entry.quantity > 0 && entry.itemId.itemType != 'Weapon') // Quantity for potions/keys
            Positioned(
              bottom: 4,
              right: 4,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  'x${entry.quantity}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildEmptySlot({required double slotSize}) {
    return Container(
      width: slotSize,
      height: slotSize,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1D24), // Darker grey for empty slots
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white12, width: 1),
      ),
    );
  }

  Widget _buildWeaponSlot(CurrentLootItem? entry) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final double slotHeight = 60.0; // Fixed height for weapon slot
        final double slotWidth = constraints.maxWidth; // Max width available

        final item = entry?.itemId;

        return Center(
          child: Container(
            width: slotWidth,
            height: slotHeight,
            decoration: BoxDecoration(
              color: const Color(0xFF1A1D24),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.white12, width: 1),
            ),
            child: Stack(
              alignment: Alignment.centerLeft,
              children: [
                const Padding(
                  padding: EdgeInsets.only(left: 8.0),
                  child: Text(
                    "Weapon",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                  ),
                ),
                if (item?.imageURL != null)
                  Positioned(
                    right: 0,
                    child: Image.asset(
                      'assets/img/item/${item!.imageURL}', // Adjust path as needed
                      fit: BoxFit.contain,
                      width: slotHeight, // Use height for square image
                      height: slotHeight,
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildOpenShopButton() {
    return Flexible(
      child: ElevatedButton(
        onPressed: () {
          // Handle open shop logic
          print("Open Shop button pressed!");
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent, // Transparent background
          elevation: 0, // No shadow
          padding: EdgeInsets.zero, // No internal padding
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4),
            side: const BorderSide(color: Colors.white54, width: 1), // White border
          ),
        ),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: const Text(
            "Open Shop",
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
            ),
            textAlign: TextAlign.center, // Center text in case it wraps
          ),
        ),
      ),
    );
  }

  Widget _buildCurrencyDisplay(int currency) {
    return Flexible(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.transparent, // Transparent background
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: Colors.white54, width: 1), // White border
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min, // Use min size for the row
          children: [
            Image.asset(
              'assets/img/coin.png', // Placeholder for coin image
              width: 20,
              height: 20,
              color: Colors.amber, // Gold coin color
            ),
            const SizedBox(width: 8),
            Text(
              '$currency',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCharacterSection() {
    final hpPercent = userData!.currentHP / userData!.maxHP;
    final xpPercent = userData!.currentXP / userData!.toLevelUpXP;

    return _buildSectionContainer(
      child: Column(
        children: [
          _buildHeader("Character"),
          const SizedBox(height: 16),
          Text(
            userData!.gamerTag,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          // Character image should try to take available space
          Expanded(
            child: Center(
              child: Image.asset(
                'assets/img/playableCharacter/rogue/pixel.png', // Or the actual character image
                fit: BoxFit.contain, // Adjusts size to fit without distortion
              ),
            ),
          ),
          const SizedBox(height: 16),
          _buildStatTextWithBar("HP", userData!.currentHP, userData!.maxHP, hpPercent, const Color(0xFF75B853)), // Green HP bar
          const SizedBox(height: 10),
          _buildStatTextWithBar("Level ${userData!.level} -- XP", userData!.currentXP, userData!.toLevelUpXP, xpPercent, const Color(0xFF4A90E2)), // Blue XP bar
        ],
      ),
    );
  }

  Widget _buildStatTextWithBar(String label, int current, int max, double percent, Color barColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "$label: $current / $max",
          style: const TextStyle(color: Colors.white, fontSize: 16),
        ),
        const SizedBox(height: 4),
        _buildProgressBar(percent, barColor),
      ],
    );
  }

  Widget _buildProgressBar(double percent, Color color) {
    percent = percent.clamp(0.0, 1.0); // Ensure percentage is between 0 and 1
    return Container(
      height: 16, // Thicker bar
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.black54, // Background of the bar
        borderRadius: BorderRadius.circular(8),
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: percent,
        child: Container(
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }

  Widget _buildStatsSection() {
    final stats = userData!.currentStats;
    final int maxStatValue = 20; // A reasonable max value for percentage calculation

    return _buildSectionContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader("Stats"),
          const SizedBox(height: 16),
          _buildStatRow("STRENGTH", stats.strength, maxStatValue, const Color(0xFFF39C12)), // Orange/Yellow
          _buildStatRow("DEXTERITY", stats.dexterity, maxStatValue, const Color(0xFF8E44AD)), // Purple
          _buildStatRow("INTELLIGENCE", stats.intelligence, maxStatValue, const Color(0xFF4A90E2)), // Blue
          _buildStatRow("CHARISMA", stats.charisma, maxStatValue, const Color(0xFF75B853)), // Green
          _buildStatRow("DEFENSE", stats.defense, maxStatValue, const Color(0xFFEC5C54)), // Red
          const Spacer(),
          _buildDeleteAccountButton(),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, int value, int max, Color barColor) {
    final percent = (value / max).clamp(0.0, 1.0); // Clamp to ensure valid percentage
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "$label : $value",
          style: const TextStyle(color: Colors.white, fontSize: 16),
        ),
        _buildProgressBar(percent, barColor),
        const SizedBox(height: 10), // Spacing between stat bars
      ],
    );
  }

  Widget _buildDeleteAccountButton() {
    return Center(
      child: ElevatedButton(
        onPressed: () {
          // Handle delete account logic
          print("Delete Account button pressed!");
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFEC5C54), // Red from image
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        child: const Text(
          "Delete Account",
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        color: Colors.white,
        fontWeight: FontWeight.bold,
        fontSize: 16,
      ),
    );
  }

  Widget _buildHeader(String text) {
    return Center(
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}