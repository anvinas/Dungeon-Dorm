class AttackResult {
  final bool hit;
  final int crit;
  final int d20;
  final int totalRollWithModifiers;
  final int totalRollNeeded;
  final int damage;
  final String primaryStat;
  final String message;

  AttackResult({
    required this.hit,
    required this.crit,
    required this.d20,
    required this.totalRollWithModifiers,
    required this.totalRollNeeded,
    required this.damage,
    required this.primaryStat,
    required this.message,
  });

  factory AttackResult.fromJson(Map<String, dynamic> json) {
    return AttackResult(
      hit: json['hit'],
      crit: json['crit'],
      d20: json['d20'],
      totalRollWithModifiers: json['totalRollWithModifiers'],
      totalRollNeeded: json['totalRollNeeded'],
      damage: json['damage'],
      primaryStat: json['primaryStat'],
      message: json['message'],
    );
  }
}

class TurnResult {
  final String currentTurn;
  final String message;
  final int postTurnEnemyHP;
  final int postTurnUserHP;
  final AttackResult userAttack;
  final AttackResult enemyAttack;

  TurnResult({
    required this.currentTurn,
    required this.message,
    required this.postTurnEnemyHP,
    required this.postTurnUserHP,
    required this.userAttack,
    required this.enemyAttack,
  });

  factory TurnResult.fromJson(Map<String, dynamic> json) {
    return TurnResult(
      currentTurn: json['currentTurn'],
      message: json['message'],
      postTurnEnemyHP: json['postTurnEnemyHP'],
      postTurnUserHP: json['postTurnUserHP'],
      userAttack: AttackResult.fromJson(json['userAttack']),
      enemyAttack: AttackResult.fromJson(json['enemyAttack']),
    );
  }
}

class UserAttackTurnReturn {
  final AttackResult userAttack;
  final int postTurnUserHP;
  final int postTurnEnemyHP;
  final TurnResult userResult;
  final TurnResult? enemyResult;
  final String? message;

  UserAttackTurnReturn({
    required this.userAttack,
    required this.postTurnUserHP,
    required this.postTurnEnemyHP,
    required this.userResult,
    required this.enemyResult,
    this.message,
  });

  factory UserAttackTurnReturn.fromJson(Map<String, dynamic> json) {
    return UserAttackTurnReturn(
      userAttack: AttackResult.fromJson(json['userAttack']),
      postTurnUserHP: json['postTurnUserHP'],
      postTurnEnemyHP: json['postTurnEnemyHP'],
      userResult: TurnResult.fromJson(json['userResult']),
      enemyResult: json['enemyResult'] != null
          ? TurnResult.fromJson(json['enemyResult'])
          : null,
      message: json['message'],
    );
  }
}

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

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      id: json['_id'],
      name: json['name'],
      description: json['description'],
      damage: json['damage'],
      itemType: json['itemType'],
      imageURL: json['imageURL'],
      healthAmount: json['healthAmount'],
    );
  }
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

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      strength: json['strength'],
      dexterity: json['dexterity'],
      intelligence: json['intelligence'],
      charisma: json['charisma'],
      defense: json['defense'],
    );
  }
}

class Character {
  final String id;
  final String species;
  final String characterClass;
  final int maxHP;
  final Map<String, dynamic> stats;

  Character({
    required this.id,
    required this.species,
    required this.characterClass,
    required this.maxHP,
    required this.stats,
  });

  factory Character.fromJson(Map<String, dynamic> json) {
    return Character(
      id: json['_id'],
      species: json['species'],
      characterClass: json['class'],
      maxHP: json['maxHP'],
      stats: json['stats'],
    );
  }
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

  factory CurrentLootItem.fromJson(Map<String, dynamic> json) {
    return CurrentLootItem(
      itemId: InventoryItem.fromJson(json['itemId']),
      quantity: json['quantity'],
      id: json['_id'],
    );
  }
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
  final int toLevelUpXP;
  final int currentXP;

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
    required this.currentActiveBoss,
    required this.createdAt,
    required this.updatedAt,
    required this.toLevelUpXP,
    required this.currentXP,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['_id'] is Map ? json['_id']['\$oid'] ?? '' : json['_id']?.toString() ?? '',
      email: json['email'] ?? '',
      gamerTag: json['gamerTag'] ?? '',
      level: json['level'] ?? 0,
      currency: json['Currency'] ?? 0,
      maxHP: json['maxHP'] ?? 0,
      currentHP: json['currentHP'] ?? 0,
      currentStats: UserStats.fromJson(json['currentStats'] ?? {}),
      currentLoot: (json['CurrentLoot'] as List<dynamic>? ?? [])
          .map((x) => CurrentLootItem.fromJson(x))
          .toList(),
      character: Character.fromJson(json['Character'] ?? {}),
      bosses: List<String>.from(json['Bosses'] ?? []),
      currentActiveBoss: json['currentActiveBoss']?.toString(),
      createdAt: json['createdAt'] ?? '',
      updatedAt: json['updatedAt'] ?? '',
      toLevelUpXP: json['toLevelUpXP'] ?? 0,
      currentXP: json['currentXP'] ?? 0,
    );
  }
}


