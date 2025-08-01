import 'package:dungeon_and_dorms/pages/play_page.dart';
import 'package:dungeon_and_dorms/utils/types.dart';
import 'package:flutter/material.dart';
import 'pages/boss_fight_page.dart';
import 'pages/login_page.dart';
import 'pages/select_character.dart';
import 'pages/verify_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dungeon & Dorms',
      theme: ThemeData(primarySwatch: Colors.blue),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginPage(),
        '/select': (context) => CharacterSelectPage(),
        '/play': (context) => const GameMapPage(),
        '/verify': (context) => VerifyEmailPage(),
        '/bossfight': (context) {
          final bossId = ModalRoute.of(context)!.settings.arguments as String;
          return BossFightPage(bossId: bossId);
        },

      },
    );
  }
}
