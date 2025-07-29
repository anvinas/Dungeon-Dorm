import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/types.dart';
import '../utils/get_path.dart';
import '../utils/jwt_storage.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class InventorySystem extends StatefulWidget {
  final VoidCallback onClose;
  final void Function(int) onHealthChange;

  const InventorySystem({required this.onClose,required this.onHealthChange, Key? key}) : super(key: key);

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

  String buyError = "";
  String usingError = "";
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
        final List<InventoryItem> items = (data as List<dynamic>)
          .map((itemJson) => InventoryItem.fromJson(itemJson))
          .toList();

        print(items);
        setState(() {
          itemShopList = items;
        });

        // await storeJWT(data['token']); // If token refresh is returned
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

  void handleOnPressLogout(BuildContext context) async {
    final confirmLogout = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Confirm Logout"),
          content: Text("Are you sure you want to log out of your account?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text("Cancel"),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: Text("Logout"),
            ),
          ],
        );
      },
    );

    if (confirmLogout == true) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('jwt'); // Remove the stored JWT
      print("JWT removed");

      // Navigate to the root route and remove all previous routes from the stack
      Navigator.of(context).pushNamedAndRemoveUntil('/', (Route<dynamic> route) => false);
    }
  }


  void handleOnPressDelete(BuildContext context) async {
    final confirmDelete = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Confirm Delete"),
          content: Text("Are you sure you want to delete your account?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text("Cancel"),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: Text("Delete"),
            ),
          ],
        );
      },
    );

    if (confirmDelete == true) {
      try {
        final token = await fetchJWT(); // your function to get the JWT
        final url = Uri.parse("${getPath()}/api/user/delete-user-progress");

        final response = await http.post(
          url,
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        );

        if (response.statusCode == 200) {
          Navigator.of(context).pushReplacementNamed('/');
        } else if (response.statusCode == 401 || response.statusCode == 403) {
          Navigator.of(context).pushReplacementNamed('/');
        } else {
          print("Error deleting account: ${response.body}");
          setState(() {
            buyError = "Something went wrong: ${response.body}";
          });
        }
      } catch (e) {
        print("Error deleting account: $e");
        setState(() {
          buyError = "Server Error";
        });
      }
    }
  }

  int countRealItems(List<CurrentLootItem> arr) {
    int count = 0;
    for (var itemData in arr) {
      if (itemData.itemId.itemType != 'fake') {
        count++;
      }
    }
    return count;
  }


  Future<void> handleBuyItem(InventoryItem itemData, int quantity, int price) async {
    setState(() {
      buyError = "";
    });

    // Check for weapon slot
    if (itemData.itemType == "Weapon") {
      if (countRealItems(weapons ?? []) >= 1) {
        setState(() {
          buyError = "Weapon slot is already used";
        });
        return;
      }
    }

    // Check for potion slot
    if (itemData.itemType == "Potion") {
      if (countRealItems(potions ?? []) >= 3) {
        bool allowBuy = false;

        for (int i = 0; i < 3; i++) {
          final itemSlot = potions?[i];
          if (itemSlot != null && itemSlot.itemId.id == itemData.id) {
            allowBuy = true;
            break;
          }
        }

        if (!allowBuy) {
          setState(() {
            buyError = "All potion slots are full";
          });
          return;
        }
      }
    }

    // Keys can't be purchased
    if (itemData.itemType == "Key") {
      return;
    }

    try {
      final token = await fetchJWT();
      final response = await http.post(
        Uri.parse("${getPath()}/api/user/purchase-item"),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token"
        },
        body: jsonEncode({
          "itemId": itemData.id,
          "quantity": quantity,
          "price": price
        }),
      );

      if (response.statusCode == 200) {
        final resData = jsonDecode(response.body);
        print(resData['user']['CurrentLoot'][0]['itemId'].runtimeType); // Should be Map<String, dynamic>
        print(resData['user']['Character'].runtimeType); // Check if this is a string or object

        print(resData);
        final profile = UserProfile.fromJson(resData['user']);

        setState(() {
          isShopOpen = false;
        });
        createInventorySections(profile.currentLoot);
        storeJWT(resData["token"]);

      } else {
        final error = jsonDecode(response.body);
        setState(() {
          buyError = error["error"] ?? "Server Error";
        });
        

        if (response.statusCode == 401 || response.statusCode == 403) {
          Navigator.pushReplacementNamed(context, '/');
        }
      }
    } catch (e) {
       setState(() {
          buyError = "Network Error";
        });
      print("Error buying item: $e");
    }
  }
  
  Future<void> handleUseItem(InventoryItem itemData) async {
    setState(() {
      usingError = "";
    });

    if (itemData.itemType != "Potion") {
      setState(() {
        usingError = "Cannot use Item";
      });
      return;
    }

    try {
      final token = await fetchJWT();      

      final response = await http.post(
        Uri.parse("${getPath()}/api/user/use-item"),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({"itemId": itemData.id}),
      );

      if (response.statusCode == 200) {
        
        final data = jsonDecode(response.body);
        // print(data['user']['CurrentLoot'][0]['itemId'].runtimeType); // Should be Map<String, dynamic>
        // print(data['user']['Character'].runtimeType); // Check if this is a string or object

        print(data);
        print("heree after token");
        final updatedUser = UserProfile.fromJson(data['user']);

        final newToken = data['token'];

        // Update local JWT
        storeJWT(data["token"]);
        print(updatedUser);
        // Update current loot
        createInventorySections(updatedUser.currentLoot);

        setState(() {
          usingItem = null;
          usingError="";
          userData = updatedUser;
        });
        widget.onHealthChange(updatedUser.currentHP);
        
      } else if (response.statusCode == 401 || response.statusCode == 403) {
        Navigator.of(context).pushReplacementNamed('/');
      } else {
        final error = jsonDecode(response.body)['error'] ?? "Server Error";
        setState(() {
          usingError = error;
        });
      }
    } catch (e) {
      print("Error using item: $e");
      setState(() {
        usingError = "Something went wrong. Please try again.";
      });
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
                          _buildSection(
                            usingItem != null 
                              ? _buildUsingItemPage(
                                usingItem!,
                                onClickUse: (item) {
                                  handleUseItem(item); // Your custom logic
                                },
                                error: usingError,
                                onPressBack: () {
                                  setState(() {
                                    usingItem = null;
                                    usingError = "";
                                  });
                                },
                              )
                              : _buildInventory()
                          ),
                          const SizedBox(height: 12),
                          // Middle screen
                          _buildSection(
                            isShopOpen && purchasingItem != null
                              ? _buildPurchasingSection(
                                  itemData: purchasingItem!,
                                  onClickBuy: (purchasingItem, quantity, price) => handleBuyItem(purchasingItem, quantity, price),
                                  onPressBack: () {
                                    setState(() {
                                      purchasingItem = null;
                                    });
                                  },
                                  error: buyError,
                                )
                              : isShopOpen
                                  ? _buildShopSection()
                                  : _buildCharacterSection(),
                          ),
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
      _buildItemGrid( keys, 5, itemType: 'Key',),
      const SizedBox(height: 16),
      _buildLabel("Potions"),
      _buildItemGrid(
        potions, 
        3, 
        itemType: 'Potion',
        onItemTap: (item) {
          setState(() {
            usingItem = item.itemId;
          });
        },
      ),
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
          isShopOpen ? _buildCloseShopButton() : _buildOpenShopButton(),
          _buildCurrencyDisplay(userData!.currency),
        ],
      ),

    ],
  );
}



