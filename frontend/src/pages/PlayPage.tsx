import * as React from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import { Source, Layer } from 'react-map-gl/maplibre';
import type { LayerProps } from 'react-map-gl/maplibre';
import type { FeatureCollection, Feature, Point } from 'geojson';

import 'maplibre-gl/dist/maplibre-gl.css';

import InventorySystem from "../components/InventorySystem.tsx"
import GameFooter from "../components/GameFooter.tsx"
import QuestIcon from "../components/QuestIcon.tsx"
import PrefightModal from '../components/PrefightModal.tsx';
import { useNavigate } from 'react-router-dom';

import type { QuestData_T } from '../lib/types.ts';


function App() {
  const navigate = useNavigate();
  const [currentQuestData, setCurrentQuestData] = React.useState<null | QuestData_T>(null);
  // Modals
  const [modalStates, setModalStates] = React.useState<{inventory: Boolean;preFight:Boolean}>({
    inventory:false,
    preFight:false
  });

  const [userLocation, setUserLocation] = React.useState<{longitude: number; latitude: number} | null>(null);
  const [viewState, setViewState] = React.useState({
    longitude: -81.2005,
    latitude: 28.6016,
    zoom: 17,
    pitch: 50,
    bearing: -30
  });

  // Pulse factor state (declare BEFORE useEffect)
  const [pulse, setPulse] = React.useState(1);

  // Geolocation effect (only once)
  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // const { longitude, latitude } = position.coords;
        console.log("Actula Pos",position)
        const { longitude, latitude } = { longitude: -81.2005, latitude: 28.6016 };
        setUserLocation({ longitude, latitude });
        setViewState((prev) => ({ ...prev, longitude, latitude }));
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }, []);

  // Pulse animation effect (separate)
  React.useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Pulse between 0.8 and 1.2 every 2 seconds
      const pulseFactor = 1 + 0.05 * Math.sin((elapsed / 2000) * 2 * Math.PI);
      setPulse(pulseFactor);

      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- HOTZONES ---
  const radiusMeters = 300;

  const radiusPixels = React.useMemo(() => {
    return metersToPixelsAtLatitude(radiusMeters, viewState.latitude, viewState.zoom) * pulse;
  }, [viewState.latitude, viewState.zoom, pulse]);
  
  const hotzoneLayer: LayerProps = React.useMemo(() => ({
    id: 'hotzones',
    type: 'circle',
    source: 'hotzones',
    paint: {
      'circle-radius': radiusPixels,
      'circle-color': [
        'match',
        ['get', 'difficulty'],
        1, '#E07B7B',
        2, '#9B59B6',
        3, '#F39C12',
        '#000000',
      ],
      'circle-opacity': 0.5,
    },
  }), [radiusPixels]);


  // FIGHTING MODAL FUNCTIONS
  const handleClickQuest = (questData:QuestData_T)=>{
    //If not in zone return
    //If not ready to fight this battle return
    //If good
    setCurrentQuestData(questData)
    setModalStates(old => ({ ...old, preFight: true }));
  }



  return (
    <div className='w-full h-full'>

      {/* MAP ITEMS */}
      <div style={{ width: '100%', height: '100vh' }}>
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=6tt8Z9sB8XXEvl0jd1gY"
          style={{ width: '100%', height: '100%' }}
          
        >
          {userLocation && (
              <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
                <img
                  src="/assets/playableCharacter/warlock/back.png"
                  alt="Character"
                  style={{
                    height: `${viewState.zoom * 6}px`, // You can tweak multiplier (e.g. 6) to suit your style
                    transform: 'translate(25%, -40%)',
                    transition: 'height 0.2s ease', // smooth resizing
                  }}
                />
            </Marker>
          )}

          {/* QUEST ICONS */}
          {QUESTZONE.map((questData,i)=>{
            return(
              <Marker key={`quest_${i}`} longitude={questData.location.longitude} latitude={questData.location.latitude}>
                <QuestIcon zoom={viewState.zoom} questData={questData} onClick={()=>handleClickQuest(questData)} />
              </Marker>
            )
          })}
          
          {/* HOTZONE CIRCLES */}
          <Source id="hotzones" type="geojson" data={hotzoneGeoJSON}>
            <Layer {...hotzoneLayer} />
          </Source>

        </Map>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full z-3">
          <GameFooter OnClickInventory={()=>setModalStates((old)=>{old.inventory=true;return old;})} />
      </div>

      {/* Inventory modal*/}
      {!modalStates.preFight && modalStates.inventory &&   
        <div className='absolute w-full h-[65%] left-[0%] bottom-[00%] translate-[0%] z-5'>
          <InventorySystem onClose={()=>setModalStates((old)=>{old.inventory=false;return old;})} />
        </div>
      }

      {/* PreFight modal*/}
      {modalStates.preFight && currentQuestData &&   
        <div className='absolute w-[60%] left-[50%] top-[50%] translate-[-50%] z-5'>
          <PrefightModal questData={currentQuestData} onClickFight={()=>{navigate(`/bossfight?_id=${currentQuestData._id.$oid}`)}} onClickExit={()=>{setModalStates(old => ({ ...old, preFight: false }))}}/>
        </div>
      }
    </div>
    
  );
}

