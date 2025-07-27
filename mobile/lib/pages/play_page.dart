import 'dart:math' as math;
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

import '../widgets/prefight_modal.dart';
import '../widgets/inventory_modal.dart';
import '../widgets/quest_data.dart';
import '../utils/types.dart';
import '../utils/jwt_storage.dart';
import '../utils/get_path.dart';

// Mock Quest Data - Updated with specific image paths for variety
const QUESTZONE = [
  {
    "id": "685d5cb386585be7727d0621",
    "name": "Gabriel the Hidden",
    "species": "Tielfing",
    "class": "Rogue",
    "maxHP": 256,
    "relationshipGoal": 60,
    "stats": {
      "strength": 8,
      "dexterity": 0,
      "intelligence": 2,
      "charisma": 2,
      "defense": 7
    },
    "level": 8,
    "location": {
      "sceneName": "Engineering Building",
      "description": "Gears grind and steam hisses in this hub of innovation. Strange contraptions line the walls.",
      "environmentTags": [
        "indoor",
        "industrial",
        "noisy"
      ],
      "latitude": 28.601807,
      "longitude": -81.19874
    },
    "preFightMain": [
      "...",
      "You killed that BlobMan? I've been waiting for him to kick the bucket. Bro wouldn’t stop preaching.",
      "...",
      "So…. Do you listen to Radiohead? Wanna listen to Creep….",
      "Oh…You want my stone rune? I should have known you didn't care about RadioHead."
    ]
  },
  {
    "id": "685d5cb386585be7727d0620",
    "name": "Queen Andrea of the Pixies",
    "species": "Fairy",
    "class": "Bard",
    "maxHP": 272,
    "relationshipGoal": 80,
    "stats": {
      "strength": 0,
      "dexterity": 8,
      "intelligence": 8,
      "charisma": 10,
      "defense": 5
    },
    "level": 9,
    "location": {
      "sceneName": "Wooden Bridge (Night)",
      "description": "A rickety bridge spanning a murky chasm. The wood creaks with every step. It feels especially eerie at nighttime.",
      "environmentTags": [
        "outdoor",
        "dangerous",
        "nature",
        "nighttime"
      ],
      "latitude": 28.602777,
      "longitude": -81.199921
    },
    "preFightMain": [
      "Hey girlypop! What brings you into my beautiful kingdom?",
      "Omg, you killed that blob thing? Slayyyyy.",
      "Not to be like super mega rude or anything, but like I have royal things to do…",
      "Why are you here?",
      "You want fairy dust? Too bad, you’re like not a fairy.”"
    ]
  },
  {
    "id": "685d5cb386585be7727d0624",
    "name": "Adrian the Prophet",
    "species": "Plasmoid",
    "class": "Cleric",
    "maxHP": 145,
    "relationshipGoal": 10,
    "stats": {
      "strength": 1,
      "dexterity": 5,
      "intelligence": 1,
      "charisma": 0,
      "defense": 0
    },
    "level": 2,
    "location": {
      "sceneName": "Bathroom",
      "description": "A surprisingly clean bathroom. A faint smell of magic hangs in the air.",
      "environmentTags": [
        "indoor",
        "magical"
      ],
      "latitude": 28.60141,
      "longitude": -81.199118
    },
    "preFightMain": [
      "Greetings, traveler. I am the Prophet Adrain, voice of the Great and Powerful Blob Lord.",
      "Have you come to talk about joining my faithful following in devoting our lives to the blobness?",
      "Oh, you just want my magical amulet? Erm, no, it's mine."
    ]
  },
  {
    "id": "685d5cb386585be7727d061f",
    "name": "Evil Narrator",
    "species": "Human",
    "class": "Wizard",
    "maxHP": 430,
    "relationshipGoal": 100,
    "stats": {
      "strength": 10,
      "dexterity": 10,
      "intelligence": 10,
      "charisma": 10,
      "defense": 10
    },
    "level": 10,
    "location": {
      "sceneName": "Classroom",
      "description": "Desks and chairs are neatly arranged, awaiting students. A chalkboard lists obscure equations.",
      "environmentTags": [
        "indoor",
        "learning",
        "quiet"
      ],
      "latitude": 28.6016,
      "longitude": -81.2
    },
    "preFightMain": [
      "Finally! Took you long enough to get everything.",
      "I should have known a simple barista would take their sweet time even if they think the world is at stake.",
      "Well, joke's on you, the world was perfectly fine, just filled with losers and blobs.",
      "But now that I have these magical items, I am going to cleanse the world of trash.",
      "That's right. IM EVIL PROFESSOR LEINECKER!!!!!!"
    ]
  },
  {
    "id": "685d5cb386585be7727d0622",
    "name": "Just Dave",
    "species": "Dragonborn",
    "class": "Fighter",
    "maxHP": 234,
    "relationshipGoal": 40,
    "stats": {
      "strength": 6,
      "dexterity": 2,
      "intelligence": 1,
      "charisma": 1,
      "defense": 6
    },
    "level": 6,
    "location": {
      "sceneName": "Library",
      "description": "Rows upon rows of ancient texts and arcane scrolls. Dust motes dance in the sunlight.",
      "environmentTags": [
        "indoor",
        "knowledge",
        "quiet"
      ],
      "latitude": 28.600852,
      "longitude": -81.20102
    },
    "preFightMain": [
      "Good Marrow! Welcome to my collection of trinkets.",
      "You’re the killer of the blob pest? Huzzah! I hope this world will one day be free of the blob infestation.",
      "I know my dragon-like appearance might be frightening, but no fear.",
      "I am merely a knowledge collector who also happens to be well-trained in murder.",
      "The Sword of Destruction? I protect it here along with other historical pieces. You may not have it."
    ]
  },
  {
    "id": "685d5cb386585be7727d0623",
    "name": "Shaq of the Forest",
    "species": "Elf (w/dreads)",
    "class": "Ranger",
    "maxHP": 178,
    "relationshipGoal": 20,
    "stats": {
      "strength": 2,
      "dexterity": 4,
      "intelligence": 2,
      "charisma": 4,
      "defense": 2
    },
    "level": 4,
    "location": {
      "sceneName": "Wooden Bridge",
      "description": "A rickety bridge spanning a murky chasm. The wood creaks with every step under the bright daytime sun.",
      "environmentTags": [
        "outdoor",
        "dangerous",
        "nature",
        "daytime"
      ],
      "latitude": 28.602371,
      "longitude": -81.199336
    },
    "preFightMain": [
      "Hey Stranger. What brings you here?",
      "Oh, you killed Blobman? THANK GOD HE SUCKED!!!!!!!!!!!!!!!",
      "Well, as you go through this forest, be careful. And remember: Be Bear Aware, Follow Fire Safety Guidelines, and–",
      "My enchanted armor? I kind of need it."
    ]
  }
];

