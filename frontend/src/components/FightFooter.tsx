// import styles from "./styles/loginModal.module.css"
import AvatarHealth from "./AvatarHealth"
import styles from "./styles/GameFooter.module.css"
// import type {Encounter_T} from "../lib/types";

function FightFooter({
  OnClickAttack,
  OnClickTalk,
  OnClickInventory,
  userData
}:{
  OnClickAttack:()=>void;
  OnClickInventory:()=>void;
  OnClickTalk:()=>void;
  userData:{
    stats: {
      strength: number;
      dexterity: number;
      intelligence: number;
      charisma: number;
      defense: number;
    };
    maxHP: number;
    currentHP: number;
  };

}){
  
  return (
    <div className={`${styles.container} flex items-end relative w-full justify-between h-full shadow-lg p-15 text-white`}>
        <AvatarHealth userData={userData} />

        <div className="flex gap-5 items-center">

            {/* FIGHT BUTTON */}
            <div className="flex flex-col justify-center items-center">
              <div onClick={()=>OnClickAttack()} className="w-20 h-20 bg-gray-400 border-3 border-gray-500 rounded-[50%] p-2 hover:cursor-pointer hover:bg-white hover:border-purple-800 hover:p-1">
                <img src="/assets/fight.webp" className="w-full h-full object-cover"/>
              </div>
              <div className="font-bold">attack</div>
            </div>

            {/* RUN BUTTON */}
            <div className="flex flex-col justify-center items-center">
              <div  className="w-20 h-20 bg-gray-400 border-3 border-gray-500 rounded-[50%] p-2 hover:cursor-pointer hover:bg-white hover:border-purple-800 hover:p-1">
                <img src="/assets/run.png" className="w-full h-full object-cover"/>
              </div>
              <div className="font-bold">run</div>
            </div>

            {/* Talk Button */}
            <div className="flex flex-col justify-center items-center">
              <div onClick={()=>OnClickTalk()} className="w-20 h-20 bg-gray-400 border-3 border-gray-500 rounded-[50%] p-2 hover:cursor-pointer hover:bg-white hover:border-purple-800 hover:p-1">
                <img src="/assets/talk.png" className="w-full h-full object-cover"/>
              </div>
              <div className="font-bold">talk</div>
            </div>
        </div>

        {/* Inventory button */}
        <div onClick={()=>OnClickInventory()} className="p-5 bg-red-100 border-4 border-blue-500 rounded-[50%]">
            <img
              src="/assets/satchel.png"
              className=" object-cover transform scale-x-[-1] bobAvatar h-20"
              alt="Satchel"
            />
        </div>
    </div>
    
  )
}

export default FightFooter
