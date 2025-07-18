import 'package:flutter/material.dart';
import '../utils/types.dart';

// Replace with your real helper function logic
String getBossFolderName(String bossName) {
  return bossName.toLowerCase().replaceAll(' ', '_');
}

class QuestIcon extends StatelessWidget {
  final double zoom;
  final QuestData questData;
  final VoidCallback onClick;

  const QuestIcon({
    Key? key,
    required this.zoom,
    required this.questData,
    required this.onClick,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (zoom < 15) return const SizedBox.shrink();

    return GestureDetector(
      onTap: onClick,
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: Container(
          width: 80, // 20 * 4 px scale approx
          height: 80,
          decoration: BoxDecoration(
            color: Colors.orange[600],
            shape: BoxShape.circle,
            border: Border.all(color: Colors.black, width: 1),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              ClipOval(
                child: Image.asset(
                  'assets/img/satchel.png',
                  fit: BoxFit.cover,
                  width: 80,
                  height: 80,
                ),
              ),
              // The downward triangle pointer below the circle
              Positioned(
                bottom: -20, // 20 pixels below container
                left: 40 - 20, // centered horizontally: half width - half triangle width
                child: CustomPaint(
                  size: const Size(40, 20),
                  painter: _TrianglePainter(color: Colors.orange[600]!),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}

class _TrianglePainter extends CustomPainter {
  final Color color;

  _TrianglePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;

    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width / 2, size.height)
      ..lineTo(size.width, 0)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_TrianglePainter oldDelegate) => false;
}
