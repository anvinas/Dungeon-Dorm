import React from 'react';
interface QuestIconProps {
  zoom: number;
  questData: {
    longitude: number;
    latitude: number;
  };
}

const QuestIcon :React.FC<QuestIconProps>= ({ zoom, questData })=>{
    console.log(questData)
    if(zoom<15) return (<div></div>)
    return(
        <div className={`w-20 h-20 border-black border-1 bg-orange-600 opacity-[0.7] translate-y-[-50%] rounded-[50%] relative z-4`}>   
            <div className="w-0 h-0 absolute bottom-[5%] right-[50%] translate-x-[50%] translate-y-[100%] rotate-z-[180deg] z-3
                border-l-20 border-l-transparent 
                border-r-20 border-r-transparent 
                border-b-20 border-b-inherit">
            </div>
        </div>
    )
}

export default QuestIcon