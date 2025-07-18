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

  const [modalStates, setModalStates] = useState<{
    inventory: Boolean;
    diedScreen:Boolean;
    runScreen:Boolean;
  }>({
    inventory: false,
    diedScreen:false,
    runScreen:false,
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
        updateUIAfterUserAttack(response.data)
      } catch (error) {
        console.error("Failed to Attack:", error);
      }
  };

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
        updateUIAfterUserRun(response.data)
      } catch (error) {
        console.error("Failed to Attack:", error);
      }
  };

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
        console.log("User Talked:", response.data);
      } catch (error) {
        console.error("Failed to Talk:", error);
      }
  };
  
  
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
            
            {/* Boss Charm BAR*/}
            <div className="flex justify-center items-center w-full">
              <img src="/assets/heart.png" className="h-10"/>
              <div className={`relative w-[50%] h-5 border-2 bg-[#697284e3] border-blue-800 rounded-lg`}>
                <div 
                  className={`absolute h-full  bg-[#c0392b] rounded-sm`} 
                  style={{ width: `${enemyCharmPercentage}%` }}>
                </div>
              </div>
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