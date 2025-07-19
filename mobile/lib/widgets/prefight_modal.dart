import 'package:flutter/material.dart';
import '../utils/types.dart';

class PrefightModal extends StatelessWidget {
  final QuestData questData;
  final VoidCallback onClickExit;
  final VoidCallback onClickFight;

  const PrefightModal({
    super.key,
    required this.questData,
    required this.onClickExit,
    required this.onClickFight,
  });

  String getBossImagePath(String name) {
    final folder = name.toLowerCase().replaceAll(' ', '-');
    return 'assets/img/boss/$folder/real.png';
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF1E1E2C),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row (Name + Level + Exit)
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Name: ${questData.name}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Text(
                  'Level: ${questData.level}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: onClickExit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: const Text("Exit"),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Boss Image + Dialog
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Boss image (non-circular, like the example)
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    image: DecorationImage(
                      image: AssetImage(getBossImagePath(questData.name)),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                const SizedBox(width: 16),

                // Dialogue
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2A2A3D),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Text(
                      '''
...

You killed that BlobMan? I’ve been waiting for him to kick the bucket. Bro wouldn’t stop preaching.

...

So…. Do you listen to Radiohead? Wanna listen to Creep….

Oh…You want my stone rune? I should have known you didn’t care about RadioHead.
''',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Fight Button
            Center(
              child: ElevatedButton(
                onPressed: onClickFight,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.purple,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                ),
                child: const Text(
                  "Fight Boss!",
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
