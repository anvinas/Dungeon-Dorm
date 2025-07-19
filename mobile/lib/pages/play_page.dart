import 'dart:math' as math;
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

import '../widgets/prefight_modal.dart';
import '../widgets/inventory_modal.dart';
import '../widgets/game_footer.dart';
import '../widgets/quest_data.dart';
import '../utils/types.dart';
import '../utils/jwt_storage.dart';
import '../utils/get_path.dart';

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
    latitude: 28.6025,
    longitude: -81.1990,
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
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    final position = await Geolocator.getCurrentPosition();
    setState(() {
      _userLocation = LatLng(position.latitude, position.longitude);
    });
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

    // Mock user data
    final mockUser = UserProfile(
      id: '1',
      email: 'test@mock.com',
      gamerTag: 'MockKnight',
      level: 3,
      currency: 120,
      maxHP: 100,
      currentHP: 85,
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
        characterClass: 'Mage',
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

  Widget _buildQuestMarker(QuestData quest) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.6),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            quest.name,
            style: const TextStyle(
              fontSize: 10,
              color: Colors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        const SizedBox(height: 2),
        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => _handleClickQuest(quest),
            borderRadius: BorderRadius.circular(20),
            child: SizedBox(
              width: 40,
              height: 40,
              child: Center(
                child: Image.asset(
                  "assets/img/boss/andrea/real.png",
                  width: 28,
                  height: 28,
                  fit: BoxFit.contain,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMap(double radiusPixels, double playerMarkerSize) {
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
        MarkerLayer(markers: [
          Marker(
            point: _userLocation,
            width: playerMarkerSize,
            height: playerMarkerSize,
            child: Image.asset(
              'assets/img/playableCharacter/warlock/back.png',
              fit: BoxFit.contain,
            ),
          ),
        ]),
        MarkerLayer(
          markers: QUESTZONE.map((quest) {
            return Marker(
              point: LatLng(
                quest.location.latitude,
                quest.location.longitude,
              ),
              width: 40,
              height: 60,
              child: _buildQuestMarker(quest),
            );
          }).toList(),
        ),
      ],
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
    final playerMarkerSize = _zoom * 6;

    return Scaffold(
      body: Stack(
        children: [
          Stack(
            children: [
              _buildMap(radiusPixels, playerMarkerSize),
              Positioned.fill(
                child: CustomPaint(
                  painter: HotzoneCirclePainter(radiusPixels),
                ),
              ),
            ],
          ),

          if (_inventoryModal && !_preFightModal)
            _buildModalBarrier(
              onTap: () => setState(() => _inventoryModal = false),
              child: InventorySystem(
                onClose: () => setState(() => _inventoryModal = false),
              ),
            ),

          if (_preFightModal && _currentQuest != null)
            _buildModalBarrier(
              onTap: () => setState(() => _preFightModal = false),
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

          Align(
            alignment: Alignment.bottomCenter,
            child: GameFooter(
              onClickInventory: () => setState(() => _inventoryModal = true),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModalBarrier({
    required Widget child,
    required VoidCallback onTap,
  }) {
    return Positioned.fill(
      child: Stack(
        children: [
          GestureDetector(
            onTap: onTap,
            child: AbsorbPointer(
              absorbing: true,
              child: Container(
                color: Colors.black54,
              ),
            ),
          ),
          Center(
            child: child,
          ),
        ],
      ),
    );
  }
}

class HotzoneCirclePainter extends CustomPainter {
  final double radiusPixels;
  HotzoneCirclePainter(this.radiusPixels);

  @override
  void paint(Canvas canvas, Size size) {
    const hotzones = [
      {'difficulty': 1, 'lat': 28.6016, 'lng': -81.2005},
      {'difficulty': 2, 'lat': 28.6016, 'lng': -81.1960},
      {'difficulty': 3, 'lat': 28.6080, 'lng': -81.1970},
    ];

    for (final zone in hotzones) {
      final center = Offset(size.width / 2, size.height / 2);
      final color = switch (zone['difficulty']) {
        1 => const Color(0xFFE07B7B),
        2 => const Color(0xFF9B59B6),
        3 => const Color(0xFFF39C12),
        _ => Colors.black,
      };

      final paint = Paint()
        ..color = color.withOpacity(0.5)
        ..style = PaintingStyle.fill;

      canvas.drawCircle(center, radiusPixels, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
