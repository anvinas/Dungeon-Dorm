// import styles from "./styles/loginModal.module.css"
import type { UserProfile_T } from "../lib/types"
import Avatar from "./Avatar"


function GameFooter({OnClickInventory,userData}:{OnClickInventory:any,userData:UserProfile_T}){
    
  return (
    <div className="flex items-end relative w-full justify-between h-full shadow-lg p-[2vw] text-white">
        <Avatar userData={userData}/>

        {/* Inventory button */}
        <div onClick={()=>OnClickInventory()} className="p-5 bg-red-100 border-4 border-blue-500 rounded-[50%] h-[20vw] w-[20vw] md:h-[10vw] md:w-[10vw]">
            <img
              src="/assets/satchel.png"
              className=" object-cover transform scale-x-[-1] bobAvatar"
              alt="Satchel"
            />
        </div>

        <div className=""></div>
    </div>
    
  )
}

export default GameFooter
