import 'package:flutter/material.dart';

class CharacterSelectPage extends StatefulWidget {
  const CharacterSelectPage({super.key});

  @override
  State<CharacterSelectPage> createState() => _CharacterSelectPageState();
}

class _CharacterSelectPageState extends State<CharacterSelectPage> {
  int selectedScrollIndex = -1;
  final List<int> delays = [500, 243, 784, 1255];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background
          SizedBox.expand(
            child: Image.asset(
              'assets/pixel_bg2.png',
              fit: BoxFit.cover,
            ),
          ),

          // Home button
          Positioned(
            top: 40,
            right: 20,
            child: IconButton(
              icon: const Icon(Icons.logout),
              color: Colors.white,
              onPressed: () => Navigator.pushReplacementNamed(context, '/'),
            ),
          ),

          // Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'Choose Your Character',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 200,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: delays.length,
                    itemBuilder: (context, i) => Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: ScrollCharacterModel(
                        animDelay: delays[i],
                        isSelected: selectedScrollIndex == i,
                        index: i,
                        onClick: () => setState(() => selectedScrollIndex = i),
                      ),
                    ),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}

class ScrollCharacterModel extends StatefulWidget {
  final bool isSelected;
  final VoidCallback onClick;
  final int index;
  final int animDelay;

  const ScrollCharacterModel({
    super.key,
    required this.isSelected,
    required this.onClick,
    required this.index,
    required this.animDelay,
  });

  @override
  State<ScrollCharacterModel> createState() => _ScrollCharacterModelState();
}

class _ScrollCharacterModelState extends State<ScrollCharacterModel> {
  int frame = 0;
  bool isClicked = false;
  bool isHovered = false;
  final int totalFrames = 6;
  final int animationSpeed = 100;
  String error = '';

  @override
  void initState() {
    super.initState();
  }

  void handleClick() {
    setState(() {
      isClicked = true;
      frame = 0;
    });
    widget.onClick();
    sendIndex();
  }

  void sendIndex() async {
    if (widget.index == 0) {
      // Simulate API call
      await Future.delayed(const Duration(milliseconds: 500));
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/play');
      }
    }
  }

  String framePath(int frame) => 'assets/MageScrollAnimation/frame_$frame.png';

  @override
  Widget build(BuildContext context) {
    String defaultImage = 'assets/Closed_Pixel_Scroll_2.png';
    String hoverImage = 'assets/Mage_SliverOpen.png';
    String imageToShow = isClicked
        ? framePath(frame)
        : isHovered
            ? hoverImage
            : defaultImage;

    return MouseRegion(
      onEnter: (_) => setState(() => isHovered = true),
      onExit: (_) => setState(() => isHovered = false),
      child: GestureDetector(
        onTap: handleClick,
        child: Column(
          children: [
            Image.asset(
              imageToShow,
              height: widget.isSelected ? 120 : 80,
            ),
            if (widget.isSelected)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: ElevatedButton(
                  onPressed: sendIndex,
                  child: const Text("Select"),
                ),
              )
          ],
        ),
      ),
    );
  }
}
