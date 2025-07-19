

export interface AttackResult_T {
  hit: boolean;
  crit: number;
  d20: number;
  totalRollWithModifiers: number;
  totalRollNeeded: number;
  damage: number;
  primaryStat: string;
  message: string;
}



export type TurnResult_T =
  | {
      currentTurn: 'User';
      message: string;
      postTurnEnemyHP: number;
      postTurnUserHP: number;
      userAttack: AttackResult_T;
      enemyAttack: AttackResult_T;
    }
  | {
      currentTurn: 'Enemy';
      message: string;
      postTurnEnemyHP: number;
      postTurnUserHP: number;
      enemyAttack: AttackResult_T;
      userAttack: AttackResult_T;
    };

export interface userAttackTurnReturn_T {
  rewards: any;
  userAttack: AttackResult_T;
  postTurnUserHP: number;
  postTurnEnemyHP: number;
  userResult:TurnResult_T;
  enemyResult:(TurnResult_T | null);
  message:(string|null);
}

export interface InventoryItem_T {
  _id: string;
  name: string;
  description: string;
  damage: number;
  itemType: string;
  imageURL: string | null;
  healthAmount?: number;
}
export interface UserStats {
  strength: number;
  dexterity: number;
  intelligence: number;
  charisma: number;
  defense: number;
}

// interface LootItem {
//   itemId: string;
//   quantity: number;
//   _id: string;
// }

export interface Character_T {
  _id: string;
  species: string;
  class: string;
  maxHP: number;
  stats: {
    gold: number;
    weapon: string; // This is an ObjectId (string) referencing a weapon
  };
}

export interface UserProfile_T {
  _id: string;
  email: string;
  gamerTag: string;
  level: number;
  Currency: number;
  maxHP: number;
  currentHP: number;
  currentStats: UserStats;
  CurrentLoot: {
    itemId:InventoryItem_T,
    quantity: number;
    _id: string;
  }[];
  Character: Character_T;
  Bosses: string[];
  currentActiveBoss: string | null;
  createdAt: string;
  updatedAt: string;
  toLevelUpXP:number;
  currentXP:number;
}


export interface Encounter_T {
  message: string;
  user:{
    stats: {
      strength: number;
      dexterity: number;
      intelligence: number;
      charisma: number;
      defense: number;
    };
    maxHP: number;
    currentHP: number;
  }
  enemy: {
    stats: {
      strength: number;
      dexterity: number;
      intelligence: number;
      charisma: number;
      defense: number;
    };
    relationshipGoal: number;
    maxHP: number;
    name: string;
    currentHP:number;
  };
  currentTurn: 'User' | 'Enemy';
}

export interface QuestData_T {
    _id: {
      $oid: string;
    };
    name: string;
    species: string;
    class: string;
    maxHP: number;
    relationshipGoal: number;
    stats: {
      strength: number;
      dexterity: number;
      intelligence: number;
      charisma: number;
      defense: number;
    };
    reward: {
      gold: number;
      items: {
        itemId: {
          $oid: string;
        };
        quantity: number;
      }[];
      xp: number;
    };
    level: number;
    location: {
      sceneName: string;
      description: string;
      environmentTags: string[];
      latitude: number;
      longitude: number;
    };
    dialogues: {
      ifNotUnlocked: string;
      preFightMain: string[];
      bossFight: {
        success: string[];
        fail: string[];
      };
      userFight: {
        success: string[];
        fail: string[];
      };
      userTalk: {
        success: string[];
        fail: string[];
      };
      userHide: {
        success: string[];
        fail: string[];
      };
      death: string;
      relationshipGain: string;
      win: string;
    };
    enemyType: "boss" | "minion" | string; // extend as needed
}