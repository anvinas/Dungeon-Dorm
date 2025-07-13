import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart'; // For JWT storage

// Utility functions (Dart equivalents of GetServerPath and JWT.ts)
class AppConfig {
  static String getServerPath() {
    // Replace with your actual server path
    return 'http://localhost:5000'; // Example server path
  }
}

class JWTUtil {
  static const String _jwtKey = 'jwt_token';

  static Future<String?> fetchJWT() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_jwtKey);
  }

  static Future<void> storeJWT(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_jwtKey, token);
  }
}

// Main Character Select Page Widget
class CharacterSelectPage extends StatefulWidget {
  const CharacterSelectPage({super.key});

  @override
  State<CharacterSelectPage> createState() => _CharacterSelectPageState();
}

class _CharacterSelectPageState extends State<CharacterSelectPage> with SingleTickerProviderStateMixin {
  final List<Map<String, dynamic>> allPossibleCharacterInfo = [
    {'animDelay': 500},
    {'animDelay': 243},
    {'animDelay': 784},
    {'animDelay': 1255},
  ];

  int selectedScrollIndex = -1;

  // Animations for the background and banner
  late AnimationController _bgAnimationController;
  late Animation<double> _bgBrightnessAnimation;
  late AnimationController _bannerAnimationController;
  late Animation<Offset> _bannerSlideAnimation;
  late Animation<double> _bannerBobbingTranslateXAnimation;
  late Animation<double> _bannerBobbingRotateAnimation;

  @override
  void initState() {
    super.initState();

    // Background animation (lowerExposure)
    _bgAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
    _bgBrightnessAnimation = Tween<double>(begin: 0.3, end: 0.15).animate(
      CurvedAnimation(
        parent: _bgAnimationController,
        curve: const Interval(0.0, 1.0, curve: Curves.easeInOut),
      ),
    );

    // Banner slide down animation
    _bannerAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    );
    _bannerSlideAnimation = Tween<Offset>(
      begin: const Offset(0.0, -0.5), // translate-y-[-50%]
      end: const Offset(0.0, -0.07), // Adjusted for top: 43%
    ).animate(
      CurvedAnimation(
        parent: _bannerAnimationController,
        curve: Curves.easeOut,
      ),
    );

    // Banner bobbing animation
    _bannerBobbingTranslateXAnimation = Tween<double>(begin: 0.0, end: 3.0).animate(
      CurvedAnimation(
        parent: _bannerAnimationController,
        curve: const Interval(0.0, 1.0, curve: Curves.easeInOut),
      ),
    );
    _bannerBobbingRotateAnimation = Tween<double>(begin: 0.0, end: 0.4).animate(
      CurvedAnimation(
        parent: _bannerAnimationController,
        curve: const Interval(0.0, 1.0, curve: Curves.easeInOut),
      ),
    );

