import 'package:flutter/material.dart';
import '../utils/types.dart';

class Dialogues {
  final List<String> preFightMain;
  Dialogues({required this.preFightMain});
}

// Replace with your real helper function logic
String getBossFolderName(String bossName) {
  // e.g. convert bossName to folder name string
  return bossName.toLowerCase().replaceAll(' ', '_');
}

class PrefightModal extends StatelessWidget {
  final QuestData? questData;
  final VoidCallback onClickExit;
  final VoidCallback onClickFight;

  const PrefightModal({
    Key? key,
    required this.questData,
    required this.onClickExit,
    required this.onClickFight,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (questData == null) {
      return SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.grey[850],
        borderRadius: BorderRadius.circular(12),
      ),
      width: double.infinity,
      height: double.infinity,
      child: Column(
        children: [
          // HEADER Exit button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const SizedBox(width: 50), // empty space to match your layout
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red[600],
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                ),
                onPressed: onClickExit,
                child: const Text(
                  'Exit',
                  style: TextStyle(fontSize: 18, color: Colors.white),
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Main content with image and dialogues
          Expanded(
            child: Row(
              children: [
                // Image container 30%
                Expanded(
                  flex: 3,
                  child: Container(
                    alignment: Alignment.center,
                    child: AspectRatio(
                      aspectRatio: 1, // aspect square
                      child: Image.asset(
                        'assets/img/satchel.png',
                        fit: BoxFit.cover,
                        alignment: Alignment.topCenter,
                      ),
                    ),
                  ),
                ),

                const SizedBox(width: 20),

                // Dialog container (70%)
                Expanded(
                  flex: 7,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.grey[900],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: ListView.builder(
                      itemCount: questData!.dialogues.preFightMain.length,
                      itemBuilder: (context, index) {
                        final dialogue = questData!.dialogues.preFightMain[index];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Text(
                            dialogue,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Footer Fight button
          Center(
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.purple[600],
                padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: onClickFight,
              child: const Text(
                'Fight Boss!',
                style: TextStyle(fontSize: 20, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
