// import styles from "./styles/loginModal.module.css"
import {useEffect, useState} from "react"
import Avatar from "./Avatar"


function GameFooter(){
    
  return (
    <div className="flex items-end relative w-full justify-between h-full shadow-lg p-15 text-white">
        <Avatar />
        
        {/* Inventory button */}
        <div className="p-5 bg-red-100 border-4 border-blue-500 rounded-[50%]">
            <img
              src="/assets/satchel.png"
              className=" object-cover transform scale-x-[-1] bobAvatar h-20"
              alt="Satchel"
            />
        </div>

        <div></div>
    </div>
    
  )
}

export default GameFooter
