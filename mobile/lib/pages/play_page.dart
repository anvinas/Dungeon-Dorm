import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';

//import '../widgets/inventory_system.dart';
//import '../widgets/game_footer.dart';

class MapPage extends StatefulWidget {
  const MapPage({Key? key}) : super(key: key);

  @override
  State<MapPage> createState() => _MapPageState();
}

class _MapPageState extends State<MapPage> {
  LatLng? userLocation;
  double zoom = 17.0;

  @override
  void initState() {
    super.initState();
    _getUserLocation();
  }

  Future<void> _getUserLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      debugPrint('Location services are disabled.');
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        debugPrint('Location permissions are denied');
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      debugPrint('Location permissions are permanently denied.');
      return;
    }

    final position = await Geolocator.getCurrentPosition();
    setState(() {
      userLocation = LatLng(position.latitude, position.longitude);
    });
  }

  @override
  Widget build(BuildContext context) {
    // Default center if user location is not available yet
    final startCenter = userLocation ?? LatLng(28.5, -81.4);

    return Scaffold(
      body: Stack(
        children: [
          FlutterMap(
            options: MapOptions(
              initialCenter: startCenter,
              initialZoom: zoom,
              onMapEvent: (event) {
                // track zoom level if needed
                if (event.camera.zoom != zoom) {
                  setState(() {
                    zoom = event.camera.zoom;
                  });
                }
              },
            ),
            children: [
              TileLayer(
                urlTemplate:
                    'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=6tt8Z9sB8XXEvl0jd1gY',
                userAgentPackageName: 'com.example.app',
              ),
              if (userLocation != null)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: userLocation!,
                      width: zoom * 6,
                      height: zoom * 6,
                      alignment: Alignment.center,
                      child: Transform.translate(
                        offset: const Offset(10, -20),
                        child: Image.asset(
                          'assets/character.png',
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),

          /*// Footer overlay
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: GameFooter(),
          ),

          // Inventory overlay
          Positioned(
            left: MediaQuery.of(context).size.width * 0.35,
            top: MediaQuery.of(context).size.height * 0.1,
            width: MediaQuery.of(context).size.width * 0.3,
            height: MediaQuery.of(context).size.height * 0.8,
            child: const InventorySystem(),
          ), */
        ],
      ),
    );
  }
}
