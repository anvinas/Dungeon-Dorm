import type { UserProfile_T } from "../lib/types";

// import styles from "./styles/loginModal.module.css"
function Avatar({
  userData
}:{
  userData:UserProfile_T
}){
  
  const userHealthPercentage = ((userData.currentHP / userData.maxHP )*100 );
  
  return (
    <div className="relative h-fit w-[50%]">
      <div className="flex items-end gap-1">
        {/* Head */}
        <div className="h-[20vw] w-[20vw] md:h-[10vw] md:w-[10vw] rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shadow-md p-1">
          <div className="h-full w-full rounded-full overflow-hidden border-4 border-blue-700 bg-purple-100">
            <img
              src={`/assets/playableCharacter/${userData.Character.class.toLowerCase()}/pixel.png`}
              className="w-full h-full object-cover transform scale-x-[-1] bobAvatar"
              alt="Avatar"
              style={{ animationDelay: '0s' }} 
            />
          </div>
        </div>

        <div style={{WebkitTextStroke: '2px black'}} className=" pb-5 font-bold text-[1.3rem] md:text-[3rem]">{userData.currentHP}/{userData.maxHP} hp</div>
      </div>
      

      {/* Health BAR*/}
      <div className={`relative top-[-10%] w-[100%] h-5 border-2 bg-[#697284e3] border-blue-800 rounded-lg`}>
        <div 
          className={`absolute h-full  bg-green-400 rounded-sm ${userHealthPercentage > 80 ? "bg-green-400" : userHealthPercentage>40?"bg-orange-400":"bg-red-400"}`} 
          style={{ width: `${userHealthPercentage}%` }}>
        </div>
      </div>
    
    </div>  
  )
}

export default Avatar
