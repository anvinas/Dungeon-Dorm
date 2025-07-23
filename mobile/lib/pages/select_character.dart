import 'package:flutter/material.dart';
import 'dart:async';
import 'play_page.dart'; // Replace with your actual route
import '../utils/get_path.dart';
import '../utils/jwt_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CharacterSelectPage extends StatefulWidget {
  @override
  _CharacterSelectPageState createState() => _CharacterSelectPageState();
}

class _CharacterSelectPageState extends State<CharacterSelectPage> {
  int selectedScrollIndex = -1;
  String? error;
  String? successMessage;

  List<Map<String, String>> allPossibleCharacterInfo = [
    {"id": "685d632886585be7727d064c", "name": "warlock"},
    {"id": "68655295dd55124b4da9b83d", "name": "bard"},
    {"id": "686552bddd55124b4da9b83e", "name": "barbarian"},
    {"id": "68655353dd55124b4da9b83f", "name": "rogue"},
  ];


  void onCharacterSelected(int index) async {
    setState(() {
      error = null;
      successMessage = null;
    });

    try {
      final token = await fetchJWT(); // Get your JWT token

      final response = await http.post(
        Uri.parse('${getPath()}/api/user/select-character'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'characterClassId': allPossibleCharacterInfo[index]['id'], 
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await storeJWT(data['token']); // Store new token if needed

        setState(() {
          successMessage = "Character selected successfully!";
        });

        print(data); // For debugging
      } else {
        final data = jsonDecode(response.body);
        setState(() {
          error = data['error'] ?? 'Failed to select character.';
        });
      }
    } catch (e) {
      setState(() {
        error = "Server Error | contact admin";
      });
      print("Error selecting character: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          AnimatedBackground(),
          Positioned(
            top: 40,
            right: 40,
            child: IconButton(
              icon: Icon(Icons.logout, color: Colors.white),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "Choose Your Character",
                  style: TextStyle(
                    fontSize: 36,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Jersey10',
                    shadows: [
                      Shadow(blurRadius: 4, offset: Offset(2, 2), color: Colors.black),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: allPossibleCharacterInfo.asMap().entries.map((entry) {
                      final index = entry.key;
                      final data = entry.value;
                      final name = data["name"]!;
                      return Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: ScrollCharacterModel(
                          index: index,
                          name:name,
                          animDelay: 100,
                          isSelected: selectedScrollIndex == index,
                          onSelect: () => setState(() => selectedScrollIndex = index),
                          onSelectCharacter: onCharacterSelected,
                        ),
                      );
                    }).toList(),
                  ),
                ),
                if (error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(6)),
                      child: Text(error!, style: TextStyle(color: Colors.red)),
                    ),
                  ),
              ],
            ),
          ),
          if (successMessage != null)
            Center(
              child: Container(
                padding: EdgeInsets.all(24),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(successMessage!, style: TextStyle(fontWeight: FontWeight.bold)),
                    SizedBox(height: 16),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.black),
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const GameMapPage()));
                      },
                      child: Text("BEGIN YOUR JOURNEY"),
                    ),
                  ],
                ),
              ),
            )
        ],
      ),
    );
  }
}

class ScrollCharacterModel extends StatefulWidget {
  final int index;
  final String name;
  final int animDelay;
  final bool isSelected;
  final VoidCallback onSelect;
  final Function(int index) onSelectCharacter;

  const ScrollCharacterModel({
    required this.index,
    required this.name,
    required this.animDelay,
    required this.isSelected,
    required this.onSelect,
    required this.onSelectCharacter,
  });

  @override
  _ScrollCharacterModelState createState() => _ScrollCharacterModelState();
}

class _ScrollCharacterModelState extends State<ScrollCharacterModel> {
  bool isHovered = false;
  bool isClicked = false;
  int frame = 0;
  Timer? animationTimer;
  final int totalFrames = 6;
  final int animationSpeed = 100;

  // String get framePath => 'assets/img/MageScrollAnimation/frame_${frame.clamp(0, totalFrames - 1)}.png';
  String get framePath => 'assets/img/playableCharacter/${widget.name}/scroll/animation/frame_${frame.clamp(0, totalFrames - 1)}.png';

  // String get defaultImage => 'assets/img/Closed_Pixel_Scroll_2.png';
  String get defaultImage => 'assets/img/playableCharacter/${widget.name}/scroll/closed.png';

  // String get hoverImage => 'assets/img/Mage_SliverOpen.png';
  String get hoverImage => 'assets/img/playableCharacter/${widget.name}/scroll/peek.png';

  void startAnimation() {
    isClicked = true;
    frame = 0;
    animationTimer?.cancel();

    animationTimer = Timer.periodic(Duration(milliseconds: animationSpeed), (timer) {
      if (frame < totalFrames - 1) {
        setState(() => frame++);
      } else {
        timer.cancel();
        setState(() {}); // stay on last frame
      }
    });
  }

  @override
  void dispose() {
    animationTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String imageToShow = isClicked ? framePath : (isHovered ? hoverImage : defaultImage);

    return GestureDetector(
      onTap: () {
        startAnimation();
        widget.onSelect();
      },
      child: MouseRegion(
        onEnter: (_) => setState(() => isHovered = true),
        onExit: (_) => setState(() => isHovered = false),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final screenWidth = MediaQuery.of(context).size.width;
            final baseWidth = screenWidth * 0.18;
            final baseHeight = baseWidth * 1.4;

            final width = widget.isSelected ? baseWidth * 1.2 : baseWidth;
            final height = widget.isSelected ? baseHeight * 1.2 : baseHeight;

            return Column(
              children: [
                AnimatedContainer(
                  duration: Duration(milliseconds: 300),
                  width: width,
                  height: height,
                  child: Image.asset(
                    imageToShow,
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) => Image.asset(defaultImage),
                  ),
                ),
                if (widget.isSelected)
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.black,
                    ),
                    onPressed: () => widget.onSelectCharacter(widget.index),
                    child: const Text("Select"),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class AnimatedBackground extends StatefulWidget {
  @override
  _AnimatedBackgroundState createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _brightness;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: Duration(seconds: 3))..repeat(reverse: true);
    _brightness = Tween<double>(begin: 0.3, end: 0.15).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _brightness,
      builder: (context, child) {
        return ColorFiltered(
          colorFilter: ColorFilter.mode(
            Colors.black.withOpacity(1 - _brightness.value),
            BlendMode.darken,
          ),
          child: Image.asset(
            'assets/login/pixel_bg2.png',
            fit: BoxFit.cover,
            width: double.infinity,
            height: double.infinity,
          ),
        );
      },
    );
  }
}
