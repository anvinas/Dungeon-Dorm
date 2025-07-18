import React, { useState } from 'react';
import styles from "./styles/QuestIcon.module.css"
import type { QuestData_T } from '../lib/types';
import { getBossFolderName } from '../lib/helper';

const QuestIcon :React.FC<QuestIconProps>= ({ zoom, questData,onClick })=>{

    if(zoom<15) return (<div></div>)
    return(
        <div onClick={()=>onClick()} className={`${styles.container} w-20 h-20 border-black border-1 bg-orange-600 opacity-[1] translate-y-[-50%] rounded-[50%] relative z-5 hover:cursor-pointer hover:bg-purple-300`}>
          <img className='w-full h-full object-cover rounded-[50%]' src={`/assets/boss/${getBossFolderName(questData.name)}/real.png`}/>   
            <div className="w-0 h-0 absolute bottom-[5%] right-[50%] translate-x-[50%] translate-y-[100%] rotate-z-[180deg] z-3
                border-l-20 border-l-transparent 
                border-r-20 border-r-transparent 
                border-b-20 border-b-inherit">
            </div>
        </div>
    )
}

export default QuestIcon

interface QuestIconProps {
  zoom: number;
  questData: QuestData_T;
  onClick:()=>void;
}