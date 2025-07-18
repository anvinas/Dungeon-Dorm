import { useState } from "react";
import type { QuestData_T } from "../lib/types";
import { getBossFolderName } from "../lib/helper";
import styles from "./styles/PrefightModal.module.css"

const PrefightModal = ({questData,onClickExit,onClickFight}:{questData:QuestData_T | null;onClickExit:()=>void;onClickFight:()=>void;})=>{

    if(questData ==null) return 
    return(
        <div className="w-full h-full bg-gray-800 rounded-lg flex-col flex gap-2 px-10 py-5">
            {/* HEADER Exit */}
            <div className="flex justify-between">
                <div></div>
                <div className="bg-red-500 text-white px-4 py-2 text-xl rounded hover:bg-red-600 hover:cursor-pointer" onClick={()=>onClickExit()}>Exit</div>
            </div>

            {/* main */}
            <div className="flex gap-4">
                <div className="flex items-center justify-center w-[30%]">
                    <img className={`${styles.bossImg} aspect-square w-full  object-cover object-top `} src={`/assets/boss/${getBossFolderName(questData.name)}/real.png`}/>   
                </div>

                {/* Dialog Container */}
                <div className="flex flex-col gap-4 justify-center bg-gray-900 p-5 rounded flex-1">
                    {questData.dialogues.preFightMain.map((dialogue,i)=>{
                        return(
                            <div key={`dialog_${i}`} className={`text-white font-bold`}>
                                <div>{dialogue}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center">
                <div className="bg-purple-600 text-white px-4 py-2 text-xl rounded hover:bg-purple-700 hover:cursor-pointer" onClick={()=>onClickFight()}>Fight Boss!</div>
            </div>
        </div>
        
    )
}
export default PrefightModal


