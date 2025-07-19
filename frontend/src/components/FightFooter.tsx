// import styles from "./styles/loginModal.module.css"
import AvatarHealth from "./AvatarHealth"
import styles from "./styles/GameFooter.module.css"
// import type {Encounter_T} from "../lib/types";
import { useMediaQuery } from 'react-responsive';

function FightFooter({
  OnClickAttack,
  OnClickTalk,
  OnClickInventory,
  OnClickRun,
  userData
}:{
  OnClickAttack:()=>void;
  OnClickInventory:()=>void;
  OnClickTalk:()=>void;
  OnClickRun:()=>void;
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
  const isMobile = useMediaQuery({ maxWidth: 768 });
  if(isMobile){
    return (
      <div className={`${styles.container} flex flex-col justify-between h-screen w-full text-white p-5`}>

    {/* 🔼 Top: Action Buttons */}
    <div className="flex justify-evenly gap-5 items-center w-full pb-10 md:pb-0">
      {/* Attack */}
      <div className="flex flex-col justify-center items-center">
        <div
          onClick={OnClickAttack}
          className="w-16 h-16 md:w-20 md:h-20 bg-gray-400 border-3 border-gray-500 rounded-full p-2 hover:cursor-pointer hover:bg-white hover:border-purple-800 hover:p-1"
        >
          <img src="/assets/fight.webp" className="w-full h-full object-cover" />
        </div>
        <div className="font-bold text-sm md:text-base">attack</div>
      </div>

      {/* Run */}
      <div className="flex flex-col justify-center items-center">
        <div
          onClick={OnClickRun}
          className="w-16 h-16 md:w-20 md:h-20 bg-gray-400 border-3 border-gray-500 rounded-full p-2 hover:cursor-pointer hover:bg-white hover:border-purple-800 hover:p-1"
        >
          <img src="/assets/run.png" className="w-full h-full object-cover" />
        </div>
        <div className="font-bold text-sm md:text-base">run</div>
      </div>

      {/* Talk */}
      <div className="flex flex-col justify-center items-center">
        <div
          onClick={OnClickTalk}
          className="w-16 h-16 md:w-20 md:h-20 bg-gray-400 border-3 border-gray-500 rounded-full p-2 hover:cursor-pointer hover:bg-white hover:border-purple-800 hover:p-1"
        >
          <img src="/assets/talk.png" className="w-full h-full object-cover" />
        </div>
        <div className="font-bold text-sm md:text-base">talk</div>
      </div>
    </div>

    {/* 🔽 Bottom: Health & Inventory */}
    <div className="flex justify-between items-center w-full mt-auto">
      <AvatarHealth userData={userData} />

      <div
        onClick={() => OnClickInventory()}
        className="p-3 bg-red-100 border-4 border-blue-500 rounded-full hover:bg-red-200 hover:cursor-pointer"
      >
        <img
          src="/assets/satchel.png"
          className="object-cover transform scale-x-[-1] bobAvatar h-16 md:h-20"
          alt="Satchel"
        />
      </div>
    </div>
  </div>
    )
  }

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
              <div onClick={()=>OnClickRun()} className="w-20 h-20 bg-gray-400 border-3 border-gray-500 rounded-[50%] p-2 hover:cursor-pointer hover:bg-white hover:border-purple-800 hover:p-1">
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
        <div onClick={()=>OnClickInventory()} className="p-5 bg-red-100 border-4 border-blue-500 rounded-[50%] hover:bg-red-200 hover:cursor-pointer">
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
