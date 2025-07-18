import { useState, useEffect ,useRef} from "react";
import axios from "axios";
import type {Encounter_T} from "../lib/types";
import FightFooter from "../components/FightFooter";
import GetServerPath from "../lib/GetServerPath.ts"
import { useNavigate } from 'react-router-dom';
import {storeJWT,fetchJWT} from "../lib/JWT.ts"
import { getBossFolderName } from '../lib/helper';
import styles from "./styles/BossFightPage.module.css"
function BossFightPage() {
  const navigate = useNavigate();
  const hasStartedRef = useRef(false);

  // const [questData, setQuestData] = useState<QuestData_T | null>(foundQuestData);
  const [encounterData, setEncounterData] = useState<Encounter_T | null>(null);

  const [modalStates, setModalStates] = useState<{
    inventory: Boolean;
    preFight: Boolean;
  }>({
    inventory: false,
    preFight: false,
  });

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startEncounter();
    }
  }, []);
  
  const startEncounter = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const bossId = urlParams.get("_id");

      if (!bossId) {
        console.error("Missing bossId _id in URL");
        navigate("/play")
        return;
      }
      
      try {
        const token = fetchJWT();
        const response = await axios.post(`${GetServerPath()}/api/fight/startEncounter`, {
          enemyId: bossId,
          enemyType:"boss"
        },
        { 
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        console.log("Encounter started:", response.data);
        setEncounterData(response.data)
      } catch (error) {
        console.error("Failed to start encounter:", error);
      }
  };

  const handleClickAttack = async () => {
      try {
        const token = fetchJWT();
        const response = await axios.post(`${GetServerPath()}/api/fight/userTurn`, {
          action: "attack",
          item:null
        },
        { 
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        console.log("User Attacked:", response.data);
      } catch (error) {
        console.error("Failed to Attack:", error);
      }
  };

  const handleClickTalk = async () => {
      try {
        const token = fetchJWT();
        const response = await axios.post(`${GetServerPath()}/api/fight/userTurn`, {
          action: "talk",
          item:null
        },
        { 
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        console.log("User Talked:", response.data);
      } catch (error) {
        console.error("Failed to Talk:", error);
      }
  };
  
  
  if(encounterData==null) return (<div>Loading</div>)
  
  const enemyHealthPercentage = (encounterData.enemy.currentHP / encounterData.enemy.maxHP )*100;

  return (
    <div className={`${styles.container} relative w-screen h-screen overflow-hidden bg-gray-900`}>
      {/* Dark overlay */}
      <div className={`${styles.overlayDark} absolute inset-0  bg-opacity-50 z-10`} />

      {/* Foreground content */}
      <div className="relative z-20 w-full h-full">

        {/* Player Character */}
        <div className={`${styles.playerImageContainer} absolute bottom-[20%] left-20 flex justify-start z-3`}>
          <img src={`/assets/playableCharacter/warlock/pixel.png`} className="w-[50%]" alt="player"/>
        </div>

        {/* Boss Character Container */}
        <div className={`${styles.bossImageContainer} absolute bottom-[30%] right-[5%] flex  justify-end z-3`}>
          <div className="flex flex-col items-center w-[60%]">
            {/* Boss Healthh Text */}
            <div style={{WebkitTextStroke: '2px black',}} className="pb-5 text-white font-bold text-4xl">{encounterData.enemy.currentHP}/{encounterData.enemy.maxHP} HP</div>

            {/* Boss Health BAR*/}
            <div className={`relative w-[100%] h-5 border-2 bg-[#697284e3] border-blue-800 rounded-lg`}>
              <div 
                className={`absolute h-full  bg-green-400 rounded-sm ${enemyHealthPercentage > 80 ? "bg-green-400" : enemyHealthPercentage>40?"bg-orange-400":"bg-red-400"}`} 
                style={{ width: `${enemyHealthPercentage}%` }}>
              </div>
            </div>
            {encounterData.enemy.name && <img src={`/assets/boss/${getBossFolderName(encounterData.enemy.name)}/pixel.png`} className="scale-x-[-1] " alt="player"/>}
          </div>
          
        </div>

        {/* Footer Container */}
        <div className="absolute bottom-0 left-0 w-full z-3">
          <FightFooter
            OnClickInventory={() =>
              setModalStates((old) => ({ ...old, inventory: true }))
            }
            OnClickAttack = {()=>handleClickAttack()}
            OnClickTalk = {()=>handleClickTalk()}
            userData = {encounterData.user}
          />
        </div>
      </div>
      
    </div>
  );
}

export default BossFightPage;


const foundQuestData = {
"_id": {
    "$oid": "685d5cb386585be7727d0621"
  },
  "name": "Gabriel the Hidden",
  "species": "Tielfing",
  "class": "Rogue",
  "maxHP": 256,
  "relationshipGoal": 60,
  "stats": {
    "strength": 8,
    "dexterity": 0,
    "intelligence": 2,
    "charisma": 2,
    "defense": 7
  },
  "reward": {
    "gold": 40,
    "items": [
      {
        "itemId": {
          "$oid": "686fd098e72e348229aee575"
        },
        "quantity": 1
      }
    ],
    "xp": 2050
  },
  "level": 8,
  "location": {
    "sceneName": "Engineering Building",
    "description": "Gears grind and steam hisses in this hub of innovation. Strange contraptions line the walls.",
    "environmentTags": [
      "indoor",
      "industrial",
      "noisy"
    ],
    "latitude": 28.601807,
    "longitude": -81.19874
  },
  "dialogues": {
    "ifNotUnlocked": "*flips hair and scoffs* Are you sure you’re in the right place? Come back when I'm not so busy.",
    "preFightMain": [
      "...",
      "You killed that BlobMan? I've been waiting for him to kick the bucket. Bro wouldn’t stop preaching.",
      "...",
      "So…. Do you listen to Radiohead? Wanna listen to Creep….",
      "Oh…You want my stone rune? I should have known you didn't care about RadioHead."
    ],
    "bossFight": {
      "success": [
        "Now, parry this, your filthy casual!",
        "I didn’t want this fight, but I sure will end it.",
        "Im beginning to enjoy this.",
        "Taste my blade."
      ],
      "fail": [
        "It's not like I cared about hitting you anyway.",
        "I should have done more training.",
        "I meant to do that."
      ]
    },
    "userFight": {
      "success": [
        "'Tis but a scratch.",
        "I think I felt that one.",
        "Why must you attack me?"
      ],
      "fail": [
        "You're going to need to try harder than that.",
        "How did you even defeat the other bosses? Excluding BlobMan of course…",
        "Is that all? Do you want a hug?༼ つ ◕_◕ ༽つ"
      ]
    },
    "userTalk": {
      "success": [
        "Well, I’m not a gatekeeper",
        "They do say sharing is caring",
        "Maybe you're not the worst person to have the magical stone"
      ],
      "fail": [
        "I'm not letting you out of this one.",
        "I'm enjoying this. I won't give it to you, but I'm enjoying this.",
        "You’re just a poser. No magic rock for you."
      ]
    },
    "userHide": {
      "success": [
        "Wow, that's fast. Where'd you go?",
        "Alright, I'll admit that was smooth.",
        "Hmm, vanished like a bad thought."
      ],
      "fail": [
        "I can still hear your breathing, poser.",
        "Hiding isn't your strong suit, I see.",
        "Did you really think that would work?"
      ]
    },
    "death": "So not cool. Take the magical stone, but beware of its sinister temptation. I used to be so happy before i had this stone, but now… im a creep. Im a weirdoooooo….",
    "relationshipGain": "So you’re not a poser. Good. I will allow you to be my friend and borrow my magical stone. Please be my friend.",
    "win": "You are weak and wouldn't be able to handle the stone. You can’t even handle good music."
  },
  "enemyType": "boss"
}