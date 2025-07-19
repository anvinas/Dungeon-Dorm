import { useState, useEffect ,useRef} from "react";
import axios from "axios";
import type {Encounter_T,userAttackTurnReturn_T} from "../lib/types";
import FightFooter from "../components/FightFooter";
import GetServerPath from "../lib/GetServerPath.ts"
import { Navigate, useNavigate } from 'react-router-dom';
import {storeJWT,fetchJWT} from "../lib/JWT.ts"
import { getBossFolderName } from '../lib/helper';
import InventorySystem from "../components/InventorySystem.tsx"
import styles from "./styles/BossFightPage.module.css"
function BossFightPage() {
  const navigate = useNavigate();
  const hasStartedRef = useRef(false);

  // const [questData, setQuestData] = useState<QuestData_T | null>(foundQuestData);
  const [encounterData, setEncounterData] = useState<Encounter_T | null>(null);
  const [currentCharm, setCurrentCharm] = useState<number>(0);

  //ANIMATIONS
  const [userMoveData, setUserMoveData] = useState<null|any>(null);
  const [lastCharmValue, setLastCharmValue] = useState<null|number>(null);
  const [userAttackAnimating, setUserAttackAnimating] = useState(false);
  const [enemyAttackAnimating, setEnemyAttackAnimating] = useState(false);
  const [damageText, setDamageText] = useState("");

  const [modalStates, setModalStates] = useState<{
    inventory: Boolean;
    diedScreen:Boolean;
    wonScreen:Boolean;
    runScreen:Boolean;
    charmedScreen:Boolean;
    currentMoveScreen:Boolean;
    AnimatedCharmScreen:Boolean
  }>({
    inventory: false,
    diedScreen:false,
    runScreen:false,
    charmedScreen:false,
    currentMoveScreen:false,
    AnimatedCharmScreen:false,
    wonScreen:false
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
        storeJWT(response.data.token)
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
        handleAnimationsAfterAttack(response.data)
      } catch (error) {
        console.error("Failed to Attack:", error);
      }
  };

  
  const handleAnimationsAfterAttack = (userAttackResponseData:userAttackTurnReturn_T)=>{
    let attackObjPlayer = userAttackResponseData.userResult.userAttack || userAttackResponseData.userAttack
    let bossResponse = userAttackResponseData.enemyResult

    let bossAnimationObg = {damage:"MISS",responded:false}
    if(bossResponse){
      bossAnimationObg.damage = (bossResponse.enemyAttack.hit?bossResponse.enemyAttack.damage:"MISS" ) as string
      bossAnimationObg.responded = true
    }

    let userDamageString = attackObjPlayer.hit ? String(attackObjPlayer.damage) : "MISS";

    handleAnimateDice(
      attackObjPlayer.d20,
      "Attack Roll!",
      ()=>handleAnimateUserAttackMovement(
        userDamageString,
        ()=>{
          if(bossAnimationObg.responded){
            handleAnimateBossAttackMovement(bossAnimationObg.damage,()=>updateUIAfterUserAttack(userAttackResponseData))
          }else{
            updateUIAfterUserAttack(userAttackResponseData)
          }
        }
      )
    )
  }

  const handleAnimateDice = (diceNum:any,diceText:any,callBack:()=>void)=>{
    // 🕒 Show the dice screen for 2 seconds
    setUserMoveData({ diceRoll20: diceNum, mainText: diceText });
    setModalStates((old) => ({ ...old, currentMoveScreen: true }));

    setTimeout(() => {
      // ⛔ Hide dice screen and continue
      setModalStates((old) => ({ ...old, currentMoveScreen: false }));
      setUserMoveData(null);

      // ✅ Now update movements and text
      callBack()
    }, 2000);
  }

  const handleAnimateUserAttackMovement = (damageText:string,callBack:()=>void)=>{
    setDamageText(damageText)
    setUserAttackAnimating(true);
    setTimeout(() => {
      setUserAttackAnimating(false);
      setDamageText("")
      callBack()
    }, 600);
  }

  const handleAnimateBossAttackMovement= (damageText:string,callBackUIUpdate:()=>void)=>{
    setDamageText(damageText)
    setEnemyAttackAnimating(true);
    setTimeout(() => {
      setEnemyAttackAnimating(false);
      setDamageText("")
      callBackUIUpdate()
    }, 600);
  }

  const updateUIAfterUserAttack = (userAttackResponseData:userAttackTurnReturn_T)=>{
    if(!encounterData) return;
    let newEncounerObj:Encounter_T = {
      message:userAttackResponseData.message || "Turn Complete",
      currentTurn:"User",
      enemy:{
        ...encounterData.enemy,
      },
      user:{
        ...encounterData.user
      }
    }

    // If defeated Enemy first
    if(userAttackResponseData.postTurnEnemyHP <= 0){
      newEncounerObj.user.currentHP = userAttackResponseData.postTurnUserHP
      setModalStates((old)=>{let tmp={...old};tmp.wonScreen=true;return {...tmp}})
      setEncounterData({...newEncounerObj})
      return
    }

    //If user attack data
    if(userAttackResponseData.userResult){
      newEncounerObj.user.currentHP = userAttackResponseData.userResult.postTurnUserHP
      newEncounerObj.enemy.currentHP = userAttackResponseData.userResult.postTurnEnemyHP
    }

    // If enemy didnt die and has attacked
    if(userAttackResponseData.enemyResult){
      newEncounerObj.user.currentHP = userAttackResponseData.enemyResult.postTurnUserHP
      newEncounerObj.enemy.currentHP = userAttackResponseData.enemyResult.postTurnEnemyHP
      
      // User Died!
      if(newEncounerObj.user.currentHP <= 0){
        setModalStates((old)=>{let tmp={...old};tmp.diedScreen=true;return {...tmp}})
      }
    }

    setEncounterData({...newEncounerObj})
  }


  const handleClickRun = async () => {
      try {
        const token = fetchJWT();
        const response = await axios.post(`${GetServerPath()}/api/fight/userTurn`, {
          action: "flee",
          item:null
        },
        { 
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        console.log("User Clicked Run:", response.data);
        handleAnimationsAfterRun(response.data)
        // updateUIAfterUserRun(response.data)
      } catch (error) {
        console.error("Failed to Attack:", error);
      }
  };

  
  const handleAnimationsAfterRun = (userRunResponseData:any)=>{
    if(userRunResponseData.success){
      handleAnimateDice(
        userRunResponseData.d20,
        "Run Roll!",
        ()=>updateUIAfterUserRun(userRunResponseData)
      )
    }else{
      // Enemy Hit Turn
      let bossResponse = userRunResponseData.enemyResult
      let dmg = (bossResponse.enemyAttack.hit?bossResponse.enemyAttack.damage:"MISS" ) as string

      handleAnimateDice(
        userRunResponseData.userResult.d20,
        "Run Roll!",
        ()=>handleAnimateBossAttackMovement(
          dmg,
          ()=>updateUIAfterUserRun(userRunResponseData)
        )
      )
    }
  }

  const updateUIAfterUserRun = (userRunResponseData:any)=>{
    console.log(userRunResponseData)

    // Success Ran
    if(userRunResponseData.success){
      setModalStates(old=>{let tmp={...old};tmp.runScreen=true;return {...tmp}})
    }

    if(!encounterData) return;
    let newEncounerObj:Encounter_T = {
      message:userRunResponseData.message || "Turn Complete",
      currentTurn:"User",
      enemy:{
        ...encounterData.enemy,
      },
      user:{
        ...encounterData.user
      }
    }

    //Fail ran
    // If enemy didnt die and has attacked
    if(userRunResponseData.enemyResult){
      newEncounerObj.user.currentHP = userRunResponseData.enemyResult.postTurnUserHP
      newEncounerObj.enemy.currentHP = userRunResponseData.enemyResult.postTurnEnemyHP

      //Died?
      if(newEncounerObj.user.currentHP <= 0){
        setModalStates((old)=>{let tmp={...old};tmp.diedScreen=true;return {...tmp}})
      }
    }

    setEncounterData({...newEncounerObj})
  }

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
        // updateUIAfterUserTalk(response.data)
        handleAnimationsAfterTalk(response.data)
      } catch (error) {
        console.error("Failed to Talk:", error);
      }
  };

  const handleActivateCharmAnimation = (value:number,callBack:()=>void)=>{
    // 🕒 Show the dice screen for 2 seconds
    setLastCharmValue(()=>value);
    setModalStates((old) => ({ ...old, AnimatedCharmScreen: true }));
    console.log("ACTIVATED")
    setTimeout(() => {
      // ⛔ Hide dice screen and continue
      setModalStates((old) => ({ ...old, AnimatedCharmScreen: false }));
      setLastCharmValue(null);

      // ✅ Now update movements and text
      callBack()
    }, 2000);
  }

  const handleAnimationsAfterTalk = (userTalkResponseData:any)=>{
    console.log(userTalkResponseData)
    let userTalk = userTalkResponseData.userTalk || userTalkResponseData.userResult.userTalk

    // Enemy Hit Turn
    let bossResponse = userTalkResponseData.enemyResult || null
    console.log(bossResponse)
    let dmg = bossResponse ? (bossResponse.enemyAttack.hit?bossResponse.enemyAttack.damage:"MISS" ) as string : ""
    console.log(userTalkResponseData)
    handleAnimateDice(
        userTalk.d20,
        "Charm Roll!",
        ()=>{
          if(userTalk.success){
            handleActivateCharmAnimation(
              userTalk.friendshipContribution,
              ()=>{
                if(bossResponse){
                  handleAnimateBossAttackMovement(dmg,()=>{
                    updateUIAfterUserTalk(userTalkResponseData)
                  })
                }else{
                  updateUIAfterUserTalk(userTalkResponseData)
                }
              }
            )
          }else{
            if(bossResponse){
                handleAnimateBossAttackMovement(dmg,()=>{
                updateUIAfterUserTalk(userTalkResponseData)
              })
            }else{
              updateUIAfterUserTalk(userTalkResponseData)
            }
          }
        }
    )
    return
  }

  const updateUIAfterUserTalk = (userTalkResponseData:any)=>{
    if(!encounterData) return;
    let newEncounerObj:Encounter_T = {
      message:userTalkResponseData.message || "Turn Complete",
      currentTurn:"User",
      enemy:{
        ...encounterData.enemy,
      },
      user:{
        ...encounterData.user
      }
    }

    console.log("IN UI OF CHARM")
    console.log(userTalkResponseData)
    //If charmed succefully
    if(userTalkResponseData.message == "Enemy charmed successfully!"){
      setCurrentCharm(encounterData.enemy.relationshipGoal)
      setModalStates((old)=>{let tmp={...old};tmp.charmedScreen=true;return {...tmp}})
      setEncounterData({...newEncounerObj})
    }

    //Check Post relationship
    if(userTalkResponseData.userResult){
      newEncounerObj.user.currentHP = userTalkResponseData.userResult.postTurnUserHP
      newEncounerObj.enemy.currentHP = userTalkResponseData.userResult.postTurnEnemyHP
      setCurrentCharm(userTalkResponseData.userResult.postTurnFriendship)
    }

    // If enemy didnt die and has attacked
    if(userTalkResponseData.enemyResult){
      newEncounerObj.user.currentHP = userTalkResponseData.enemyResult.postTurnUserHP
      newEncounerObj.enemy.currentHP = userTalkResponseData.enemyResult.postTurnEnemyHP
      
      // User Died!
      if(newEncounerObj.user.currentHP <= 0){
        setModalStates((old)=>{let tmp={...old};tmp.diedScreen=true;return {...tmp}})
      }
    }

    setEncounterData({...newEncounerObj})
  }
  
  if(encounterData==null) return (<div>Loading</div>)
  
  const enemyHealthPercentage = (encounterData.enemy.currentHP / encounterData.enemy.maxHP )*100;
  const enemyCharmPercentage = (currentCharm / encounterData.enemy.relationshipGoal )*100;

  return (
    <div className={`${styles.container} relative w-screen h-screen overflow-hidden bg-gray-900`}>

      {/* MODALS */}
      {/* Inventory modal*/}
      {modalStates.inventory &&   
        <div className='absolute w-full h-[65%] left-[0%] bottom-[00%] translate-[0%] z-100'>
          <InventorySystem 
            onHealthChange={(newHealth)=>{let tmp={...encounterData};tmp.user.currentHP=newHealth;setEncounterData({...tmp})}} 
            onClose={()=>setModalStates((old)=>{let temp ={...old}; temp.inventory=false;return temp;})} 
          />
        </div>
      }

      {/* Died modal*/}
      {modalStates.diedScreen &&   
        <div className='absolute w-screen h-screen left-[0%] top-[0%] translate-[0%] z-101'>
          <DeathScreenModal onClickRespawn={()=>navigate("/play")}/>
        </div>
      }

      {/* Run modal*/}
      {modalStates.runScreen &&   
        <div className='absolute w-screen h-screen left-[0%] top-[0%] translate-[0%] z-101'>
          <RunScreenModal onClickLeave={()=>navigate("/play")}/>
        </div>
      }

      {/* Charmed modal*/}
      {modalStates.charmedScreen &&   
        <div className='absolute w-screen h-screen left-[0%] top-[0%] translate-[0%] z-101'>
          <CharmedcreenModal onClickLeave={()=>navigate("/play")}/>
        </div>
      }

      {/* Moves modal*/}
      {modalStates.currentMoveScreen && userMoveData &&
        <div className='absolute w-screen h-screen left-[0%] top-[0%] translate-[0%] z-101'>
          <CurrentMoveScreen diceRoll20={userMoveData.diceRoll20} mainText={userMoveData.mainText}/>
        </div>
      }

      {/* ANIMATED CHARM modal*/}
      {modalStates.AnimatedCharmScreen && lastCharmValue &&
        <div className='absolute w-screen h-screen left-[0%] top-[0%] translate-[0%] z-101'>
          <CharmedActivatedScreen value={lastCharmValue} />
        </div>
      }

      {/* Dark overlay */}
      <div className={`${styles.overlayDark} absolute inset-0  bg-opacity-50 z-10`} />

      {/* Foreground content */}
      <div className="relative z-20 w-full h-full">

        {/* Player Character */}
        <div className={`${styles.playerImageContainer} absolute bottom-[20%] left-20 flex justify-start z-3 w-[20%]`}>
          <div className={`w-fit relative ${userAttackAnimating ? `${styles.lungeAnimation}` : ""}`}>
            {damageText &&userAttackAnimating&& <div className="absolute top-[0%] left-[50%] translate-x-[-50%] translate-y-[-50%] font-bold text-purple-800 text-4xl">{damageText}</div>}
            <img src={`/assets/playableCharacter/warlock/pixel.png`} className="" alt="player"/>
          </div>
        </div>

        {/* Boss Character Container */}
        <div className={`${styles.bossImageContainer} absolute bottom-[25%] right-[5%] flex  justify-end z-3`}>
          <div className="flex flex-col items-center w-[50%]">
            {/* Boss Healthh Text */}
            <div style={{WebkitTextStroke: '2px black',}} className="pb-5 text-white font-bold text-4xl">{encounterData.enemy.currentHP}/{encounterData.enemy.maxHP} HP</div>

            {/* Boss Health BAR*/}
            <div className={`relative w-[100%] h-5 border-2 bg-[#697284e3] border-blue-800 rounded-lg`}>
              <div 
                className={`absolute h-full  bg-green-400 rounded-sm ${enemyHealthPercentage > 80 ? "bg-green-400" : enemyHealthPercentage>40?"bg-orange-400":"bg-red-400"}`} 
                style={{ width: `${enemyHealthPercentage}%` }}>
              </div>
            </div>
            
            <div className={`w-fit relative ${enemyAttackAnimating ? `${styles.lungeAnimationLeft}` : ""}`}>
              {damageText && enemyAttackAnimating && <div className="absolute top-[0%] left-[50%] translate-x-[-50%] translate-y-[-50%] font-bold text-red-800 text-4xl">{damageText}</div>}
              <img src={`/assets/boss/${getBossFolderName(encounterData.enemy.name)}/pixel.png`} className="scale-x-[-1] " alt="boss"/>
            </div>
            
            {/* Boss Charm BAR*/}
            <div className="flex flex-col gap-1 w-full items-center justify-center">
                <div className="flex justify-center items-center w-full">
                  <img src="/assets/heart.png" className="h-10"/>
                  <div className={`relative w-[50%] h-5 border-2 bg-[#697284e3] border-blue-800 rounded-lg`}>
                    <div 
                      className={`absolute h-full  bg-[#c0392b] rounded-sm`} 
                      style={{ width: `${enemyCharmPercentage}%` }}>
                    </div>
                  </div>
                </div>
                <div className="pb-5 text-black text-center font-bold text-xl">{currentCharm}/{encounterData.enemy.relationshipGoal}</div>
            </div>
            
            

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
            OnClickRun = {()=>handleClickRun()}

            userData = {encounterData.user}
          />
        </div>
      </div>
      
    </div>
  );
}