class Encounter {
  final String message;
  final EncounterEntity user;
  final EncounterEntity enemy;
  final String currentTurn;

  Encounter({
    required this.message,
    required this.user,
    required this.enemy,
    required this.currentTurn,
  });

  factory Encounter.fromJson(Map<String, dynamic> json) {
    return Encounter(
      message: json['message'],
      user: EncounterEntity.fromJson(json['user']),
      enemy: EncounterEntity.fromJson(json['enemy']),
      currentTurn: json['currentTurn'],
    );
  }
}

class EncounterEntity {
  final UserStats stats;
  final int maxHP;
  final int currentHP;
  final int? relationshipGoal;
  final String? name;

  EncounterEntity({
    required this.stats,
    required this.maxHP,
    required this.currentHP,
    this.relationshipGoal,
    this.name,
  });

  factory EncounterEntity.fromJson(Map<String, dynamic> json) {
    return EncounterEntity(
      stats: UserStats.fromJson(json['stats']),
      maxHP: json['maxHP'],
      currentHP: json['currentHP'],
      relationshipGoal: json['relationshipGoal'],
      name: json['name'],
    );
  }
}

class QuestDialogues {
  final String ifNotUnlocked;
  final List<String> preFightMain;
  final List<String> bossFightSuccess;
  final List<String> bossFightFail;
  final List<String> userFightSuccess;
  final List<String> userFightFail;
  final List<String> userTalkSuccess;
  final List<String> userTalkFail;
  final List<String> userHideSuccess;
  final List<String> userHideFail;
  final String death;
  final String relationshipGain;
  final String win;

  QuestDialogues({
    required this.ifNotUnlocked,
    required this.preFightMain,
    required this.bossFightSuccess,
    required this.bossFightFail,
    required this.userFightSuccess,
    required this.userFightFail,
    required this.userTalkSuccess,
    required this.userTalkFail,
    required this.userHideSuccess,
    required this.userHideFail,
    required this.death,
    required this.relationshipGain,
    required this.win,
  });

  factory QuestDialogues.fromJson(Map<String, dynamic> json) {
    return QuestDialogues(
      ifNotUnlocked: json['ifNotUnlocked'],
      preFightMain: List<String>.from(json['preFightMain']),
      bossFightSuccess: List<String>.from(json['bossFight']['success']),
      bossFightFail: List<String>.from(json['bossFight']['fail']),
      userFightSuccess: List<String>.from(json['userFight']['success']),
      userFightFail: List<String>.from(json['userFight']['fail']),
      userTalkSuccess: List<String>.from(json['userTalk']['success']),
      userTalkFail: List<String>.from(json['userTalk']['fail']),
      userHideSuccess: List<String>.from(json['userHide']['success']),
      userHideFail: List<String>.from(json['userHide']['fail']),
      death: json['death'],
      relationshipGain: json['relationshipGain'],
      win: json['win'],
    );
  }
}

class QuestData {
  final String id;
  final String name;
  final String species;
  final String characterClass;
  final int maxHP;
  final int relationshipGoal;
  final UserStats stats;
  final QuestReward reward;
  final int level;
  final QuestLocation location;
  final QuestDialogues dialogues;
  final String enemyType;

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
  });

  factory QuestData.fromJson(Map<String, dynamic> json) {
    return QuestData(
      id: json['_id']['\$oid'],
      name: json['name'],
      species: json['species'],
      characterClass: json['class'],
      maxHP: json['maxHP'],
      relationshipGoal: json['relationshipGoal'],
      stats: UserStats.fromJson(json['stats']),
      reward: QuestReward.fromJson(json['reward']),
      level: json['level'],
      location: QuestLocation.fromJson(json['location']),
      dialogues: QuestDialogues.fromJson(json['dialogues']),
      enemyType: json['enemyType'],
    );
  }
}

class QuestReward {
  final int gold;
  final List<RewardItem> items;
  final int xp;

  QuestReward({
    required this.gold,
    required this.items,
    required this.xp,
  });

  factory QuestReward.fromJson(Map<String, dynamic> json) {
    return QuestReward(
      gold: json['gold'],
      items: List<RewardItem>.from(json['items'].map((x) => RewardItem.fromJson(x))),
      xp: json['xp'],
    );
  }
}

class RewardItem {
  final String itemId;
  final int quantity;

  RewardItem({
    required this.itemId,
    required this.quantity,
  });

  factory RewardItem.fromJson(Map<String, dynamic> json) {
    return RewardItem(
      itemId: json['itemId']['\$oid'],
      quantity: json['quantity'],
    );
  }
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

  factory QuestLocation.fromJson(Map<String, dynamic> json) {
    return QuestLocation(
      sceneName: json['sceneName'],
      description: json['description'],
      environmentTags: List<String>.from(json['environmentTags']),
      latitude: json['latitude'],
      longitude: json['longitude'],
    );
  }
}
