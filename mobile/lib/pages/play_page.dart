import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:math' as math;

// Import your custom widgets
import '../widgets/quest_data.dart'; // This file primarily defines QuestIcon, not QuestData class itself
import '../widgets/prefight_modal.dart';
import '../widgets/inventory_modal.dart'; // Now refers to InventorySystem
import '../widgets/game_footer.dart';
import '../utils/types.dart'; // Assumed to contain QuestData and QUESTZONE

class GameMapPage extends StatefulWidget {
  const GameMapPage({Key? key}) : super(key: key);

  @override
  State<GameMapPage> createState() => _GameMapPageState();
}

class _GameMapPageState extends State<GameMapPage> with TickerProviderStateMixin {
  late final MapController _mapController;
  LatLng _userLocation = LatLng(28.6016, -81.2005); // Default to UCF
  bool _showInventory = false;
  bool _showPrefight = false;
  QuestData? _currentQuest; // Holds the quest data for the modal

  double _pulse = 1.0;
  late AnimationController _pulseController;

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

    // Optional: Initialize real-time location (requires geolocator and flutter_map_location_marker)
    // _initLocationService();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _mapController.dispose(); // Dispose map controller
    super.dispose();
  }

  // Function to convert meters to pixels at a given latitude and zoom level
  double metersToPixelsAtLatitude(double meters, double latitude, double zoom) {
    const double earthCircumference = 40075017; // Earth's circumference in meters
    final latitudeRadians = latitude * math.pi / 180;
    // Calculate meters per pixel at the current zoom level and latitude
    final metersPerPixel =
        earthCircumference * math.cos(latitudeRadians) / math.pow(2, zoom + 8);
    return meters / metersPerPixel;
  }

  void _openQuestModal(QuestData quest) {
    setState(() {
      _currentQuest = quest;
      _showPrefight = true;
    });
  }

  // Optional: Function to initialize location service for real-time user location
  // Future<void> _initLocationService() async {
  //   // Example using geolocator package
  //   LocationPermission permission = await Geolocator.requestPermission();
  //   if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
  //     // Handle permission denial
  //     return;
  //   }
  //
  //   Geolocator.getPositionStream(locationSettings: LocationSettings(accuracy: LocationAccuracy.high))
  //       .listen((Position position) {
  //     setState(() {
  //       _userLocation = LatLng(position.latitude, position.longitude);
  //       // Optionally move map to user location
  //       // _mapController.move(_userLocation, _mapController.zoom);
  //     });
  //   });
  // }

  @override
  Widget build(BuildContext context) {
    // Define zoom level as a constant or a state variable if it needs to change
    final double zoom = 17.0;
    final double questDetectionRadiusMeters = 50; // Radius for quest interaction in meters

    // Calculate the radius in pixels, incorporating the pulse animation
    final double radiusPixels = metersToPixelsAtLatitude(
          questDetectionRadiusMeters,
          _userLocation.latitude,
          zoom,
        ) * _pulse;

    // Define a constant for player marker size
    final double playerMarkerSize = zoom * 6; // Example size, adjust as needed

    return Scaffold(
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _userLocation,
              initialZoom: zoom,
              maxZoom: 18,
              minZoom: 10,
              // Optional: Add onTap to interact with map
              // onTap: (tapPosition, latLng) {
              //   print('Map tapped at: $latLng');
              // },
            ),
            children: [ // Use `children` instead of `layers` for FlutterMap
              TileLayer( // Use TileLayer instead of TileLayerOptions
                urlTemplate:
                    'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=6tt8Z9sB8XXEvl0jd1gY',
                userAgentPackageName: 'com.example.app',
                // Optional: attributionBuilder
                // attributionBuilder: (_) {
                //   return const Text("© OpenStreetMap contributors");
                // },
              ),
              // If you're using flutter_map_location_marker, you'd add it here:
              // CurrentLocationLayer(),
             MarkerLayer( // Use MarkerLayer instead of MarkerLayerOptions
              markers: [
                Marker(
                  point: _userLocation,
                  width: playerMarkerSize,
                  height: playerMarkerSize,
                  child: Image.asset( // Changed 'builder' back to 'child'
                    'assets/img/playableCharacter/warlock/back.png',
                    fit: BoxFit.contain,
                  ),
                ),
              ],
            ),
              MarkerLayer( // Quest markers
                markers: QUESTZONE.map((quest) {
                  return Marker(
                    point: LatLng(
                      quest.location.latitude,
                      quest.location.longitude,
                    ),
                    width: 40, // Consistent size for quest icons
                    height: 40,
                    child: GestureDetector(
                      onTap: () => _openQuestModal(quest),
                        child: QuestIcon(
                         zoom: zoom,
                         questData: quest,
                         onClick: () => _openQuestModal(quest),
                       ),
                    ),
                  );
                }).toList(),
              ),
              CircleLayer( // Use CircleLayer instead of CircleLayerOptions
                circles: QUESTZONE.map((quest) {
                  Color color;
                  switch (quest.difficulty) {
                    case 1:
                      color = const Color(0xFFE07B7B); // Reddish
                      break;
                    case 2:
                      color = const Color(0xFF9B59B6); // Purple
                      break;
                    case 3:
                      color = const Color(0xFFF39C12); // Orange
                      break;
                    default:
                      color = Colors.black; // Default color for undefined difficulty
                  }
                  return CircleMarker(
                    point: LatLng(quest.location.latitude, quest.location.longitude),
                    color: color.withOpacity(0.5), // Semi-transparent
                    radius: radiusPixels, // Dynamic radius based on pulse
                    // Optional: border settings for the circle
                    // useRadiusInMeter: true, // If radius is in meters directly
                    // borderColor: color,
                    // borderWidth: 2,
                  );
                }).toList(),
              ),
            ],
          ),

          // Inventory Modal (Now using InventorySystem)
          if (_showInventory)
            InventorySystem( // Changed from InventoryModal to InventorySystem
              onClose: () {
                setState(() {
                  _showInventory = false;
                });
              },
            ),

          // PreFight Modal
          if (_showPrefight && _currentQuest != null)
            PrefightModal(
              questData: _currentQuest, // Renamed 'quest' to 'questData' to match PrefightModal
              onClickFight: () {
                Navigator.pushNamed(context, '/bossfight', arguments: _currentQuest);
              },
              onClickExit: () { // Renamed 'onExit' to 'onClickExit' to match PrefightModal
                setState(() {
                  _showPrefight = false;
                });
              },
            ),

          // Footer
          Align(
            alignment: Alignment.bottomCenter,
            child: GameFooter(
              onClickInventory: () { // Renamed 'onInventoryPressed' to 'onClickInventory' to match GameFooter
                setState(() {
                  _showInventory = true;
                });
              },
            ),
          ),
        ],
      ),
    );
  }
}



