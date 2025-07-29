import 'package:flutter/material.dart';

class IntroDialogScreen extends StatefulWidget {
  final VoidCallback onClickFinish;

  const IntroDialogScreen({super.key, required this.onClickFinish});

  @override
  State<IntroDialogScreen> createState() => _IntroDialogScreenState();
}

class _IntroDialogScreenState extends State<IntroDialogScreen> {
  int dialogIndex = 0;

  final List<String> dialogList = [
    "Once upon a time, you were a psychology major, working as a barista to help pay rent and tuition.",
    "Suddenly, a mysterious portal opens up in the middle of Starbags, sucking you in.",
    "You are transported into the magical realm of UCF.",
    "Your task is to defeat all the bosses and acquire their magical relics to escape"
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      constraints: const BoxConstraints(
        maxWidth: 600, // prevent too wide on big screens
      ),
      decoration: BoxDecoration(
        color: Colors.grey[850],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...dialogList.asMap().entries.map((entry) {
            if (entry.key > dialogIndex) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Text(
                entry.value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  inherit: true, // Explicitly set inherit to avoid lerp issues
                ),
              ),
            );
          }).toList(),

          const SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (dialogIndex != dialogList.length - 1)
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      dialogIndex += 1;
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    textStyle: const TextStyle(
                      fontWeight: FontWeight.normal,
                      inherit: true,
                    ),
                  ),
                  child: const Text("Next"),
                ),
              if (dialogIndex == dialogList.length - 1)
                ElevatedButton(
                  onPressed: widget.onClickFinish,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.black,
                    textStyle: const TextStyle(
                      fontWeight: FontWeight.bold,
                      inherit: true,
                    ),
                  ),
                  child: const Text("Begin Your Journey"),
                ),
            ],
          )
        ],
      ),
    );
  }
}
