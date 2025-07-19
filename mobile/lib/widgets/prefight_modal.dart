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
      backgroundColor: Colors.grey[900],
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Exit Button
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                ElevatedButton(
                  onPressed: onClickExit,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  child: const Text("Exit"),
                )
              ],
            ),
            const SizedBox(height: 16),

            // Boss Image + Dialogues
            Row(
              children: [
                // Boss Image
                Expanded(
                  flex: 3,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: ClipOval(
                      child: Image.asset(
                        getBossImagePath(questData.name),
                        fit: BoxFit.cover,
                        width: 100,
                        height: 100,
                      ),
                    ),
                  ),
                ),

                // Dialogue Bubbles
                Expanded(
                  flex: 6,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                     )
                )
              ],
            ),
            const SizedBox(height: 24),

            // Fight Button
            ElevatedButton(
              onPressed: onClickFight,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
              child: const Text("Fight Boss!"),
            ),
          ],
        ),
      ),
    );
  }
}
