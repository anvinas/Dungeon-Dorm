import 'package:flutter/material.dart';

class ModalOverlay extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final VoidCallback onClose;

  const ModalOverlay({
    super.key,
    required this.title,
    required this.children,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withOpacity(0.8),
      child: Center(
        child: Container(
          padding: const EdgeInsets.all(24),
          margin: const EdgeInsets.symmetric(horizontal: 40),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(title,
                      style: const TextStyle(
                          fontSize: 20, fontWeight: FontWeight.bold)),
                  IconButton(
                      icon: const Icon(Icons.close), onPressed: onClose),
                ],
              ),
              ...children,
            ],
          ),
        ),
      ),
    );
  }
}