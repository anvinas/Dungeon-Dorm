import 'package:flutter/material.dart';

class InventorySystem extends StatefulWidget {
  final VoidCallback onClose;

  const InventorySystem({Key? key, required this.onClose}) : super(key: key);

  @override
  State<InventorySystem> createState() => _InventorySystemState();
}

class _InventorySystemState extends State<InventorySystem> {
  // Replace these with your real models
  dynamic userData;
  List<dynamic> itemShopList = [];

  bool isShopOpen = false;
  dynamic purchasingItem;
  String buyError = "";

  // Example dummy data for item categories
  Map<String, List<dynamic>> itemsSeparatedObj = {
    'weapons': [],
    'potions': [],
    'keys': [],
  };

  @override
  void initState() {
    super.initState();
    fetchUserData();
    fetchItemShop();
  }

  Future<void> fetchUserData() async {
    // Your http call here, then:
    setState(() {
      userData = {/*...*/}; // update with actual data
      // Call your logic to separate items here
    });
  }

  Future<void> fetchItemShop() async {
    // Your http call here, then:
    setState(() {
      itemShopList = [/*...*/]; // update with actual shop list
    });
  }

  @override
  Widget build(BuildContext context) {
    if (userData == null) {
      return Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      backgroundColor: Colors.grey[900],
      body: SafeArea(
        child: Column(
          children: [
            ElevatedButton(
              onPressed: widget.onClose,
              child: Text('Close'),
            ),
            Expanded(
              child: Row(
                children: [
                  // Left inventory
                  Expanded(
                    child: Container(
                      color: Colors.grey[800],
                      child: Column(
                        children: [
                          Text('Inventory', style: TextStyle(color: Colors.white, fontSize: 24)),
                          // Your inventory UI here...
                        ],
                      ),
                    ),
                  ),

                  // Middle player/shop
                  Expanded(
                    child: Container(
                      color: Colors.grey[700],
                      child: isShopOpen ? 
                        Center(child: Text('Shop UI Placeholder', style: TextStyle(color: Colors.white))) :
                        Center(child: Text('Character UI Placeholder', style: TextStyle(color: Colors.white))),
                    ),
                  ),

                  // Right stats
                  Expanded(
                    child: Container(
                      color: Colors.grey[800],
                      child: Column(
                        children: [
                          Text('Stats', style: TextStyle(color: Colors.white, fontSize: 24)),
                          // Your stats UI here...
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
