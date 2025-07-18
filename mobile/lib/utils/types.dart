// utils/types.dart

import 'package:latlong2/latlong.dart';
import 'package:flutter/material.dart'; // Often needed for Dialogues even if not directly in this file

// Helper function (retained from previous context, often found in a utility file)
String getBossFolderName(String bossName) {
  return bossName.toLowerCase().replaceAll(' ', '_');
}

// Existing classes from your provided type.dart
class InventoryItem {
  final String id;
  final String name;
  final String description;
  final int damage;
  final String itemType;
  final String? imageURL;
  final int? healthAmount;

  InventoryItem({
    required this.id,
    required this.name,
    required this.description,
    required this.damage,
    required this.itemType,
    this.imageURL,
    this.healthAmount,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) => InventoryItem(
        id: json['_id'] as String,
        name: json['name'] as String,
        description: json['description'] as String,
        damage: json['damage'] as int,
        itemType: json['itemType'] as String,
        imageURL: json['imageURL'] as String?,
        healthAmount: json['healthAmount'] as int?,
      );
}

class UserStats {
  final int strength;
  final int dexterity;
  final int intelligence;
  final int charisma;
  final int defense;

  UserStats({
    required this.strength,
    required this.dexterity,
    required this.intelligence,
    required this.charisma,
    required this.defense,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) => UserStats(
        strength: json['strength'] as int,
        dexterity: json['dexterity'] as int,
        intelligence: json['intelligence'] as int,
        charisma: json['charisma'] as int,
        defense: json['defense'] as int,
      );
}

class LootItem {
  final String itemId;
  final int quantity;
  final String id;

  LootItem({
    required this.itemId,
    required this.quantity,
    required this.id,
  });

  factory LootItem.fromJson(Map<String, dynamic> json) => LootItem(
        itemId: json['itemId'] as String,
        quantity: json['quantity'] as int,
        id: json['_id'] as String,
      );
}

class Character {
  final String id;
  final String species;
  final String characterClass;
  final int maxHP;
  final CharacterStats stats;

  Character({
    required this.id,
    required this.species,
    required this.characterClass,
    required this.maxHP,
    required this.stats,
  });

  factory Character.fromJson(Map<String, dynamic> json) => Character(
        id: json['_id'] as String,
        species: json['species'] as String,
        characterClass: json['class'] as String,
        maxHP: json['maxHP'] as int,
        stats: CharacterStats.fromJson(json['stats'] as Map<String, dynamic>),
      );
}

class CharacterStats {
  final int gold;
  final String weapon;

  CharacterStats({
    required this.gold,
    required this.weapon,
  });

  factory CharacterStats.fromJson(Map<String, dynamic> json) => CharacterStats(
        gold: json['gold'] as int,
        weapon: json['weapon'] as String,
      );
}

class UserProfile {
  final String id;
  final String email;
  final String gamerTag;
  final int level;
  final int currency;
  final int maxHP;
  final int currentHP;
  final UserStats currentStats;
  final List<CurrentLootItem> currentLoot;
  final Character character;
  final List<String> bosses;
  final String? currentActiveBoss;
  final String createdAt;
  final String updatedAt;

