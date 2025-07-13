// import styles from "./styles/loginModal.module.css"
function Avatar(){
    
  return (
    <div className="relative h-fit">
      <div className="flex items-end gap-1">
        {/* Head */}
        <div className="h-30 w-30 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shadow-md p-1">
          <div className="h-full w-full rounded-full overflow-hidden border-4 border-blue-700 bg-purple-100">
            <img
              src="/assets/characterHead.png"
              className="w-full h-full object-cover transform scale-x-[-1] bobAvatar"
              alt="Avatar"
              style={{ animationDelay: '0s' }} 
            />
          </div>
        </div>

        <div style={{WebkitTextStroke: '2px black',}} className="pb-5 font-bold text-5xl">11</div>
      </div>
      

      {/* XP BAR*/}
      <div className="absolute top-[95%] left-[0.5%] w-65 h-3 border-2 bg-[#697284e3] border-blue-400 rounded-lg">
        <div className={`absolute h-full  bg-green-400 rounded-sm`} style={{ width: `40%` }}></div>
      </div>
    
    </div>  
  )
}

export default Avatar
