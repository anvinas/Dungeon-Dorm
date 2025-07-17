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