    _bannerAnimationController.forward().then((_) {
      // Start bobbing after slide down completes
      _bannerAnimationController.duration = const Duration(seconds: 7);
      _bannerAnimationController.repeat(reverse: true);
      _bannerBobbingTranslateXAnimation = Tween<double>(begin: 0.0, end: 3.0).animate(
        CurvedAnimation(
          parent: _bannerAnimationController,
          curve: const Interval(0.0, 0.2, curve: Curves.easeInOut),
        ),
      );
      _bannerBobbingRotateAnimation = Tween<double>(begin: 0.0, end: 0.4).animate(
        CurvedAnimation(
          parent: _bannerAnimationController,
          curve: const Interval(0.0, 0.2, curve: Curves.easeInOut),
        ),
      );
    });
  }

  @override
  void dispose() {
    _bgAnimationController.dispose();
    _bannerAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background container with image and animation
          AnimatedBuilder(
            animation: _bgBrightnessAnimation,
            builder: (context, child) {
              return ColorFiltered(
                colorFilter: ColorFilter.mode(
                  Colors.black.withOpacity(1.0 - _bgBrightnessAnimation.value),
                  BlendMode.modulate,
                ),
                child: Image.asset(
                  'assets/img/pixel_bg2.png', // Ensure this path is correct in pubspec.yaml
                  width: MediaQuery.of(context).size.width,
                  height: MediaQuery.of(context).size.height,
                  fit: BoxFit.cover,
                ),
              );
            },
          ),

          // Logout/Back button
          Positioned(
            top: 40,
            right: 20,
            child: GestureDetector(
              onTap: () {
                Navigator.pop(context); // Equivalent to navigate("/")
              },
              child: Container(
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  color: Colors.grey.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: const Icon(
                  Icons.exit_to_app, // Using a Material icon for logout
                  color: Colors.white,
                  size: 24,
                ),
              ),
            ),
          ),

          // Banner
          Positioned.fill(
            child: Align(
              alignment: Alignment.center,
              child: AnimatedBuilder(
                animation: _bannerAnimationController,
                builder: (context, child) {
                  return Transform.translate(
                    offset: Offset(
                      _bannerBobbingTranslateXAnimation.value *
                          (_bannerAnimationController.status == AnimationStatus.forward || _bannerAnimationController.status == AnimationStatus.reverse
                              ? 1
                              : (_bannerAnimationController.value < 0.5 ? 1 : -1)),
                      _bannerSlideAnimation.value.dy * MediaQuery.of(context).size.height +
                          _bannerBobbingTranslateXAnimation.value *
                              (_bannerAnimationController.status == AnimationStatus.forward || _bannerAnimationController.status == AnimationStatus.reverse
                                  ? 1
                                  : (_bannerAnimationController.value < 0.5 ? 1 : -1)),
                    ),
                    child: Transform.rotate(
                      angle: _bannerBobbingRotateAnimation.value *
                          (_bannerAnimationController.status == AnimationStatus.forward || _bannerAnimationController.status == AnimationStatus.reverse
                              ? 1
                              : (_bannerAnimationController.value < 0.5 ? 1 : -1)) *
                          (3.1415926535 / 180), // Convert degrees to radians
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Choose Your Character text
                          Container(
                            padding: const EdgeInsets.all(16.0),
                            margin: const EdgeInsets.only(bottom: 20.0),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(10.0),
                            ),
                            child: const Text(
                              'Choose Your Character',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontFamily: 'Jersey10', // Custom font, ensure it's in pubspec.yaml
                                color: Colors.white,
                                fontSize: 48,
                                fontWeight: FontWeight.bold,
                                shadows: [
                                  Shadow(offset: Offset(2, 2), blurRadius: 4, color: Colors.black54),
                                  Shadow(offset: Offset(1, 1), blurRadius: 2, color: Colors.black38),
                                ],
                              ),
                            ),
                          ),

                          // Scroll container
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 40.0),
                            child: SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: allPossibleCharacterInfo.asMap().entries.map((entry) {
                                  int i = entry.key;
                                  Map<String, dynamic> charInfo = entry.value;
                                  return Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                    child: ScrollCharacterModel(
                                      animDelay: charInfo['animDelay'],
                                      isSelected: selectedScrollIndex == i,
                                      index: i,
                                      onClick: () {
                                        setState(() {
                                          selectedScrollIndex = i;
                                        });
                                      },
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Scroll Character Model Widget
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

class _ScrollCharacterModelState extends State<ScrollCharacterModel> with SingleTickerProviderStateMixin {
  bool _isHovered = false;
  bool _isClicked = false;
  int _frame = 0;
  Timer? _animationTimer;

  final int totalFrames = 6;
  final int animationSpeed = 100; // milliseconds per frame

  String _framePath(int frame) => 'assets/MageScrollAnimation/frame_${frame}.png';
  static const String _defaultImage = 'assets/Closed_Pixel_Scroll_2.png';
  static const String _hoverImage = 'assets/Mage_SliverOpen.png';

  String _error = "";
  Map<String, String> _curSelectedChar = {"userId": ""};

  // Animation for slideDownBanner and bobbing
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _bobbingTranslateXAnimation;
  late Animation<double> _bobbingRotateAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1), // For slideDownBanner
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, -0.5), // Initial position for slideDownBanner
      end: const Offset(0.0, 0.0), // Final position
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOut,
      ),
    );

    // Initial delay for slideDownBanner
    Future.delayed(Duration(milliseconds: widget.animDelay), () {
      if (mounted) {
        _controller.forward().then((_) {
          // After slideDownBanner, start bobbing
          _controller.duration = const Duration(seconds: 7); // For bobbing
          _controller.repeat(reverse: true);
          _bobbingTranslateXAnimation = Tween<double>(begin: 0.0, end: 3.0).animate(
            CurvedAnimation(
              parent: _controller,
              curve: const Interval(0.0, 0.2, curve: Curves.easeInOut),
            ),
          );
          _bobbingRotateAnimation = Tween<double>(begin: 0.0, end: 0.4).animate(
            CurvedAnimation(
              parent: _controller,
              curve: const Interval(0.0, 0.2, curve: Curves.easeInOut),
            ),
          );
        });
      }
    });
  }

  @override
  void dispose() {
    _animationTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  void _startAnimation() {
    if (_isClicked) return;
    setState(() {
      _isClicked = true;
      _frame = 0;
    });

    _animationTimer?.cancel(); // Cancel any existing timer
    _animationTimer = Timer.periodic(Duration(milliseconds: animationSpeed), (timer) {
      if (_frame >= totalFrames - 1) {
        timer.cancel();
        // setState(() {
        //   _isClicked = false; // Animation done, reset state if needed
        //   _frame = 0;
        // });
      } else {
        setState(() {
          _frame++;
        });
      }
    });
  }

  void _handleMouseEnter(PointerEvent event) {
    if (!_isClicked) {
      setState(() {
        _isHovered = true;
      });
    }
  }

  void _handleMouseLeave(PointerEvent event) {
    setState(() {
      _isHovered = false;
    });
  }

  void _handleClick() {
    _startAnimation();
    widget.onClick();
  }

  String get _imageToShow {
    if (_isClicked) {
      return _framePath(_frame);
    } else if (_isHovered) {
      return _hoverImage;
    } else {
      return _defaultImage;
    }
  }

  Future<void> _sendIndex() async {
    debugPrint('Selected index: ${widget.index}');
    if (widget.index == 0) {
      // Warlock/Mage
      setState(() {
        _curSelectedChar['userId'] = "685d632886585be7727d064c";
      });
      debugPrint('User ID set to: ${_curSelectedChar['userId']}');

      try {
        final token = await JWTUtil.fetchJWT();
        if (token == null) {
          setState(() {
            _error = "Authentication token not found.";
          });
          return;
        }

        final response = await http.post(
          Uri.parse('${AppConfig.getServerPath()}/api/user/selected-character'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: jsonEncode({'curSelectedChar': _curSelectedChar}),
        );

        if (response.statusCode == 200) {
          final responseData = jsonDecode(response.body);
          await JWTUtil.storeJWT(responseData['token']);
          debugPrint('Response data: $responseData');
        } else {
          final errorData = jsonDecode(response.body);
          setState(() {
            _error = errorData['error'] ?? 'Unknown error occurred.';
          });
          debugPrint('Error response: $errorData');
        }
      } catch (e) {
        debugPrint('Error sending index: $e');
        setState(() {
          _error = "Server Error | contact admin or check network.";
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(
            _bobbingTranslateXAnimation.value *
                (_controller.status == AnimationStatus.forward || _controller.status == AnimationStatus.reverse
                    ? 1
                    : (_controller.value < 0.5 ? 1 : -1)),
            _slideAnimation.value.dy * MediaQuery.of(context).size.height +
                _bobbingTranslateXAnimation.value *
                    (_controller.status == AnimationStatus.forward || _controller.status == AnimationStatus.reverse
                        ? 1
                        : (_controller.value < 0.5 ? 1 : -1)),
          ),
          child: Transform.rotate(
            angle: _bobbingRotateAnimation.value *
                (_controller.status == AnimationStatus.forward || _controller.status == AnimationStatus.reverse
                    ? 1
                    : (_controller.value < 0.5 ? 1 : -1)) *
                (3.1415926535 / 180), // Convert degrees to radians
            child: MouseRegion(
              onEnter: _handleMouseEnter,
              onExit: _handleMouseLeave,
              child: GestureDetector(
                onTap: _handleClick,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset(
                      _imageToShow,
                      width: widget.isSelected ? 192 : 240, // w-[48] (192px) vs w-[60%] (approx 240px for a typical 400px container)
                      fit: BoxFit.contain,
                    ),
                    if (widget.isSelected)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: GestureDetector(
                          onTap: _sendIndex,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.green[500],
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.3),
                                  spreadRadius: 1,
                                  blurRadius: 3,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Text(
                              'Select',
                              style: TextStyle(
                                color: Colors.black,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                shadows: [
                                  Shadow(offset: Offset(1, 1), blurRadius: 2, color: Colors.black.withOpacity(0.2)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    if (_error.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text(
                          _error,
                          style: const TextStyle(color: Colors.red, fontSize: 12),
                          textAlign: TextAlign.center,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

// Main function to run the app
void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Character Select',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const CharacterSelectPage(),
    );
  }
}
