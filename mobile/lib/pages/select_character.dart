import 'dart:async';

import 'package:dungeon_and_dorms/utils/get_path.dart';
import 'package:dungeon_and_dorms/utils/jwt_storage.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class CharacterSelectPage extends StatefulWidget {
  @override
  _CharacterSelectPageState createState() => _CharacterSelectPageState();
}

class _CharacterSelectPageState extends State<CharacterSelectPage> {
  int selectedScrollIndex = -1;
  String? error;
  Map<String, dynamic>? successSelectionData;

  List<Map<String, dynamic>> allPossibleCharacterInfo = [
    {'id': "685d632886585be7727d064c", 'name': "warlock", 'animDelay': 500, 'scrollFrame': 1},
    {'id': "68655295dd55124b4da9b83d", 'name': "bard", 'animDelay': 943, 'scrollFrame': 1},
    {'id': "686552bddd55124b4da9b83e", 'name': "barbarian", 'animDelay': 3584, 'scrollFrame': 1},
    {'id': "68655353dd55124b4da9b83f", 'name': "rogue", 'animDelay': 1255, 'scrollFrame': 1},
  ];

  @override
  void initState() {
    super.initState();
    fetchUserData();
  }

  Future<void> fetchUserData() async {
    try {
      final token = await fetchJWT();
      final url = '${getPath()}/api/auth/profile';

      final response = await http.get(
        Uri.parse(url),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await storeJWT(data['token']);

        final userProfile = data['userProfile'];
        final character = userProfile?['Character'];
        final className = character?['class'];

        final hasValidCharacterClass = className != null && className.toString().trim().isNotEmpty;

        if (hasValidCharacterClass) {
          Navigator.pushReplacementNamed(context, '/play');
}
      } else if (response.statusCode == 401 || response.statusCode == 403) {
        Navigator.pushReplacementNamed(context, '/');
      }
    } catch (e) {
      final message = e.toString();
      setState(() {
        error = message;
      });
      if (message.contains("already")) {
        Navigator.pushReplacementNamed(context, '/play');
      }
    }
  }

  void onClickScroll(int index) {
    setState(() {
      selectedScrollIndex = index;
      for (var char in allPossibleCharacterInfo) {
        char['scrollFrame'] = 1;
      }
    });
  }

  Future<void> handleCharacterSelect(int index) async {
    setState(() {
      error = null;
    });

    final selectedChar = allPossibleCharacterInfo[index];
    try {
      final token = await fetchJWT();
      final response = await http.post(
        Uri.parse('${getPath()}/api/user/select-character'),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},
        body: jsonEncode({'characterClassId': selectedChar['id']}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await storeJWT(data['token']);
        setState(() {
          successSelectionData = data;
        });
      } else {
        final data = jsonDecode(response.body);
        setState(() {
          error = data['error'] ?? 'Unknown error';
        });
      }
    } catch (e) {
      setState(() {
        error = "Server Error | contact admin";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          AnimatedBackground(),
          if (successSelectionData == null)
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
                    ),
                  ),
                  SizedBox(height: 30),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: allPossibleCharacterInfo.asMap().entries.map((entry) {
                        final index = entry.key;
                        final info = entry.value;
                        return Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: ScrollCharacterModel(
                            characterInfo: info,
                            isSelected: selectedScrollIndex == index,
                            index: index,
                            onClick: () => onClickScroll(index),
                            onSelectCharacter: handleCharacterSelect,
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
          if (successSelectionData != null)
            Center(
              child: Container(
                padding: EdgeInsets.all(24),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(successSelectionData?['message'] ?? "Success", style: TextStyle(fontWeight: FontWeight.bold)),
                    SizedBox(height: 16),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.black),
                      onPressed: () {
                        Navigator.pushReplacementNamed(context, '/play');
                      },
                      child: Text("BEGIN YOUR JOURNEY"),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}


class ScrollCharacterModel extends StatefulWidget {
  final bool isSelected;
  final int index;
  final VoidCallback onClick;
  final Function(int index) onSelectCharacter;
  final Map<String, dynamic> characterInfo;

  const ScrollCharacterModel({
    required this.isSelected,
    required this.index,
    required this.onClick,
    required this.onSelectCharacter,
    required this.characterInfo,
  });

  @override
  _ScrollCharacterModelState createState() => _ScrollCharacterModelState();
}

class _ScrollCharacterModelState extends State<ScrollCharacterModel> {
  bool isHovered = false;
  int scrollFrame = 1;
  Timer? animationTimer;

  final int totalFrames = 5;
  final int animationSpeed = 100;

  @override
  void didUpdateWidget(covariant ScrollCharacterModel oldWidget) {
    super.didUpdateWidget(oldWidget);

    // START animation when selected just now
    if (widget.isSelected && !oldWidget.isSelected) {
      scrollFrame = 1;
      startAnimation();
    }

    // RESET to closed if this scroll was deselected
    if (!widget.isSelected && oldWidget.isSelected) {
      setState(() {
        scrollFrame = 1;
      });
    }
  }

  void startAnimation() {
    animationTimer?.cancel();

    animationTimer = Timer.periodic(Duration(milliseconds: animationSpeed), (timer) {
      setState(() {
        scrollFrame++;
        if (scrollFrame >= totalFrames) {
          scrollFrame = totalFrames;
          timer.cancel(); // Keep final frame showing
        }
      });
    });
  }

  @override
  void dispose() {
    animationTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final name = widget.characterInfo['name'];
    final frameImage = 'assets/img/playableCharacter/$name/scroll/animation/frame_$scrollFrame.png';
    final closedImage = 'assets/img/playableCharacter/$name/scroll/closed.png';
    final peekImage = 'assets/img/playableCharacter/$name/scroll/peek.png';

    // Logic to determine what image to show
    final imageToShow = widget.isSelected
        ? frameImage
        : (isHovered ? peekImage : closedImage);

    return GestureDetector(
      onTap: widget.onClick,
      child: MouseRegion(
        onEnter: (_) => setState(() => isHovered = true),
        onExit: (_) => setState(() => isHovered = false),
        child: Column(
          children: [
            AnimatedContainer(
              duration: Duration(milliseconds: 300),
              width: widget.isSelected ? 120 : 90,
              height: widget.isSelected ? 180 : 135,
              child: Image.asset(
                imageToShow,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return Image.asset(closedImage); // fallback image
                },
              ),
            ),
            if (widget.isSelected)
              ElevatedButton(
                onPressed: () => widget.onSelectCharacter(widget.index),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.black,
                ),
                child: Text("Select"),
              ),
          ],
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

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    _brightness = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.3, end: 0.15), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 0.15, end: 0.3), weight: 50),
    ]).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
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