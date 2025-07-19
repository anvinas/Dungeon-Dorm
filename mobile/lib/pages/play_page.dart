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
final List<QuestData> QUESTZONE = [
  QuestData(
    id: '3',
    name: 'Library of Whispers',
    species: 'Specter',
    characterClass: 'Phantom Mage',
    maxHP: 120,
    relationshipGoal: 3,
    stats: UserStats(
      strength: 6,
      dexterity: 8,
      intelligence: 18,
      charisma: 10,
      defense: 5,
    ),
    reward: QuestReward(
      gold: 50,
      xp: 150,
      items: [
        RewardItem(itemId: 'potion001', quantity: 1),
        RewardItem(itemId: 'spellbook001', quantity: 1),
      ],
    ),
    level: 3,
    location: QuestLocation(
      sceneName: 'Haunted Library',
      description: 'A forgotten archive filled with ancient tomes and spectral secrets.',
      environmentTags: ['indoor', 'mystic', 'dark'],
      latitude: 28.6010, // Adjusted to be near center of red hotzone
      longitude: -81.2000,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: 'You are not yet attuned to this place.',
      preFightMain: ['The books whisper warnings...', 'You feel an unseen presence.'],
      bossFightSuccess: ['The whispers fade. You are victorious.'],
      bossFightFail: ['The library consumes another soul.'],
      userFightSuccess: ['Your magic sears through the specter!'],
      userFightFail: ['Your spell fizzles...'],
      userTalkSuccess: ['You commune with the spirit peacefully.'],
      userTalkFail: ['It shrieks in rage!'],
      userHideSuccess: ['You blend into the shadows.'],
      userHideFail: ['You knock over a bookstand. It notices you.'],
      death: 'The last thing you hear is a whisper... then nothing.',
      relationshipGain: 'The specter acknowledges your understanding.',
      win: 'The knowledge of the past is now yours.',
    ),
    enemyType: 'ghost',
  ),
  QuestData(
    id: '4',
    name: 'Ancient Crypt',
    species: 'Orc', // Changed for visual variety
    characterClass: 'Warrior',
    maxHP: 150,
    relationshipGoal: 2,
    stats: UserStats(
      strength: 10,
      dexterity: 5,
      intelligence: 12,
      charisma: 7,
      defense: 8,
    ),
    reward: QuestReward(
      gold: 70,
      xp: 200,
      items: [
        RewardItem(itemId: 'gold_coin', quantity: 10),
      ],
    ),
    level: 4,
    location: QuestLocation(
      sceneName: 'Dusty Crypt',
      description: 'A decaying crypt where the undead stir.',
      environmentTags: ['underground', 'dark', 'eerie'],
      latitude: 28.6025,
      longitude: -81.1965,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: 'The crypt remains sealed to you.',
      preFightMain: ['A chilling moan echoes...', 'The air grows heavy with dread.'],
      bossFightSuccess: ['The crypt falls silent. Peace returns.'],
      bossFightFail: ['The darkness claims another victim.'],
      userFightSuccess: ['Your blade cleaves through the reanimated flesh!'],
      userFightFail: ['Your attack glances off.'],
      userTalkSuccess: ['You find common ground with the lost souls.'],
      userTalkFail: ['Their screams fill the chamber!'],
      userHideSuccess: ['You become one with the shadows.'],
      userHideFail: ['A skeleton rattles a warning.'],
      death: 'The cold embrace of the crypt is your final resting place.',
      relationshipGain: 'The undead respect your mastery.',
      win: 'The crypt\'s secrets are revealed.',
    ),
    enemyType: 'orc', // Using 'orc' to map to a specific image
  ),
  QuestData(
    id: '5',
    name: 'Golem Quarry',
    species: 'Dragon', // Changed for visual variety
    characterClass: 'Earth Shaper',
    maxHP: 200,
    relationshipGoal: 1,
    stats: UserStats(
      strength: 15,
      dexterity: 3,
      intelligence: 7,
      charisma: 4,
      defense: 12,
    ),
    reward: QuestReward(
      gold: 100,
      xp: 250,
      items: [
        RewardItem(itemId: 'ore', quantity: 5),
      ],
    ),
    level: 5,
    location: QuestLocation(
      sceneName: 'Rocky Quarry',
      description: 'A quarry where the very earth comes alive.',
      environmentTags: ['outdoor', 'rocky', 'day'],
      latitude: 28.6040,
      longitude: -81.2020,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: 'The quarry guards its stony secrets.',
      preFightMain: ['The ground rumbles...', 'A giant shadow looms.'],
      bossFightSuccess: ['The earth settles. You are the master.'],
      bossFightFail: ['You are crushed underfoot.'],
      userFightSuccess: ['Your might shatters the stone!'],
      userFightFail: ['Your blows are absorbed.'],
      userTalkSuccess: ['You calm the earth spirit.'],
      userTalkFail: ['The golem roars!'],
      userHideSuccess: ['You meld with the rocks.'],
      userHideFail: ['A dislodged pebble gives you away.'],
      death: 'The earth reclaims your form.',
      relationshipGain: 'The golem recognizes your strength.',
      win: 'The quarry\'s heart is yours.',
    ),
    enemyType: 'dragon', // Using 'dragon' for visual variety
  ),
  QuestData(
    id: '6',
    name: 'Shadow Den',
    species: 'Elf', // Changed for visual variety
    characterClass: 'Void Hunter',
    maxHP: 100,
    relationshipGoal: 4,
    stats: UserStats(
      strength: 8,
      dexterity: 15,
      intelligence: 10,
      charisma: 6,
      defense: 7,
    ),
    reward: QuestReward(
      gold: 60,
      xp: 180,
      items: [
        RewardItem(itemId: 'shadow_essence', quantity: 2),
      ],
    ),
    level: 3,
    location: QuestLocation(
      sceneName: 'Dark Alley',
      description: 'A shadowy corner where strange things lurk.',
      environmentTags: ['urban', 'dark', 'eerie'],
      latitude: 28.6030,
      longitude: -81.1980,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: 'The shadows are too deep for you.',
      preFightMain: ['A cold draft embraces you...', 'Eyes glint from the darkness.'],
      bossFightSuccess: ['The shadows dissipate. You are safe.'],
      bossFightFail: ['You are lost in the void.'],
      userFightSuccess: ['Your light pierces the darkness!'],
      userFightFail: ['The shadows consume your attack.'],
      userTalkSuccess: ['You pacify the restless shadows.'],
      userTalkFail: ['The shadows lash out!'],
      userHideSuccess: ['You become one with the gloom.'],
      userHideFail: ['A sudden noise reveals you.'],
      death: 'The last thing you feel is a cold embrace.',
      relationshipGain: 'The shadows acknowledge your presence.',
      win: 'The secrets of the shadows are unveiled.',
    ),
    enemyType: 'elf', // Using 'elf' for visual variety
  ),
  QuestData(
    id: '7',
    name: 'Ice Peak',
    species: 'Blue Imp', // Changed for visual variety
    characterClass: 'Frost Mage',
    maxHP: 130,
    relationshipGoal: 3,
    stats: UserStats(
      strength: 7,
      dexterity: 9,
      intelligence: 16,
      charisma: 8,
      defense: 6,
    ),
    reward: QuestReward(
      gold: 80,
      xp: 220,
      items: [
        RewardItem(itemId: 'frost_shard', quantity: 3),
      ],
    ),
    level: 4,
    location: QuestLocation(
      sceneName: 'Frozen Summit',
      description: 'A towering peak covered in eternal ice.',
      environmentTags: ['outdoor', 'cold', 'mountain'],
      latitude: 28.6055,
      longitude: -81.2010,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: 'The peak is too treacherous for you.',
      preFightMain: ['A biting wind howls...', 'The ice shimmers ominously.'],
      bossFightSuccess: ['The mountain is still. The cold embraces you no more.'],
      bossFightFail: ['You become a part of the frozen landscape.'],
      userFightSuccess: ['Your warmth melts the icy foe!'],
      userFightFail: ['Your attacks freeze in the air.'],
      userTalkSuccess: ['You find harmony with the frosty spirit.'],
      userTalkFail: ['The ice elemental shrieks with cold rage!'],
      userHideSuccess: ['You disappear into the blizzard.'],
      userHideFail: ['A shard of ice falls, betraying your position.'],
      death: 'The cold claims you, slowly and painfully.',
      relationshipGain: 'The ice acknowledges your spirit.',
      win: 'The chill of the peak reveals its secrets.',
    ),
    enemyType: 'blue_imp', // Using 'blue_imp' for visual variety
  ),
  QuestData(
    id: '8',
    name: 'Gothic Priestess',
    species: 'Priestess',
    characterClass: 'Cleric',
    maxHP: 110,
    relationshipGoal: 5,
    stats: UserStats(
      strength: 5,
      dexterity: 7,
      intelligence: 15,
      charisma: 10,
      defense: 6,
    ),
    reward: QuestReward(
      gold: 90,
      xp: 230,
      items: [
        RewardItem(itemId: 'holy_relic', quantity: 1),
      ],
    ),
    level: 5,
    location: QuestLocation(
      sceneName: 'Old Church',
      description: 'A decaying church, filled with echoes of past prayers.',
      environmentTags: ['indoor', 'gothic', 'eerie'],
      latitude: 28.6035,
      longitude: -81.1995,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: 'The church gates are sealed against you.',
      preFightMain: ['A solemn chant fills the air...', 'Shadows dance on the altar.'],
      bossFightSuccess: ['The church finds peace. The darkness recedes.'],
      bossFightFail: ['You are bound to the church forever.'],
      userFightSuccess: ['Your spirit breaks the corrupted faith!'],
      userFightFail: ['Your attacks are met with divine protection.'],
      userTalkSuccess: ['You calm the tormented soul.'],
      userTalkFail: ['She screams, eyes burning with hatred!'],
      userHideSuccess: ['You blend into the confessionals.'],
      userHideFail: ['The creaking floorboards betray you.'],
      death: 'Your last breath is a silent prayer.',
      relationshipGain: 'The priestess feels a connection.',
      win: 'The church\'s sacred knowledge is yours.',
    ),
    enemyType: 'gothic_priestess', // Using 'gothic_priestess' for visual variety
  ),
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
  QuestData? _currentQuest;

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
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

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

    final position = await Geolocator.getCurrentPosition();
    setState(() {
      _userLocation = LatLng(position.latitude, position.longitude);
    });
  } catch (e) {
    print('Location error: $e');
  }
}


  Future<void> _fetchUserData() async {
    try {
      // final token = await fetchJWT();
      // final response = await http.get(
      //   Uri.parse('${getPath()}/api/auth/profile'),
      //   headers: {'Authorization': 'Bearer $token'},
      // );
      // if (response.statusCode == 200) {
      //   final data = jsonDecode(response.body);
      //   final userData = UserProfile.fromJson(data['userProfile']);
      //   await storeJWT(data['token']);
      //   setState(() => _userProfile = userData);
      // }

      // Mock user data matching the image's player character and HP
      final mockUser = UserProfile(
        id: '1',
        email: 'test@mock.com',
        gamerTag: 'MockKnight',
        level: 3,
        currency: 120,
        maxHP: 100,
        currentHP: 100, // Matching the image
        currentStats: UserStats(
          strength: 7,
          dexterity: 5,
          intelligence: 9,
          charisma: 6,
          defense: 4,
        ),
        currentLoot: [],
        character: Character(
          id: 'char123',
          species: 'Elf',
          characterClass: 'Rogue', // Matching the image character
          maxHP: 100,
          stats: {
            'strength': 7,
            'dexterity': 5,
            'intelligence': 9,
            'charisma': 6,
            'defense': 4,
          },
        ),
        bosses: [],
        currentActiveBoss: null,
        createdAt: '',
        updatedAt: '',
        toLevelUpXP: 200,
        currentXP: 50,
      );

      setState(() => _userProfile = mockUser);
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

  void _handleClickQuest(QuestData quest) {
    setState(() {
      _currentQuest = quest;
      _preFightModal = true;
    });
  }

  // Updated _buildQuestMarker to match the image's circular boss icons
  Widget _buildQuestMarker(QuestData quest) {
    // Map enemyType to image asset path for bosses
    String imagePath;
    switch (quest.enemyType) {
      case 'ghost':
        imagePath = 'assets/img/boss/rogue/pixel.png';
        break;
      case 'orc':
        imagePath = 'assets/img/boss/rogue/pixel.png';
        break;
      case 'dragon':
        imagePath = 'assets/img/boss/rogue/pixel.png';
        break;
      case 'elf':
        imagePath = 'assets/img/boss/rogue/pixel.png';
        break;
      case 'blue_imp':
        imagePath = 'assets/img/boss/rogue/pixel.png';
        break;
      case 'gothic_priestess':
        imagePath = 'assets/img/boss/rogue/pixel.png';
        break;
      default:
        imagePath = 'assets/img/boss/rogue/pixel.png';
    }

    return GestureDetector(
     onTap: () {
        print('Quest ${quest.name} tapped');
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
          return Marker(
            point: LatLng(
              quest.location.latitude,
              quest.location.longitude,
            ),
            width: 50,
            height: 50,
            child: _buildQuestMarker(quest),
          );
        }).toList(),
      ),
      // ✅ Player marker moved here
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
                child: CustomPaint(
                  painter: HotzoneCirclePainter(radiusPixels, _userLocation, _zoom), // Pass user location and zoom
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
                  Navigator.pushNamed(
                    context,
                    '/bossfight',
                    arguments: _currentQuest,
                  );
                  setState(() => _preFightModal = false);
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