class GameMapPage extends StatefulWidget {
  const GameMapPage({Key? key}) : super(key: key);

  @override
  State<GameMapPage> createState() => _GameMapPageState();
}

class _GameMapPageState extends State<GameMapPage>
    with TickerProviderStateMixin {
  late final MapController _mapController;
  LatLng _userLocation = const LatLng(28.6016, -81.2005);
  double _zoom = 17.0;
  double _pulse = 1.0;

  bool _inventoryModal = false;
  bool _preFightModal = false;
  Map<String, dynamic>? _currentQuest;

  late final AnimationController _pulseController;
  UserProfile? _userProfile;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _pulseController.addListener(() {
      setState(() {
        _pulse = 1 + 0.05 * math.sin(_pulseController.value * 2 * math.pi);
      });
    });

    _fetchLocation();
    _fetchUserData();
  }

  Future<void> _fetchLocation() async {
  try {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      print('Location services disabled. Playing without location.');
      return; // fallback will be used
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        print('Permission denied. Playing without location.');
        return;
      }
    }

    final position = await Geolocator.getCurrentPosition();
    setState(() {
      _userLocation = LatLng(position.latitude, position.longitude);
    });

    Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 5,
      ),
    ).listen((Position position) {
      if (mounted) {
        setState(() {
          _userLocation = LatLng(position.latitude, position.longitude);
        });
      }
    });
  } catch (e) {
    print('Location error: $e');
    print('Using default fallback location.');
    // no need to call setState because default _userLocation is already set
  }
}



  Future<void> _fetchUserData() async {
    try {
     final token = await fetchJWT();
      final response = await http.get(
       Uri.parse('${getPath()}/api/auth/profile'),
      headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final userData = UserProfile.fromJson(data['userProfile']);
      await storeJWT(data['token']);
      setState(() => _userProfile = userData);
      }
    } catch (e) {
      print('Failed to load user: $e');
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  double metersToPixelsAtLatitude(double meters, double latitude, double zoom) {
    const double earthCircumference = 40075017;
    final latitudeRadians = latitude * math.pi / 180;
    final metersPerPixel =
        earthCircumference * math.cos(latitudeRadians) / math.pow(2, zoom + 8);
    return meters / metersPerPixel;
  }

  void _handleClickQuest(Map<String, dynamic> quest) {
    setState(() {
      _currentQuest = quest;
      _preFightModal = true;
    });
  }

  // Updated _buildQuestMarker to match the image's circular boss icons
  Widget _buildQuestMarker(Map<String, dynamic> quest) {
    // Map enemyType to image asset path for bosses
    String imagePath;
    switch (quest["class"]) {
      case 'Bard':
        imagePath = 'assets/img/boss/andrea/pixel.png';
        break;
      case 'Rogue':
        imagePath = 'assets/img/boss/gabriel/pixel.png';
        break;
      case 'Cleric':
        imagePath = 'assets/img/boss/adrian/pixel.png';
        break;
      case 'Ranger':
        imagePath = 'assets/img/boss/shaq/pixel.png';
        break;
      case 'Fighter':
        imagePath = 'assets/img/boss/dave/pixel.png';
        break;
      default:
        imagePath = 'assets/img/boss/andrea/pixel.png';
    }

    return GestureDetector(
     onTap: () {
        print('Quest ${quest["name"]} tapped');
        _handleClickQuest(quest);
      },

      child: Container(
        width: 50, // Size of the circular marker
        height: 50,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white, // Background for the image
          border: Border.all(
            color: Colors.redAccent, // Red border for quest markers
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              spreadRadius: 1,
              blurRadius: 3,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: ClipOval(
          child: Image.asset(
            imagePath,
            fit: BoxFit.cover, // Cover to fill the circle
            errorBuilder: (context, error, stackTrace) {
              return const Center(child: Icon(Icons.error_outline, color: Colors.grey));
            },
          ),
        ),
      ),
    );
  }

 Widget _buildMap() {
  return FlutterMap(
    mapController: _mapController,
    options: MapOptions(
      initialCenter: _userLocation,
      initialZoom: _zoom,
      maxZoom: 18,
      minZoom: 10,
      onMapEvent: (event) {
        if (event is MapEventMove) {
          final newZoom = event.camera.zoom;
          if (newZoom != _zoom) {
            setState(() {
              _zoom = newZoom;
            });
          }
        }
      },
    ),
    children: [
      TileLayer(
        urlTemplate:
            'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=6tt8Z9sB8XXEvl0jd1gY',
        userAgentPackageName: 'com.example.app',
      ),
      // Quest markers
      MarkerLayer(
        markers: QUESTZONE.map((quest) {
          final q = quest as Map<String, dynamic>;
          return Marker(
            point: LatLng(
              q["location"]!["latitude"],
              q["location"]!["longitude"],
            ),
            width: 50,
            height: 50,
            child: _buildQuestMarker(q),
          );
        }).toList(),
      ),
      MarkerLayer(
        markers: [
          Marker(
            point: _userLocation,
            width: 40,
            height: 40,
            child: Image.asset(
              'assets/img/character.png',
              fit: BoxFit.contain,
            ),
          ),
        ],
      ),
    ],
  );
}


  // New widget for Player Avatar and HP Bar (Top-Left)
  Widget _buildPlayerInfo() {
    final hpPercent = (_userProfile?.currentHP ?? 0) / (_userProfile?.maxHP ?? 1);
    return Positioned(
      top: 40,
      left: 20,
      child: Container(
        padding: const EdgeInsets.all(8.0),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.7),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white.withOpacity(0.3), width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Player Avatar
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.redAccent, // Red border as in image
                  width: 2,
                ),
                color: Colors.white, // Background for the image
              ),
              child: ClipOval(
                child: Image.asset(
                  'assets/img/character.png',
                  fit: BoxFit.cover, // Use cover to fill the circle
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "${_userProfile?.currentHP ?? 0}/${_userProfile?.maxHP ?? 0} hp",
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                // HP Bar
                Container(
                  width: 120, // Fixed width for HP bar
                  height: 10,
                  decoration: BoxDecoration(
                    color: Colors.grey[700],
                    borderRadius: BorderRadius.circular(5),
                  ),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: FractionallySizedBox(
                      widthFactor: hpPercent.clamp(0.0, 1.0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF5AB64A), // Green color from image
                          borderRadius: BorderRadius.circular(5),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // New widget for Inventory Bag (Bottom-Right)
  Widget _buildInventoryBag() {
    return Positioned(
      bottom: 40,
      right: 20,
      child: GestureDetector(
        onTap: () => setState(() => _inventoryModal = true),
        child: Container(
          width: 70, // Size of the circular bag
          height: 70,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.brown[600], // Brown color for bag
            border: Border.all(color: Colors.white.withOpacity(0.4), width: 2),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.4),
                spreadRadius: 2,
                blurRadius: 5,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Center(
            child: Image.asset(
              'assets/img/character.png',
              width: 45,
              height: 45,
              color: Colors.white.withOpacity(0.8), // Slightly translucent white
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const radiusMeters = 100.0;
    final radiusPixels = metersToPixelsAtLatitude(
          radiusMeters,
          _userLocation.latitude,
          _zoom,
        ) *
        _pulse;

    return Scaffold(
      extendBody: true,
      body: Stack(
        children: [
          // Map and Hotzone Painter
          Stack(
            children: [
              _buildMap(),
              Positioned.fill(
                child: IgnorePointer(
                  child: CustomPaint(
                    painter: HotzoneCirclePainter(radiusPixels, _userLocation, _zoom),
                  ),
                ),
              ),

            ],
          ),

          // Player Info (Avatar and HP)
          _buildPlayerInfo(),

          // Inventory Bag Icon
          _buildInventoryBag(),

          // Inventory Modal on top
          if (_inventoryModal && !_preFightModal)
            Center(
              child: InventorySystem(
                onClose: () => setState(() => _inventoryModal = false),
              ),
            ),

          // Prefight Modal on top
          if (_preFightModal && _currentQuest != null)
            Center(
              child: PrefightModal(
                questData: _currentQuest!,
                onClickFight: () {
                  if (_currentQuest != null) {
                    Navigator.pushNamed(
                      context,
                      '/bossfight',
                      arguments: _currentQuest!['id'],  // Safely get the bossId
                    );
                    setState(() => _preFightModal = false);
                  }
                },
                onClickExit: () => setState(() => _preFightModal = false),
              ),
            ),
        ],
      ),
    );
  }
}

class HotzoneCirclePainter extends CustomPainter {
  final double radiusPixels;
  final LatLng userLocation;
  final double currentZoom;

  HotzoneCirclePainter(this.radiusPixels, this.userLocation, this.currentZoom);

  // Helper to convert LatLng to pixel offset relative to the map center
  Offset _latLngToPixelOffset(LatLng targetLatLng, LatLng mapCenter, double zoom, Size canvasSize) {
    final MapCalculator mapCalculator = MapCalculator(); // You might need to create this class or use mapController's internal methods
    final CustomPoint mapCenterPixel = mapCalculator.latLngToPixel(mapCenter, zoom);
    final CustomPoint targetPixel = mapCalculator.latLngToPixel(targetLatLng, zoom);

    final double offsetX = targetPixel.x - mapCenterPixel.x;
    final double offsetY = targetPixel.y - mapCenterPixel.y;

    return Offset(canvasSize.width / 2 + offsetX, canvasSize.height / 2 + offsetY);
  }

  @override
  void paint(Canvas canvas, Size size) {
    // These hotzones are set to be roughly where they appear in the image
    // You might need to adjust the latitude and longitude slightly based on your map provider's rendering.
    final hotzones = [
      {'difficulty': 1, 'lat': 28.6016, 'lng': -81.2005, 'color': const Color(0xFFEE877C)}, // Reddish-orange, near user
      {'difficulty': 2, 'lat': 28.6020, 'lng': -81.1965, 'color': const Color(0xFF9B59B6)}, // Purple, top-right of main
      {'difficulty': 3, 'lat': 28.6038, 'lng': -81.2025, 'color': const Color(0xFFF39C12)}, // Yellow-Orange, top-left of main
      {'difficulty': 4, 'lat': 28.5990, 'lng': -81.1970, 'color': const Color(0xFF75B853)}, // Green, bottom-right of main
    ];

    final MapCalculator mapCalculator = MapCalculator();
    final CustomPoint userPixelOnMap = mapCalculator.latLngToPixel(userLocation, currentZoom);

    for (final zone in hotzones) {
      final LatLng zoneLatLng = LatLng(zone['lat'] as double, zone['lng'] as double);
      final CustomPoint zonePixelOnMap = mapCalculator.latLngToPixel(zoneLatLng, currentZoom);

      // Calculate offset relative to the current visible map center (canvas center)
      final Offset drawCenter = Offset(
        size.width / 2 + (zonePixelOnMap.x - userPixelOnMap.x),
        size.height / 2 + (zonePixelOnMap.y - userPixelOnMap.y),
      );

      final Color color = (zone['color'] as Color).withOpacity(0.5); // Adjusted opacity
      final paint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;

      canvas.drawCircle(drawCenter, radiusPixels, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}


// Dummy MapCalculator for HotzoneCirclePainter (you might already have this or can use mapController's built-in methods)
// This is a simplified version and might need to be adjusted based on Flutter Map's exact pixel calculation.
class CustomPoint {
  final double x;
  final double y;
  CustomPoint(this.x, this.y);
}

class MapCalculator {
  // This is a simplified example. In a real FlutterMap context,
  // you would use mapController.latLngToPoint() to get the pixel coordinates.
  // This mock assumes a direct conversion for demonstration.
  CustomPoint latLngToPixel(LatLng latLng, double zoom) {
    const double TILE_SIZE = 256.0; // Standard tile size
    final double scale = math.pow(2, zoom).toDouble();
    final double siny = math.sin(latLng.latitude * math.pi / 180);
    final double y = TILE_SIZE / 2 * (0.5 - siny / (2 * math.pi)) * scale;
    final double x = TILE_SIZE / 2 * (0.5 + latLng.longitude / 360) * scale;
    return CustomPoint(x, y);
  }
}