import 'package:flutter/material.dart';
import '../utils/types.dart';

class PrefightModal extends StatelessWidget {
  final Map<String, dynamic> questData;
  final VoidCallback onClickExit;
  final VoidCallback onClickFight;

  const PrefightModal({
    super.key,
    required this.questData,
    required this.onClickExit,
    required this.onClickFight,
  });

  String getBossImagePath(String className) {
    String imagePath;
    switch (className) {
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
      case 'Wizard':
        imagePath = 'assets/img/boss/evil/pixel.png';
        break;
      default:
        imagePath = 'assets/img/boss/andrea/pixel.png';
    }
    return imagePath;
  }

  @override
  Widget build(BuildContext context) {
  
  return Dialog(
    backgroundColor: const Color(0xFF12121A),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    
    child: ConstrainedBox(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.8, // limit dialog height
        minHeight: 350
      ),
      child: IntrinsicHeight(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              /// Title Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          questData["name"],
                          style: const TextStyle(
                            color: Colors.amberAccent,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Level: ${questData["level"]}',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: onClickExit,
                    tooltip: "Exit",
                    icon: const Icon(Icons.close),
                    color: Colors.redAccent,
                    iconSize: 28,
                  ),
                ],
              ),
              const SizedBox(height: 20),

              /// Boss Image + Dialogue
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  /// Boss Image
                  Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.deepPurpleAccent, width: 2),
                      borderRadius: BorderRadius.circular(12),
                      image: DecorationImage(
                        image: AssetImage(getBossImagePath(questData["class"])),
                        fit: BoxFit.cover,
                      ),
                      boxShadow: const [
                        BoxShadow(
                          color: Colors.deepPurple,
                          blurRadius: 12,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),

                  /// Scrollable Dialogue Box
                  Expanded(
                    child: Container(
                      height: 310, // matches boss image height for aesthetics
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF23233A),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: SingleChildScrollView(
                        child: Text(
                          questData["preFightMain"].join("\n"),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13.5,
                            height: 1.45,
                            fontFamily: 'Courier',
                            shadows: [
                              Shadow(
                                color: Colors.black45,
                                blurRadius: 1,
                                offset: Offset(1, 1),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              /// Fight Button
              ElevatedButton(
                onPressed: onClickFight,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.deepPurple,
                  padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 6,
                  shadowColor: Colors.deepPurpleAccent,
                ),
                child: const Text(
                  "⚔️ Fight Boss!",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1,
                    color: Colors.black
                  ),
                ),
              ),
            ],
          ),
        ),
      )
    ),
  );
}

}