export default App;



const HOTZONES = [
  {difficulty:1,longitude: -81.2005,latitude: 28.6016},
  {difficulty:2,longitude: -81.1960 ,latitude: 28.6016},
  {difficulty:3,longitude: -81.1970,latitude: 28.6080}
]

const hotzoneGeoJSON: FeatureCollection<Point> = {
  type: "FeatureCollection",
  features: HOTZONES.map((zone): Feature<Point> => ({
    type: "Feature",
    properties: { difficulty: zone.difficulty },
    geometry: {
      type: "Point",
      coordinates: [zone.longitude, zone.latitude],
    },
  })),
};

function metersToPixelsAtLatitude(meters: number, latitude: number, zoom: number) {
  const earthCircumference = 40075017; // meters
  const latitudeRadians = (latitude * Math.PI) / 180;
  const metersPerPixel = earthCircumference * Math.cos(latitudeRadians) / Math.pow(2, zoom + 8);
  return meters / metersPerPixel;
}


const QUESTZONE = [{
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
},
{
  "_id": {
    "$oid": "685d5cb386585be7727d0620"
  },
  "name": "Queen Andrea of the Pixies",
  "species": "Fairy",
  "class": "Bard",
  "maxHP": 272,
  "relationshipGoal": 80,
  "stats": {
    "strength": 0,
    "dexterity": 8,
    "intelligence": 8,
    "charisma": 10,
    "defense": 5
  },
  "reward": {
    "gold": 50,
    "items": [
      {
        "itemId": {
          "$oid": "686fd102e72e348229aee578"
        },
        "quantity": 1
      }
    ],
    "xp": 2200
  },
  "level": 9,
  "location": {
    "sceneName": "Wooden Bridge (Night)",
    "description": "A rickety bridge spanning a murky chasm. The wood creaks with every step. It feels especially eerie at nighttime.",
    "environmentTags": [
      "outdoor",
      "dangerous",
      "nature",
      "nighttime"
    ],
    "latitude": 28.602777,
    "longitude": -81.199921
  },
  "dialogues": {
    "ifNotUnlocked": "Who let this dude in? This is literally a palace. How did they get in here?",
    "preFightMain": [
      "Hey girlypop! What brings you into my beautiful kingdom?",
      "Omg, you killed that blob thing? Slayyyyy.",
      "Not to be like super mega rude or anything, but like I have royal things to do…",
      "Why are you here?",
      "You want fairy dust? Too bad, you’re like not a fairy.”"
    ],
    "bossFight": {
      "success": [
        "Haha, you suck",
        "You’re wasting my time.",
        "You do know I am the Queen for a reason?"
      ],
      "fail": [
        "No fair, you’re cheating.",
        "Where are my guards?",
        "This is treason or something."
      ]
    },
    "userFight": {
      "success": [
        "OOOWWWW",
        "I’m totally going to be late to the council meeting.",
        "Fairy Dust won't even work for you!"
      ],
      "fail": [
        "Dude, are you even trying?",
        "Who taught you how to fight?",
        "yawn"
      ]
    },
    "userTalk": {
      "success": [
        "Well, if you need it for a quest…",
        "Little dust couldn't hurt.",
        "You don’t seem like you would abuse it."
      ],
      "fail": [
        "No, I don't care about your quest.",
        "Fairy Dust doesn’t work for non-fairies.",
        "I’m literally like a Queen, why wouldIi listen to you?"
      ]
    },
    "userHide": {
      "success": [
        "Did you leave?",
        "If you want to quit, you can.",
        "Please tell me they left."
      ],
      "fail": [
        "I can literally still see you.",
        "Now's not the time for hide and seek",
        "Are you supposed to be hiding?"
      ]
    },
    "death": "Fine, take some fairy dust. But please leave some for my people. We can’t survive without it. *dies*",
    "relationshipGain": "Well, if you only want a little, it shouldn't impact the rest of the fairies.",
    "win": "Sorry, Pookie, but my fairies need the fairy dust, and it's no use to you."
  },
  "enemyType": "boss"
},
{
  "_id": {
    "$oid": "685d5cb386585be7727d0624"
  },
  "name": "Adrian the Prophet",
  "species": "Plasmoid",
  "class": "Cleric",
  "maxHP": 145,
  "relationshipGoal": 10,
  "stats": {
    "strength": 1,
    "dexterity": 5,
    "intelligence": 1,
    "charisma": 0,
    "defense": 0
  },
  "reward": {
    "gold": 10,
    "items": [
      {
        "itemId": {
          "$oid": "686fc288b782c6a3d9520562"
        },
        "quantity": 1
      }
    ],
    "xp": 1000
  },
  "level": 2,
  "location": {
    "sceneName": "Bathroom",
    "description": "A surprisingly clean bathroom. A faint smell of magic hangs in the air.",
    "environmentTags": [
      "indoor",
      "magical"
    ],
    "latitude": 28.60141,
    "longitude": -81.199118
  },
  "dialogues": {
    "ifNotUnlocked": "Greetings, traveler. It seems you don't know how this world works yet. We should talk when you do.",
    "preFightMain": [
      "Greetings, traveler. I am the Prophet Adrain, voice of the Great and Powerful Blob Lord.",
      "Have you come to talk about joining my faithful following in devoting our lives to the blobness?",
      "Oh, you just want my magical amulet? Erm, no, it's mine."
    ],
    "bossFight": {
      "success": [
        "Hey, what are you doing? Globs aren’t supposed to win.",
        "My three year old little glob brother takes punches better",
        "Maybe I should be the main character ?? you kinda suck"
      ],
      "fail": [
        "Wait hold on lemme do my turn again",
        "My three year old little glob brother punches better than I do",
        "My bad! Nah nah i wasn’t trying to punch you!"
      ]
    },
    "userFight": {
      "success": [
        "I always lose",
        "Yeah, I deserve that",
        "Blobs are easy to hurt"
      ],
      "fail": [
        "Wow, I didnt get hurt",
        "Are you new here?",
        "The Blob Lord has saved me yet again. Pls join me and you too can be saved."
      ]
    },
    "userTalk": {
      "success": [
        "You’re right, The Great Blobness would want me to share.",
        "You probably deserve the Amulet more than me.",
        "The amulet would be more useful to you"
      ],
      "fail": [
        "But I need the amulet to lead my followers to The Blob End.",
        "Please, the amulet is all I have",
        "The Great Blob gave me this amulet."
      ]
    },
    "userHide": {
      "success": [
        "I kinda miss them they were kinda chill",
        "Dang, I thought we were having fun",
        "Noooo, another person run away from me"
      ],
      "fail": [
        "This glob can still see you know",
        "Please dont go",
        "The Blob Lord wouldnt hide from you"
      ]
    },
    "death": "Not many can defeat a glob. I remember one time, my great grandfather managed to defeat another glob. Let me tell you the story…*explodes*",
    "relationshipGain": "I never thought about it, but why would you kill a glob? We’re innocent and don’t do anything. We can be friends.",
    "win": "Sorry, traveler. I am not sure how I defeated you, I’ve never done that before."
  },
  "enemyType": "boss"
},
{
  "_id": {
    "$oid": "685d5cb386585be7727d061f"
  },
  "name": "Evil Narrator",
  "species": "Human",
  "class": "Wizard",
  "maxHP": 430,
  "relationshipGoal": 100,
  "stats": {
    "strength": 10,
    "dexterity": 10,
    "intelligence": 10,
    "charisma": 10,
    "defense": 10
  },
  "reward": {
    "gold": 1000,
    "items": [],
    "xp": 2200
  },
  "level": 10,
  "location": {
    "sceneName": "Classroom",
    "description": "Desks and chairs are neatly arranged, awaiting students. A chalkboard lists obscure equations.",
    "environmentTags": [
      "indoor",
      "learning",
      "quiet"
    ],
    "latitude": 28.6016,
    "longitude": -81.2
  },
  "dialogues": {
    "ifNotUnlocked": "You haven't collected everything I need. Come back when you are actually ready.",
    "preFightMain": [
      "Finally! Took you long enough to get everything.",
      "I should have known a simple barista would take their sweet time even if they think the world is at stake.",
      "Well, joke's on you, the world was perfectly fine, just filled with losers and blobs.",
      "But now that I have these magical items, I am going to cleanse the world of trash.",
      "That's right. IM EVIL PROFESSOR LEINECKER!!!!!!"
    ],
    "bossFight": {
      "success": [
        "Consider yourself... deprecated.",
        "I refactor enemies like I refactor code, with no mercy.",
        "You’re just an error I need to debug"
      ],
      "fail": [
        "The Demo gods are against me",
        "Guess my attack’s still in beta",
        "My attack’s just buffering"
      ]
    },
    "userFight": {
      "success": [
        "How could a barista hurt me?",
        "Oof. That almost made me reboot.",
        "Ugh. You’re causing memory leaks and headaches."
      ],
      "fail": [
        "The demo gods are with me",
        "That looked like a segmentation fault.",
        "Oops. Did I crash you?"
      ]
    },
    "userTalk": {
      "success": [
        "I guess it is rude to destroy the world",
        "I do need baristas for my coffee.",
        "Maybe being a psych major isn't a waste of time.."
      ],
      "fail": [
        "I don’t care what a barista thinks.",
        "Are you gonna use psychology to stop me?",
        "If I wanted peace, I wouldn't be running this program."
      ]
    },
    "userHide": {
      "success": [
        "Are you procrastinating this fight?",
        "Hide all you want, I eventually find the bugs.",
        "Go ahead. Compile your courage while I pretend to look."
      ],
      "fail": [
        "Did Psych 101 teach you that?",
        "Ouch. That hurt... my respect for you.",
        "Run all you want. I’ve already cached your location"
      ]
    },
    "death": "But how? You’re just a simple barista… Or am I the barista? *Gets transformed into starbags employee*",
    "relationshipGain": "Fine, I won’t destroy the world just because of some losers.",
    "win": "I executed my final function: your defeat.” *Destroys the world*."
  },
  "enemyType": "boss"
},
{
  "_id": {
    "$oid": "685d5cb386585be7727d0622"
  },
  "name": "Just Dave",
  "species": "Dragonborn",
  "class": "Fighter",
  "maxHP": 234,
  "relationshipGoal": 40,
  "stats": {
    "strength": 6,
    "dexterity": 2,
    "intelligence": 1,
    "charisma": 1,
    "defense": 6
  },
  "reward": {
    "gold": 40,
    "items": [
      {
        "itemId": {
          "$oid": "686fcd2ee72e348229aee570"
        },
        "quantity": 1
      }
    ],
    "xp": 1750
  },
  "level": 6,
  "location": {
    "sceneName": "Library",
    "description": "Rows upon rows of ancient texts and arcane scrolls. Dust motes dance in the sunlight.",
    "environmentTags": [
      "indoor",
      "knowledge",
      "quiet"
    ],
    "latitude": 28.600852,
    "longitude": -81.20102
  },
  "dialogues": {
    "ifNotUnlocked": "Scary Dragon noises. Maybe you(user) should come back later",
    "preFightMain": [
      "Good Marrow! Welcome to my collection of trinkets.",
      "You’re the killer of the blob pest? Huzzah! I hope this world will one day be free of the blob infestation.",
      "I know my dragon-like appearance might be frightening, but no fear.",
      "I am merely a knowledge collector who also happens to be well-trained in murder.",
      "The Sword of Destruction? I protect it here along with other historical pieces. You may not have it."
    ],
    "bossFight": {
      "success": [
        "No one may take from my collection.",
        "This library is a place of peace.",
        "I have lived and fought for a millennium, you will not defeat me."
      ],
      "fail": [
        "Well done",
        "Perhaps I am out of practice.",
        "You are stubborn."
      ]
    },
    "userFight": {
      "success": [
        "*Grrrr* (idk dragon noise)",
        "It seems you are also well-trained",
        "Is fighting necessary?"
      ],
      "fail": [
        "You are weak",
        "Fighting is pointless",
        "*Sign*"
      ]
    },
    "userTalk": {
      "success": [
        "Perhaps if you intend to return it…",
        "You seem like a good person…",
        "I do want to share my knowledge"
      ],
      "fail": [
        "The sword must stay here",
        "You do not understand the danger the sword brings",
        "No."
      ]
    },
    "userHide": {
      "success": [
        "You are merely stalling",
        "You cannot hide forever",
        "Hiding will only work for so long."
      ],
      "fail": [
        "Cowardly, aren't you?",
        "You are still visible",
        "Hiding will not save you"
      ]
    },
    "death": "I merely wanted to collect and share my knowledge. The Sword of Destruction will only bring chaos. Killing me is only the beginning…..",
    "relationshipGain": "You are quite convincing. Perhaps you can handle the sword of destruction.",
    "win": "As I said before. I am well-trained."
  },
  "enemyType": "boss"
},
{
  "_id": {
    "$oid": "685d5cb386585be7727d0623"
  },
  "name": "Shaq of the Forest",
  "species": "Elf (w/dreads)",
  "class": "Ranger",
  "maxHP": 178,
  "relationshipGoal": 20,
  "stats": {
    "strength": 2,
    "dexterity": 4,
    "intelligence": 2,
    "charisma": 4,
    "defense": 2
  },
  "reward": {
    "gold": 0,
    "items": [
      {
        "itemId": {
          "$oid": "686fc8f3b782c6a3d9520574"
        },
        "quantity": 1
      }
    ],
    "xp": 1450
  },
  "level": 4,
  "location": {
    "sceneName": "Wooden Bridge",
    "description": "A rickety bridge spanning a murky chasm. The wood creaks with every step under the bright daytime sun.",
    "environmentTags": [
      "outdoor",
      "dangerous",
      "nature",
      "daytime"
    ],
    "latitude": 28.602371,
    "longitude": -81.199336
  },
  "dialogues": {
    "ifNotUnlocked": "Hey Stranger. This forest might to too dangerous for someone like you. Maybe come back when you're stronger.",
    "preFightMain": [
      "Hey Stranger. What brings you here?",
      "Oh, you killed Blobman? THANK GOD HE SUCKED!!!!!!!!!!!!!!!",
      "Well, as you go through this forest, be careful. And remember: Be Bear Aware, Follow Fire Safety Guidelines, and–",
      "My enchanted armor? I kind of need it."
    ],
    "bossFight": {
      "success": [
        "The forest is my terrain",
        "Hair flip",
        "Nature is on my side"
      ],
      "fail": [
        "You made me waste an arrow",
        "Nature is not on my side today",
        "Uhhh, the wind messed me up"
      ]
    },
    "userFight": {
      "success": [
        "This is not following forest safety protocols",
        "You’re not a very happy camper",
        "This is why I need the armor"
      ],
      "fail": [
        "Hahaha",
        "You clearly arent meant to be in this forest",
        "Thats what happens if you dont follow forest protocol"
      ]
    },
    "userTalk": {
      "success": [
        "Well, if you need the armor",
        "I could live without the extra protection",
        "You’re right, the armor is not very fashionable"
      ],
      "fail": [
        "Stop trying to take my things",
        "Get your own armor",
        "Whats mine is mine."
      ]
    },
    "userHide": {
      "success": [
        "Woah, whered you go",
        "Whered you learn to camouflage",
        "Hes gone….."
      ],
      "fail": [
        "I am a master of this forest, I see all",
        "Camouflage is not your strong suit",
        "You are bad at hiding"
      ]
    },
    "death": "You bested me. Fine, the forest will live without me. Just do not let my armor fall into the wrong hands…",
    "relationshipGain": "Well, if you really want the armor. I have a backup outfit anyway.",
    "win": "Hahaha, you cannot best me in my own domain. Next time, think about forest preservation before you start unnecessary danger."
  },
  "enemyType": "boss"
}]