Widget _buildItemGrid(
  List<CurrentLootItem> items,
  int totalSlots, {
  required String itemType,
  void Function(CurrentLootItem)? onItemTap, 
}) {
  return LayoutBuilder(
    builder: (context, constraints) {
      final double spacing = 8.0;
      final int crossAxisCount = (constraints.maxWidth / (50 + spacing)).floor();
      final double itemWidth = (constraints.maxWidth - (crossAxisCount - 1) * spacing) / crossAxisCount;
      final double itemSize = itemWidth > 0 ? itemWidth : 50.0;

      List<Widget> slots = [];
      for (int i = 0; i < totalSlots; i++) {
        if (i < items.length) {
          // Wrap slot with GestureDetector if onItemTap is provided
          final itemWidget = _buildItemSlot(items[i], slotSize: itemSize);
          slots.add(
            GestureDetector(
              onTap: () {
                if (onItemTap != null) onItemTap(items[i]);
              },
              child: itemWidget,
            ),
          );
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


  Widget _buildItemGrid_InvItem(List<InventoryItem> items, int totalSlots, {required String itemType,  required Function(InventoryItem) onItemTap,}) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final double spacing = 8.0;
        final int crossAxisCount = (constraints.maxWidth / (50 + spacing)).floor();
        final double itemWidth = (constraints.maxWidth - (crossAxisCount - 1) * spacing) / crossAxisCount;
        final double itemSize = itemWidth > 0 ? itemWidth : 50.0;

        // FILTER by itemType
        List<InventoryItem> filteredItems = items.where((item) => item.itemType == itemType && item.imageURL!=null).toList();

        List<Widget> slots = [];
        for (int i = 0; i < totalSlots; i++) {
          if (i < filteredItems.length) {
            slots.add(
              GestureDetector(
                onTap: () => onItemTap(filteredItems[i]),
                child: _buildItemSlot_InvItem(filteredItems[i], slotSize: itemSize),
              ),
            );
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
  Widget _buildItemSlot_InvItem(InventoryItem item, {required double slotSize}) {
    return Container(
      width: slotSize,
      height: slotSize,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1D24),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color.fromARGB(31, 66, 204, 11), width: 1),
      ),
      child: Stack(
        children: [
          if (item.imageURL != null)
            Center(
              child: Image.asset(
                'assets/img/item${item.imageURL}.png',
                fit: BoxFit.contain,
                width: slotSize * 0.7,
                height: slotSize * 0.7,
              ),
            ),
          //if (item.itemType != 'Weapon') // Show quantity if not a weapon
          Positioned(
            bottom: 4,
            right: 4,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text(
                'x1', // Always 1 for InventoryItem
                style: TextStyle(
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

Widget _buildUsingItemPage(
  InventoryItem itemData, {
  required VoidCallback onPressBack,
  required void Function(InventoryItem) onClickUse,
  String? error,
}) {
  return Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: Colors.grey[800],
      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.grey[700],
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Center(
            child: Text(
              "Use Item",
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Name and Description
        Text(
          itemData.name ?? '',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          itemData.description ?? '',
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 14,
          ),
          textAlign: TextAlign.center,
        ),

        const SizedBox(height: 16),

        // Image
        Center(
            child: Image.asset(
              "assets/img/item${itemData.imageURL}.png",
              fit: BoxFit.contain,
              height: 120,
            ),
        ),

        const SizedBox(height: 16),

        // Buttons
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red[600],
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              onPressed: onPressBack,
              child: const Text("Back"),
            ),
            const SizedBox(width: 12),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green[600],
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              onPressed: () => onClickUse(itemData),
              child: const Text("Use"),
            ),
          ],
        ),

        // Error
        if (error != null && error.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Text(
              error,
              style: const TextStyle(
                color: Colors.redAccent,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ),
      ],
    ),
  );
}

  Widget _buildPurchasingSection({
  required InventoryItem itemData,
  required Function(InventoryItem itemData, int quantity, int price) onClickBuy,
  required VoidCallback onPressBack,
  required String error,
}) {
  int quantity = 1;
  int price = itemData.baseValue * quantity;

  return StatefulBuilder(
    builder: (context, setState) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: const BoxDecoration(
          color: Color(0xFF374151), // bg-gray-700
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF4B5563), // bg-gray-600
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Center(
                child: Text(
                  "Purchase Item",
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Name and Description
            Text(
              itemData.name,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              itemData.description,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.white70,
              ),
            ),

            const SizedBox(height: 12),

            // Image
            Center(
                child: Image.asset(
                  "assets/img/item${itemData.imageURL}.png",
                  fit: BoxFit.contain,
                  height: 120,
                ),
            ),

            const SizedBox(height: 12),

            // Quantity and Total
            Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      "Quantity:",
                      style: TextStyle(color: Colors.white),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 60,
                      height: 40,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: TextField(
                        keyboardType: TextInputType.number,
                        onChanged: (val) {
                          final q = int.tryParse(val) ?? 1;
                          final clamped = q < 1 ? 1 : (q > 99 ? 99 : q);
                          if (itemData.itemType == "Weapon") {
                            setState(() {
                              quantity = 1;
                              price = itemData.baseValue;
                            });
                          } else {
                            setState(() {
                              quantity = clamped;
                              price = itemData.baseValue * clamped;
                            });
                          }
                        },
                        controller: TextEditingController(text: quantity.toString()),
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.black),
                        decoration: const InputDecoration(border: InputBorder.none),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  "Total: $price gold",
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red[700],
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  onPressed: onPressBack,
                  child: const Text("Back", style: TextStyle(color: Colors.white)),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green[700],
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  onPressed: () => onClickBuy(itemData, quantity, price),
                  child: const Text("Buy", style: TextStyle(color: Colors.white)),
                ),
              ],
            ),

            const SizedBox(height: 10),

            if (error.isNotEmpty)
              Text(
                error,
                style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w600),
              ),
          ],
        ),
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
                'assets/img/item${item.imageURL}.png', // Ensure this path is correct
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
                      'assets/img/item${item!.imageURL}.png', // Adjust path as needed
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
          setState(() {
            isShopOpen = true;
          });
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
  Widget _buildCloseShopButton() {
    // return Flexible(
      return ElevatedButton(
        onPressed: () {
          // Handle open shop logic
          setState(() {
            isShopOpen = false;
          });
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
            "Close Shop",
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
        'assets/img/playableCharacter/${userData!.character.characterClass.toLowerCase()}/pixel.png',
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
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildLogoutButton(), 
          const SizedBox(width: 12),
          _buildDeleteAccountButton(),
        ],
    ),
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

  Widget _buildLogoutButton() {
    return Center(
      child: ElevatedButton(
        onPressed: () {
          // Handle delete account logic
          handleOnPressLogout(context);
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color.fromARGB(255, 218, 84, 236), // Red from image
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        child: const Text(
          "Logout",
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildDeleteAccountButton() {
    return Center(
      child: ElevatedButton(
        onPressed: () {
          // Handle delete account logic
          handleOnPressDelete(context);
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
          _buildLabel("Weapons"),
          _buildItemGrid_InvItem(
            itemShopList, 
            5, 
            itemType: 'Weapon',
            onItemTap: (item) {
              setState(() {
                purchasingItem = item;
              });
            },
          ),
          const SizedBox(height: 16),
          
          // Potions Section
          _buildLabel("Potions"),
          _buildItemGrid_InvItem(
            itemShopList, 
            5, 
            itemType: 'Potion',
            onItemTap: (item) {
              setState(() {
                purchasingItem = item;
              });
            },
          ),
          const SizedBox(height: 16),
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
              //'assets/img/item${itemData.imageURL}.png',
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