  UserProfile({
    required this.id,
    required this.email,
    required this.gamerTag,
    required this.level,
    required this.currency,
    required this.maxHP,
    required this.currentHP,
    required this.currentStats,
    required this.currentLoot,
    required this.character,
    required this.bosses,
    this.currentActiveBoss,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        id: json['_id'] as String,
        email: json['email'] as String,
        gamerTag: json['gamerTag'] as String,
        level: json['level'] as int,
        currency: json['Currency'] as int,
        maxHP: json['maxHP'] as int,
        currentHP: json['currentHP'] as int,
        currentStats: UserStats.fromJson(json['currentStats'] as Map<String, dynamic>),
        currentLoot: (json['CurrentLoot'] as List<dynamic>)
            .map((e) => CurrentLootItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        character: Character.fromJson(json['Character'] as Map<String, dynamic>),
        bosses: List<String>.from(json['Bosses'] as List),
        currentActiveBoss: json['currentActiveBoss'] as String?,
        createdAt: json['createdAt'] as String,
        updatedAt: json['updatedAt'] as String,
      );
}

class CurrentLootItem {
  final InventoryItem itemId;
  final int quantity;
  final String id;

  CurrentLootItem({
    required this.itemId,
    required this.quantity,
    required this.id,
  });

  factory CurrentLootItem.fromJson(Map<String, dynamic> json) => CurrentLootItem(
        itemId: InventoryItem.fromJson(json['itemId'] as Map<String, dynamic>),
        quantity: json['quantity'] as int,
        id: json['_id'] as String,
      );
}

class Encounter {
  final String message;
  final EncounterStats user;
  final EncounterEnemy enemy;
  final String currentTurn;

  Encounter({
    required this.message,
    required this.user,
    required this.enemy,
    required this.currentTurn,
  });

  factory Encounter.fromJson(Map<String, dynamic> json) => Encounter(
        message: json['message'] as String,
        user: EncounterStats.fromJson(json['user'] as Map<String, dynamic>),
        enemy: EncounterEnemy.fromJson(json['enemy'] as Map<String, dynamic>),
        currentTurn: json['currentTurn'] as String,
      );
}

class EncounterStats {
  final UserStats stats;
  final int maxHP;
  final int currentHP;

  EncounterStats({
    required this.stats,
    required this.maxHP,
    required this.currentHP,
  });

  factory EncounterStats.fromJson(Map<String, dynamic> json) => EncounterStats(
        stats: UserStats.fromJson(json['stats'] as Map<String, dynamic>),
        maxHP: json['maxHP'] as int,
        currentHP: json['currentHP'] as int,
      );
}

class EncounterEnemy {
  final UserStats stats;
  final int relationshipGoal;
  final int maxHP;
  final String name;
  final int currentHP;

  EncounterEnemy({
    required this.stats,
    required this.relationshipGoal,
    required this.maxHP,
    required this.name,
    required this.currentHP,
  });

  factory EncounterEnemy.fromJson(Map<String, dynamic> json) => EncounterEnemy(
        stats: UserStats.fromJson(json['stats'] as Map<String, dynamic>),
        relationshipGoal: json['relationshipGoal'] as int,
        maxHP: json['maxHP'] as int,
        name: json['name'] as String,
        currentHP: json['currentHP'] as int,
      );
}

// Modified/retained Quest related classes to match the provided JSON structure and existing types.dart
class QuestData {
  final String id;
  final String name;
  final String species;
  final String characterClass; // Using characterClass as per existing type.dart
  final int maxHP;
  final int relationshipGoal;
  final UserStats stats; // Reusing UserStats for quest stats
  final QuestReward reward;
  final int level;
  final QuestLocation location;
  final QuestDialogues dialogues;
  final String enemyType;
  final int difficulty; // Added based on GameMapPage usage (derived from level)

  QuestData({
    required this.id,
    required this.name,
    required this.species,
    required this.characterClass,
    required this.maxHP,
    required this.relationshipGoal,
    required this.stats,
    required this.reward,
    required this.level,
    required this.location,
    required this.dialogues,
    required this.enemyType,
  }) : difficulty = level > 7 ? 3 : (level > 4 ? 2 : 1);

  factory QuestData.fromJson(Map<String, dynamic> json) => QuestData(
        id: json['_id']['\$oid'] as String,
        name: json['name'] as String,
        species: json['species'] as String,
        characterClass: json['class'] as String,
        maxHP: json['maxHP'] as int,
        relationshipGoal: json['relationshipGoal'] as int,
        stats: UserStats.fromJson(json['stats'] as Map<String, dynamic>),
        reward: QuestReward.fromJson(json['reward'] as Map<String, dynamic>),
        level: json['level'] as int,
        location: QuestLocation.fromJson(json['location'] as Map<String, dynamic>),
        dialogues: QuestDialogues.fromJson(json['dialogues'] as Map<String, dynamic>),
        enemyType: json['enemyType'] as String,
      );
}

class QuestReward {
  final int gold;
  final List<QuestRewardItem> items;
  final int xp;

  QuestReward({
    required this.gold,
    required this.items,
    required this.xp,
  });

  factory QuestReward.fromJson(Map<String, dynamic> json) => QuestReward(
        gold: json['gold'] as int,
        items: (json['items'] as List<dynamic>)
            .map((e) => QuestRewardItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        xp: json['xp'] as int,
      );
}

class QuestRewardItem {
  final String itemId;
  final int quantity;

  QuestRewardItem({
    required this.itemId,
    required this.quantity,
  });

  factory QuestRewardItem.fromJson(Map<String, dynamic> json) => QuestRewardItem(
        itemId: json['itemId']['\$oid'] as String,
        quantity: json['quantity'] as int,
      );
}

class QuestLocation {
  final String sceneName;
  final String description;
  final List<String> environmentTags;
  final double latitude;
  final double longitude;

  QuestLocation({
    required this.sceneName,
    required this.description,
    required this.environmentTags,
    required this.latitude,
    required this.longitude,
  });

  factory QuestLocation.fromJson(Map<String, dynamic> json) => QuestLocation(
        sceneName: json['sceneName'] as String,
        description: json['description'] as String,
        environmentTags: List<String>.from(json['environmentTags'] as List),
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
      );
}

class QuestDialogues {
  final String ifNotUnlocked;
  final List<String> preFightMain;
  final FightDialogue bossFight;
  final FightDialogue userFight;
  final FightDialogue userTalk;
  final FightDialogue userHide;
  final String death;
  final String relationshipGain;
  final String win;

  QuestDialogues({
    required this.ifNotUnlocked,
    required this.preFightMain,
    required this.bossFight,
    required this.userFight,
    required this.userTalk,
    required this.userHide,
    required this.death,
    required this.relationshipGain,
    required this.win,
  });

  factory QuestDialogues.fromJson(Map<String, dynamic> json) => QuestDialogues(
        ifNotUnlocked: json['ifNotUnlocked'] as String,
        preFightMain: List<String>.from(json['preFightMain'] as List),
        bossFight: FightDialogue.fromJson(json['bossFight'] as Map<String, dynamic>),
        userFight: FightDialogue.fromJson(json['userFight'] as Map<String, dynamic>),
        userTalk: FightDialogue.fromJson(json['userTalk'] as Map<String, dynamic>),
        userHide: FightDialogue.fromJson(json['userHide'] as Map<String, dynamic>),
        death: json['death'] as String,
        relationshipGain: json['relationshipGain'] as String,
        win: json['win'] as String,
      );
}

class FightDialogue {
  final List<String> success;
  final List<String> fail;

  FightDialogue({
    required this.success,
    required this.fail,
  });

  factory FightDialogue.fromJson(Map<String, dynamic> json) => FightDialogue(
        success: List<String>.from(json['success'] as List),
        fail: List<String>.from(json['fail'] as List),
      );
}

// The QUESTZONE constant, populated with your provided data
final List<QuestData> QUESTZONE = [
  QuestData(
    id: "685d5cb386585be7727d0621",
    name: "Gabriel the Hidden",
    species: "Tielfing",
    characterClass: "Rogue",
    maxHP: 256,
    relationshipGoal: 60,
    stats: UserStats(
      strength: 8,
      dexterity: 0,
      intelligence: 2,
      charisma: 2,
      defense: 7,
    ),
    reward: QuestReward(
      gold: 40,
      items: [
        QuestRewardItem(itemId: "686fd098e72e348229aee575", quantity: 1),
      ],
      xp: 2050,
    ),
    level: 8,
    location:  QuestLocation(
      sceneName: "Engineering Building",
      description: "Gears grind and steam hisses in this hub of innovation. Strange contraptions line the walls.",
      environmentTags: ["indoor", "industrial", "noisy"],
      latitude: 28.601807,
      longitude: -81.19874,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: "*flips hair and scoffs* Are you sure you’re in the right place? Come back when I'm not so busy.",
      preFightMain: [
        "...",
        "You killed that BlobMan? I've been waiting for him to kick the bucket. Bro wouldn’t stop preaching.",
        "...",
        "So…. Do you listen to Radiohead? Wanna listen to Creep….",
        "Oh…You want my stone rune? I should have known you didn't care about RadioHead.",
      ],
      bossFight: FightDialogue(
        success: ["Now, parry this, your filthy casual!", "I didn’t want this fight, but I sure will end it.", "Im beginning to enjoy this.", "Taste my blade."],
        fail: ["It's not like I cared about hitting you anyway.", "I should have done more training.", "I meant to do that."],
      ),
      userFight: FightDialogue(
        success: ["'Tis but a scratch.", "I think I felt that one.", "Why must you attack me?"],
        fail: ["You're going to need to try harder than that.", "How did you even defeat the other bosses? Excluding BlobMan of course…", "Is that all? Do you want a hug?༼ つ ◕_◕ ༽つ"],
      ),
      userTalk: FightDialogue(
        success: ["Well, I’m not a gatekeeper", "They do say sharing is caring", "Maybe you're not the worst person to have the magical stone"],
        fail: ["I'm not letting you out of this one.", "I'm enjoying this. I won't give it to you, but I'm enjoying this.", "You’re just a poser. No magic rock for you."],
      ),
      userHide: FightDialogue(
        success: ["Wow, that's fast. Where'd you go?", "Alright, I'll admit that was smooth.", "Hmm, vanished like a bad thought."],
        fail: ["I can still hear your breathing, poser.", "Hiding isn't your strong suit, I see.", "Did you really think that would work?"],
      ),
      death: "So not cool. Take the magical stone, but beware of its sinister temptation. I used to be so happy before i had this stone, but now… im a creep. Im a weirdoooooo….",
      relationshipGain: "So you’re not a poser. Good. I will allow you to be my friend and borrow my magical stone. Please be my friend.",
      win: "You are weak and wouldn't be able to handle the stone. You can’t even handle good music.",
    ),
    enemyType: "boss",
  ),
   QuestData(
    id: "685d5cb386585be7727d0620",
    name: "Queen Andrea of the Pixies",
    species: "Fairy",
    characterClass: "Bard",
    maxHP: 272,
    relationshipGoal: 80,
    stats: UserStats(
      strength: 0,
      dexterity: 8,
      intelligence: 8,
      charisma: 10,
      defense: 5,
    ),
    reward: QuestReward(
      gold: 50,
      items: [
        QuestRewardItem(itemId: "686fd102e72e348229aee578", quantity: 1),
      ],
      xp: 2200,
    ),
    level: 9,
    location: QuestLocation(
      sceneName: "Wooden Bridge (Night)",
      description: "A rickety bridge spanning a murky chasm. The wood creaks with every step. It feels especially eerie at nighttime.",
      environmentTags: ["outdoor", "dangerous", "nature", "nighttime"],
      latitude: 28.602777,
      longitude: -81.199921,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: "Who let this dude in? This is literally a palace. How did they get in here?",
      preFightMain: [
        "Hey girlypop! What brings you into my beautiful kingdom?",
        "Omg, you killed that blob thing? Slayyyyy.",
        "Not to be like super mega rude or anything, but like I have royal things to do…",
        "Why are you here?",
        "You want fairy dust? Too bad, you’re like not a fairy.”",
      ],
      bossFight: FightDialogue(
        success: ["Haha, you suck", "You’re wasting my time.", "You do know I am the Queen for a reason?"],
        fail: ["No fair, you’re cheating.", "Where are my guards?", "This is treason or something."],
      ),
      userFight: FightDialogue(
        success: ["OOOWWWW", "I’m totally going to be late to the council meeting.", "Fairy Dust won't even work for you!"],
        fail: ["Dude, are you even trying?", "Who taught you how to fight?", "yawn"],
      ),
      userTalk: FightDialogue(
        success: ["Well, if you need it for a quest…", "Little dust couldn't hurt.", "You don’t seem like you would abuse it."],
        fail: ["No, I don't care about your quest.", "Fairy Dust doesn’t work for non-fairies.", "I’m literally like a Queen, why wouldIi listen to you?"],
      ),
      userHide: FightDialogue(
        success: ["Did you leave?", "If you want to quit, you can.", "Please tell me they left."],
        fail: ["I can literally still see you.", "Now's not the time for hide and seek", "Are you supposed to be hiding?"],
      ),
      death: "Fine, take some fairy dust. But please leave some for my people. We can’t survive without it. *dies*",
      relationshipGain: "Well, if you only want a little, it shouldn't impact the rest of the fairies.",
      win: "Sorry, Pookie, but my fairies need the fairy dust, and it's no use to you.",
    ),
    enemyType: "boss",
  ),
   QuestData(
    id: "685d5cb386585be7727d0624",
    name: "Adrian the Prophet",
    species: "Plasmoid",
    characterClass: "Cleric",
    maxHP: 145,
    relationshipGoal: 10,
    stats: UserStats(
      strength: 1,
      dexterity: 5,
      intelligence: 1,
      charisma: 0,
      defense: 0,
    ),
    reward: QuestReward(
      gold: 10,
      items: [
        QuestRewardItem(itemId: "686fc288b782c6a3d9520562", quantity: 1),
      ],
      xp: 1000,
    ),
    level: 2,
    location: QuestLocation(
      sceneName: "Bathroom",
      description: "A surprisingly clean bathroom. A faint smell of magic hangs in the air.",
      environmentTags: ["indoor", "magical"],
      latitude: 28.60141,
      longitude: -81.199118,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: "Greetings, traveler. It seems you don't know how this world works yet. We should talk when you do.",
      preFightMain: [
        "Greetings, traveler. I am the Prophet Adrain, voice of the Great and Powerful Blob Lord.",
        "Have you come to talk about joining my faithful following in devoting our lives to the blobness?",
        "Oh, you just want my magical amulet? Erm, no, it's mine.",
      ],
      bossFight: FightDialogue(
        success: ["Hey, what are you doing? Globs aren’t supposed to win.", "My three year old little glob brother takes punches better", "Maybe I should be the main character ?? you kinda suck"],
        fail: ["Wait hold on lemme do my turn again", "My three year old little glob brother punches better than I do", "My bad! Nah nah i wasn’t trying to punch you!"],
      ),
      userFight: FightDialogue(
        success: ["I always lose", "Yeah, I deserve that", "Blobs are easy to hurt"],
        fail: ["Wow, I didnt get hurt", "Are you new here?", "The Blob Lord has saved me yet again. Pls join me and you too can be saved."],
      ),
      userTalk: FightDialogue(
        success: ["You’re right, The Great Blobness would want me to share.", "You probably deserve the Amulet more than me.", "The amulet would be more useful to you"],
        fail: ["But I need the amulet to lead my followers to The Blob End.", "Please, the amulet is all I have", "The Great Blob gave me this amulet."],
      ),
      userHide: FightDialogue(
        success: ["I kinda miss them they were kinda chill", "Dang, I thought we were having fun", "Noooo, another person run away from me"],
        fail: ["This glob can still see you know", "Please dont go", "The Blob Lord wouldnt hide from you"],
      ),
      death: "Not many can defeat a glob. I remember one time, my great grandfather managed to defeat another glob. Let me tell you the story…*explodes*",
      relationshipGain: "I never thought about it, but why would you kill a glob? We’re innocent and don’t do anything. We can be friends.",
      win: "Sorry, traveler. I am not sure how I defeated you, I’ve never done that before.",
    ),
    enemyType: "boss",
  ),
   QuestData(
    id: "685d5cb386585be7727d061f",
    name: "Evil Narrator",
    species: "Human",
    characterClass: "Wizard",
    maxHP: 430,
    relationshipGoal: 100,
    stats: UserStats(
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      charisma: 10,
      defense: 10,
    ),
    reward: QuestReward(
      gold: 1000,
      items: [],
      xp: 2200,
    ),
    level: 10,
    location: QuestLocation(
      sceneName: "Classroom",
      description: "Desks and chairs are neatly arranged, awaiting students. A chalkboard lists obscure equations.",
      environmentTags: ["indoor", "learning", "quiet"],
      latitude: 28.6016,
      longitude: -81.2,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: "You haven't collected everything I need. Come back when you are actually ready.",
      preFightMain: [
        "Finally! Took you long enough to get everything.",
        "I should have known a simple barista would take their sweet time even if they think the world is at stake.",
        "Well, joke's on you, the world was perfectly fine, just filled with losers and blobs.",
        "But now that I have these magical items, I am going to cleanse the world of trash.",
        "That's right. IM EVIL PROFESSOR LEINECKER!!!!!!!",
      ],
      bossFight: FightDialogue(
        success: ["Consider yourself... deprecated.", "I refactor enemies like I refactor code, with no mercy.", "You’re just an error I need to debug"],
        fail: ["The Demo gods are against me", "Guess my attack’s still in beta", "My attack’s just buffering"],
      ),
      userFight: FightDialogue(
        success: ["How could a barista hurt me?", "Oof. That almost made me reboot.", "Ugh. You’re causing memory leaks and headaches."],
        fail: ["The demo gods are with me", "That looked like a segmentation fault.", "Oops. Did I crash you?"],
      ),
      userTalk: FightDialogue(
        success: ["I guess it is rude to destroy the world", "I do need baristas for my coffee.", "Maybe being a psych major isn't a waste of time.."],
        fail: ["I don’t care what a barista thinks.", "Are you gonna use psychology to stop me?", "If I wanted peace, I wouldn't be running this program."],
      ),
      userHide: FightDialogue(
        success: ["Are you procrastinating this fight?", "Hide all you want, I eventually find the bugs.", "Go ahead. Compile your courage while I pretend to look."],
        fail: ["Did Psych 101 teach you that?", "Ouch. That hurt... my respect for you.", "Run all you want. I’ve already cached your location"],
      ),
      death: "But how? You’re just a simple barista… Or am I the barista? *Gets transformed into starbags employee*",
      relationshipGain: "Fine, I won’t destroy the world just because of some losers.",
      win: "I executed my final function: your defeat.” *Destroys the world*.",
    ),
    enemyType: "boss",
  ),
   QuestData(
    id: "685d5cb386585be7727d0622",
    name: "Just Dave",
    species: "Dragonborn",
    characterClass: "Fighter",
    maxHP: 234,
    relationshipGoal: 40,
    stats: UserStats(
      strength: 6,
      dexterity: 2,
      intelligence: 1,
      charisma: 1,
      defense: 6,
    ),
    reward: QuestReward(
      gold: 40,
      items: [
        QuestRewardItem(itemId: "686fcd2ee72e348229aee570", quantity: 1),
      ],
      xp: 1750,
    ),
    level: 6,
    location: QuestLocation(
      sceneName: "Library",
      description: "Rows upon rows of ancient texts and arcane scrolls. Dust motes dance in the sunlight.",
      environmentTags: ["indoor", "knowledge", "quiet"],
      latitude: 28.600852,
      longitude: -81.20102,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: "Scary Dragon noises. Maybe you(user) should come back later",
      preFightMain: [
        "Good Marrow! Welcome to my collection of trinkets.",
        "You’re the killer of the blob pest? Huzzah! I hope this world will one day be free of the blob infestation.",
        "I know my dragon-like appearance might be frightening, but no fear.",
        "I am merely a knowledge collector who also happens to be well-trained in murder.",
        "The Sword of Destruction? I protect it here along with other historical pieces. You may not have it.",
      ],
      bossFight: FightDialogue(
        success: ["No one may take from my collection.", "This library is a place of peace.", "I have lived and fought for a millennium, you will not defeat me."],
        fail: ["Well done", "Perhaps I am out of practice.", "You are stubborn."],
      ),
      userFight: FightDialogue(
        success: ["*Grrrr* (idk dragon noise)", "It seems you are also well-trained", "Is fighting necessary?"],
        fail: ["You are weak", "Fighting is pointless", "*Sign*"],
      ),
      userTalk: FightDialogue(
        success: ["Perhaps if you intend to return it…", "You seem like a good person…", "I do want to share my knowledge"],
        fail: ["The sword must stay here", "You do not understand the danger the sword brings", "No."],
      ),
      userHide: FightDialogue(
        success: ["You are merely stalling", "You cannot hide forever", "Hiding will only work for so long."],
        fail: ["Cowardly, aren't you?", "You are still visible", "Hiding will not save you"],
      ),
      death: "I merely wanted to collect and share my knowledge. The Sword of Destruction will only bring chaos. Killing me is only the beginning…..",
      relationshipGain: "You are quite convincing. Perhaps you can handle the sword of destruction.",
      win: "As I said before. I am well-trained.",
    ),
    enemyType: "boss",
  ),
   QuestData(
    id: "685d5cb386585be7727d0623",
    name: "Shaq of the Forest",
    species: "Elf (w/dreads)",
    characterClass: "Ranger",
    maxHP: 178,
    relationshipGoal: 20,
    stats: UserStats(
      strength: 2,
      dexterity: 4,
      intelligence: 2,
      charisma: 4,
      defense: 2,
    ),
    reward: QuestReward(
      gold: 0,
      items: [
        QuestRewardItem(itemId: "686fc8f3b782c6a3d9520574", quantity: 1),
      ],
      xp: 1450,
    ),
    level: 4,
    location: QuestLocation(
      sceneName: "Wooden Bridge",
      description: "A rickety bridge spanning a murky chasm. The wood creaks with every step under the bright daytime sun.",
      environmentTags: ["outdoor", "dangerous", "nature", "daytime"],
      latitude: 28.602371,
      longitude: -81.199336,
    ),
    dialogues: QuestDialogues(
      ifNotUnlocked: "Hey Stranger. This forest might to too dangerous for someone like you. Maybe come back when you're stronger.",
      preFightMain: [
        "Hey Stranger. What brings you here?",
        "Oh, you killed Blobman? THANK GOD HE SUCKED!!!!!!!!!!!!!!!",
        "Well, as you go through this forest, be careful. And remember: Be Bear Aware, Follow Fire Safety Guidelines, and–",
        "My enchanted armor? I kind of need it.",
      ],
      bossFight: FightDialogue(
        success: ["The forest is my terrain", "Hair flip", "Nature is on my side"],
        fail: ["You made me waste an arrow", "Nature is not on my side today", "Uhhh, the wind messed me up"],
      ),
      userFight: FightDialogue(
        success: ["This is not following forest safety protocols", "You’re not a very happy camper", "This is why I need the armor"],
        fail: ["Hahaha", "You clearly arent meant to be in this forest", "Thats what happens if you dont follow forest protocol"],
      ),
      userTalk: FightDialogue(
        success: ["Well, if you need the armor", "I could live without the extra protection", "You’re right, the armor is not very fashionable"],
        fail: ["Stop trying to take my things", "Get your own armor", "Whats mine is mine."],
      ),
      userHide: FightDialogue(
        success: ["Woah, whered you go", "Whered you learn to camouflage", "Hes gone….."],
        fail: ["I am a master of this forest, I see all", "Camouflage is not your strong suit", "You are bad at hiding"],
      ),
      death: "You bested me. Fine, the forest will live without me. Just do not let my armor fall into the wrong hands…",
      relationshipGain: "Well, if you really want the armor. I have a backup outfit anyway.",
      win: "Hahaha, you cannot best me in my own domain. Next time, think about forest preservation before you start unnecessary danger.",
    ),
    enemyType: "boss",
  ),
];