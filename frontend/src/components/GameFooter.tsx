// import styles from "./styles/loginModal.module.css"
import type { UserProfile_T } from "../lib/types"
import Avatar from "./Avatar"


function GameFooter({OnClickInventory,userData}:{OnClickInventory:any,userData:UserProfile_T}){
    
  return (
    <div className="flex items-end relative w-full justify-between h-full shadow-lg p-15 text-white">
        <Avatar userData={userData}/>

        {/* Inventory button */}
        <div onClick={()=>OnClickInventory()} className="p-5 bg-red-100 border-4 border-blue-500 rounded-[50%]">
            <img
              src="/assets/satchel.png"
              className=" object-cover transform scale-x-[-1] bobAvatar h-20"
              alt="Satchel"
            />
        </div>

        <div className=""></div>
    </div>
    
  )
}

export default GameFooter
