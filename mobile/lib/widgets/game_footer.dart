import 'package:flutter/material.dart';

class GameFooter extends StatelessWidget {
  final VoidCallback onClickInventory;

  const GameFooter({Key? key, required this.onClickInventory}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      // equivalent to Tailwind: relative w-full h-full p-15 text-white shadow-lg
      width: double.infinity,
      height: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.transparent, // background same as parent
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween, // justify-between
        crossAxisAlignment: CrossAxisAlignment.end, // items-end
        children: [
          // Avatar (left side)
          const Avatar(),

          // Inventory button (center)
          GestureDetector(
            onTap: onClickInventory,
            child: Container(
              padding: const EdgeInsets.all(20), // p-5 (20px)
              decoration: BoxDecoration(
                color: Colors.red[100], // bg-red-100
                border: Border.all(color: Colors.blue.shade500, width: 4), // border-4 border-blue-500
                shape: BoxShape.circle, // rounded-[50%]
              ),
              child: Transform(
                alignment: Alignment.center,
                transform: Matrix4.identity()..scale(-1.0, 1.0), // scale-x-[-1]
                child: Image.asset(
                  'assets/img/satchel.png',
                  height: 80, // h-20 (20 * 4 = 80px)
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),

          // Right side placeholder
          const SizedBox(width: 0),
        ],
      ),
    );
  }
}

// Placeholder Avatar widget
class Avatar extends StatelessWidget {
  const Avatar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const CircleAvatar(
      radius: 30,
      backgroundColor: Colors.blueGrey,
      child: Text(
        'A',
        style: TextStyle(fontSize: 24, color: Colors.white),
      ),
    );
  }
}