export default BossFightPage;

const DeathScreenModal = ({onClickRespawn}:{onClickRespawn:()=>void})=>{
  return(
  <div className="w-full h-full bg-[#000000db] flex items-center flex-col justify-center gap-3">
    <div className="text-red-700 font-bold text-8xl">YOU DIED!</div>
    <div className="text-white font-bold text-xl">You were defeated, losing 10 gold</div>
    <div className="text-white font-bold text-xl bg-purple-800 p-2 rounded-lg hover:bg-purple-700 cursor-pointer" onClick={()=>onClickRespawn()}>Respawn</div>
  </div>
)
}

const RunScreenModal = ({onClickLeave}:{onClickLeave:()=>void})=>{
  return(
  <div className="w-full h-full bg-[#000000db] flex items-center flex-col justify-center gap-3">
    <div className="text-green-700 font-bold text-7xl">Succesfully Fled!</div>
    <div className="text-white font-bold text-xl">Whew that was close!</div>
    <div className="text-white font-bold text-xl bg-purple-800 p-2 rounded-lg hover:bg-purple-700 cursor-pointer" onClick={()=>onClickLeave()}>Leave Area</div>
  </div>
)
}

const CharmedcreenModal = ({onClickLeave}:{onClickLeave:()=>void})=>{
  return(
  <div className="w-full h-full bg-[#000000db] flex items-center flex-col justify-center gap-3">
    <div className="text-green-700 font-bold text-7xl">Succesfully Charmed!</div>
    <div className="text-white font-bold text-xl">Im surprised you talked yourself out of that!</div>
    <div className="text-white font-bold text-xl bg-purple-800 p-2 rounded-lg hover:bg-purple-700 cursor-pointer" onClick={()=>onClickLeave()}>Leave Area</div>
  </div>
)
}


const CurrentMoveScreen = ({
  diceRoll20,
  mainText
}:{
  diceRoll20:number,
  mainText:string
})=>{
  return(
  <div className="w-full h-full bg-[#00000096] flex items-center flex-col justify-center">
    <div className="font-bold text-white text-5xl" >{mainText}</div>
    
    {/* SHOW DICE */}
    <div className="w-[30vw] relative">
      <img src={"/assets/20dice.png"} className=""/>
      <div className="text-white absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex justify-center items-center">
        <div className="font-bold text-7xl" style={{WebkitTextStroke: '2px black',}} >{diceRoll20}</div>
      </div>
    </div>


  </div>
)
}


const CharmedActivatedScreen = ({
  value
}:{
  value:number,
})=>{
  return(
  <div className="w-full h-full bg-[#00000096] flex items-center flex-col justify-center">
    <div className="font-bold text-red-500 text-5xl" >CHARMED + {value}</div>
    
    {/* SHOW Heart */}
    <div className="w-[40vw] relative flex items-center justify-center">
      <img src={"/assets/heart.png"} className={`${styles.beatingHeart}`}/>
    </div>


  </div>
)
}