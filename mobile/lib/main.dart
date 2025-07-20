import 'package:dungeon_and_dorms/utils/types.dart';
import 'package:flutter/material.dart';
import 'pages/boss_fight_page.dart';
import 'pages/login_page.dart';
import 'pages/select_character.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Login UI',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => CharacterSelectPage(),
        '/select': (context) => CharacterSelectPage(),
        '/play': (context) => const LoginPage(),
        '/bossfight': (context) {
          final questData = ModalRoute.of(context)!.settings.arguments as QuestData;
          return BossFightPage(bossId: questData.id);
        },

      },
    );
  }
}
