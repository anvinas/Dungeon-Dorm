// import styles from "./styles/loginModal.module.css"
import { useState } from "react"
import AvatarLevel from "./AvatarLevel"
import styles from "./styles/GameFooter.module.css"

function GameFooter({OnClickInventory}:{OnClickInventory:any}){

  return (
    <div className={`${styles.container} flex items-end relative w-full justify-between h-full shadow-lg p-15 text-white`}>
        <AvatarLevel />

        {/* Inventory button */}
        <div onClick={()=>OnClickInventory()} className="p-5 bg-gray-300 border-4 border-blue-500 rounded-[50%] cursor-pointer hover:bg-gray-400">
            <img
              src="/assets/satchel.png"
              className="object-cover transform scale-x-[-1]  h-20 w-20"
              alt="Satchel"
            />
        </div>

        <div className=""></div>
    </div>
    
  )
}

export default GameFooter
