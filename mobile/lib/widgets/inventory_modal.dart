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
  InventoryItem? usingItem;
  List<InventoryItem> itemShopList = [];

  InventoryItem? purchasingItem;


  bool isShopOpen = false;
  bool isLoadingShop = false;

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
      final token = await fetchJWT(); // Your function to get stored JWT token

      final response = await http.get(
        Uri.parse('${getPath()}/api/auth/profile'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        final profile = UserProfile.fromJson(json['userProfile']);
        await storeJWT(json['token']); // Your function to store JWT token

        setState(() {
          userData = profile;
        });
        createInventorySections(profile.currentLoot);
      } else if (response.statusCode == 401 || response.statusCode == 403) {
        // Handle unauthorized - maybe navigate to login screen
        Navigator.of(context).pushReplacementNamed('/login');
      } else {
        print('Failed to fetch user data: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching user data: $e');
    }
  }

  Future<void> fetchItemShop() async {
    setState(() {
      isLoadingShop = true;
    });

    try {
      final token = await fetchJWT(); // Replace with your actual token fetching
      final response = await http.get(
        Uri.parse('${getPath()}/api/auth/inventory'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<InventoryItem> items = (data['items'] as List)
            .map((itemJson) => InventoryItem.fromJson(itemJson))
            .toList();

        setState(() {
          itemShopList = items;
        });

        await storeJWT(data['token']); // If token refresh is returned
      } else if (response.statusCode == 401 || response.statusCode == 403) {
        Navigator.pushReplacementNamed(context, '/');
      } else {
        print('Unexpected status: ${response.statusCode}');
      }
    } catch (e) {
      print("Error fetching inventory: $e");
    } finally {
      setState(() {
        isLoadingShop = false;
      });
    }
  }

  // Future<void> fetchItemShop() async {
  //   try {
  //     // final token = await fetchJWT();
  //     // final res = await http.get(
  //     //   Uri.parse("${getPath()}/api/auth/inventory"),
  //     //   headers: {"Authorization": "Bearer $token"},
  //     // );
  //     // if (res.statusCode == 200) {
  //     //   final json = jsonDecode(res.body);
  //     //   final items = (json as List)
  //     //       .map((itemJson) => InventoryItem.fromJson(itemJson))
  //     //       .toList();
  //     //   setState(() {
  //     //     itemShopList = items;
  //     //   });
  //     // }

  //     setState(() {
  //       itemShopList = [
  //         InventoryItem(
  //           id: 'key001',
  //           name: 'Phantom Eye Key',
  //           description: 'Key to unlock the Specter boss.',
  //           itemType: 'Key',
  //           damage: 0,
  //           imageURL: 'health_mini.png',
  //         ),
  //       ];
  //     });
  //   } catch (e) {
  //     print("Failed to load shop items: $e");
  //   }
  // }

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
  return Theme(
    data: ThemeData.dark().copyWith(
      scaffoldBackgroundColor: const Color(0xFF1C1F26),
      textTheme: const TextTheme(
        bodyMedium: TextStyle(fontFamily: 'RobotoMono', fontSize: 14),
      ),
    ),
    child: Scaffold(
      body: userData == null
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: Column(
                children: [
                  _buildCloseHeader(),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildSection(_buildInventory()),
                          const SizedBox(height: 12),
                          _buildSection(isShopOpen ? _buildShopSection() : _buildCharacterSection()),
                          const SizedBox(height: 12),
                          _buildSection(_buildStatsSection()),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    ),
  );

  }

  Widget _buildCloseHeader() => GestureDetector(
        onTap: widget.onClose,
        child: Container(
          width: double.infinity,
          color: const Color(0xFFEC5C54),
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: const Center(
            child: Text(
              'Close',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
        ),
      );

  Widget _buildSection(Widget child) {
  return Container(
    decoration: BoxDecoration(
      color: const Color(0xFF282B33),
      borderRadius: BorderRadius.circular(8),
    ),
    padding: const EdgeInsets.all(16),
    child: child,
  );
}


 Widget _buildInventory() {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _buildHeader("Inventory"),
      const SizedBox(height: 16),
      _buildLabel("Boss Keys"),
      _buildItemGrid(keys, 5, itemType: 'Key'),
      const SizedBox(height: 16),
      _buildLabel("Potions"),
      _buildItemGrid(potions, 3, itemType: 'Potion'),
      const SizedBox(height: 16),
      _buildLabel("Weapon"),
      _buildWeaponSlot(weapons.isNotEmpty ? weapons[0] : null),
      const SizedBox(height: 16),
      Wrap(
        spacing: 8,
        runSpacing: 8,
        crossAxisAlignment: WrapCrossAlignment.center,
        alignment: WrapAlignment.spaceBetween,
        children: [
          _buildOpenShopButton(),
          _buildCurrencyDisplay(userData!.currency),
        ],
      ),

    ],
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
    // return Flexible(
      return ElevatedButton(
        onPressed: () {
          // Handle open shop logic
          isShopOpen = true; // Open the shop modal
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
      );
    // );
  }

  Widget _buildCurrencyDisplay(int currency) {
    // return Flexible(
      return Container(
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
              'assets/img/shopIcon.png', // Placeholder for coin image
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
      );
    // );
  }

  Widget _buildCharacterSection() {
  final hpPercent = userData!.currentHP / userData!.maxHP;
  final xpPercent = userData!.currentXP / userData!.toLevelUpXP;

  return Column(
    crossAxisAlignment: CrossAxisAlignment.center,
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
      Image.asset(
        'assets/img/playableCharacter/rogue/pixel.png',
        fit: BoxFit.contain,
        height: 120,
      ),
      const SizedBox(height: 16),
      _buildStatTextWithBar("HP", userData!.currentHP, userData!.maxHP, hpPercent, const Color(0xFF75B853)),
      const SizedBox(height: 10),
      _buildStatTextWithBar("Level ${userData!.level} -- XP", userData!.currentXP, userData!.toLevelUpXP, xpPercent, const Color(0xFF4A90E2)),
    ],
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
  final int maxStatValue = 20;

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _buildHeader("Stats"),
      const SizedBox(height: 16),
      _buildStatRow("STRENGTH", stats.strength, maxStatValue, const Color(0xFFF39C12)),
      _buildStatRow("DEXTERITY", stats.dexterity, maxStatValue, const Color(0xFF8E44AD)),
      _buildStatRow("INTELLIGENCE", stats.intelligence, maxStatValue, const Color(0xFF4A90E2)),
      _buildStatRow("CHARISMA", stats.charisma, maxStatValue, const Color(0xFF75B853)),
      _buildStatRow("DEFENSE", stats.defense, maxStatValue, const Color(0xFFEC5C54)),
      const SizedBox(height: 12),
      _buildDeleteAccountButton(),
    ],
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


  
  // ADDED
  Widget _buildShopSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[700],
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey[600],
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Center(
              child: Text(
                'Item Shop',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Weapons Section
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.green[800],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Weapons',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: itemShopList
                      .where((item) => item.itemType == 'Weapon')
                      .map((item) => ItemWidget(
                            itemData: item,
                            onClick: () => print(item),
                          ))
                      .toList(),
                )
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Potions Section
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.purple[800],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Potions',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: itemShopList
                      .where((item) => item.itemType == 'Potion')
                      .map((item) => ItemWidget(
                            itemData: item,
                            onClick: () => print(item),
                          ))
                      .toList(),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

}




class ItemWidget extends StatelessWidget {
  final InventoryItem itemData;
  final VoidCallback onClick;
  final double size;
  final bool showQuantity;
  final int quantity;

  const ItemWidget({
    Key? key,
    required this.itemData,
    required this.onClick,
    this.size = 50,
    this.showQuantity = false,
    this.quantity = 0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onClick,
      child: Stack(
        children: [
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: Colors.grey[800],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.white12, width: 1),
            ),
            padding: const EdgeInsets.all(6),
            child: Image.asset(
              'assets/item${itemData.imageURL}.png',
              fit: BoxFit.contain,
            ),
          ),
          if (showQuantity && quantity > 0 && itemData.itemType != 'Weapon')
            Positioned(
              right: 2,
              bottom: 2,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.blue[700],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'x$quantity',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
