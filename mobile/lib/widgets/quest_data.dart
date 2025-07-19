import 'package:flutter/material.dart';
import '../utils/types.dart';

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
      child: Container(
        width: 80,
        height: 80,
        decoration: BoxDecoration(
          color: Colors.orange.shade600,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.black, width: 1),
        ),
        child: Stack(
          alignment: Alignment.center,
          clipBehavior: Clip.none,
          children: [
            // Boss Image
            ClipOval(
              child: Image.asset(
                'assets/img/boss/andrea/real.png',
                fit: BoxFit.cover,
                width: 80,
                height: 80,
              ),
            ),

            // Triangle Pointer
            Positioned(
              bottom: -12,
              child: Transform.rotate(
                angle: 3.1416,
                child: CustomPaint(
                  size: const Size(20, 10),
                  painter: _PointerTrianglePainter(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PointerTrianglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.orange.shade600
      ..style = PaintingStyle.fill;

    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width / 2, size.height)
      ..lineTo(size.width, 0)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
