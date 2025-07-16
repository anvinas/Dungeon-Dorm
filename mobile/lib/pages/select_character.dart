import 'package:flutter/material.dart';
import 'dart:async';

// Import your MapPage here, adjust the path as necessary
import 'play_page.dart';

class CharacterSelectPage extends StatefulWidget {
  @override
  _CharacterSelectPageState createState() => _CharacterSelectPageState();
}

class _CharacterSelectPageState extends State<CharacterSelectPage> {
  int selectedScrollIndex = -1;

  final List<int> allPossibleCharacterInfo = [
    500,
    243,
    784,
    1255,
  ];

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
              mainAxisAlignment: MainAxisAlignment.center,
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
                SizedBox(height: 30),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: allPossibleCharacterInfo.asMap().entries.map((entry) {
                      final index = entry.key;
                      final delay = entry.value;
                      return Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: ScrollCharacterModel(
                          index: index,
                          animDelay: delay,
                          isSelected: selectedScrollIndex == index,
                          onSelect: () => setState(() => selectedScrollIndex = index),
                        ),
                      );
                    }).toList(),
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ScrollCharacterModel extends StatefulWidget {
  final int index;
  final int animDelay;
  final bool isSelected;
  final VoidCallback onSelect;

  const ScrollCharacterModel({
    required this.index,
    required this.animDelay,
    required this.isSelected,
    required this.onSelect,
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

  String get framePath => 'assets/MageScrollAnimation/frame_${frame.clamp(0, totalFrames - 1)}.png';

  String get defaultImage => 'assets/Closed_Pixel_Scroll_2.png';
  String get hoverImage => 'assets/Mage_SliverOpen.png';

  void startAnimation() {
    isClicked = true;
    frame = 0;
    animationTimer?.cancel();

    animationTimer = Timer.periodic(Duration(milliseconds: animationSpeed), (timer) {
      if (frame < totalFrames - 1) {
        setState(() => frame++);
      } else {
        timer.cancel();
        setState(() {}); // lock on last frame
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
            final baseWidth = screenWidth * 0.18; // 18% of screen width
            final baseHeight = baseWidth * 1.4;

            final width = widget.isSelected ? baseWidth * 1.2 : baseWidth;
            final height = widget.isSelected ? baseHeight * 1.2 : baseHeight;

            return Column(
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
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
                    onPressed: () async {
                      print("Character ${widget.index} selected");
                      // TODO: Place API call here, await it, and check result
                      // For now, we just navigate immediately

                      if (context.mounted) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const MapPage()),
                        );
                      }
                    },
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
            'assets/pixel_bg2.png',
            fit: BoxFit.cover,
            width: double.infinity,
            height: double.infinity,
          ),
        );
      },
    );
  }
}
