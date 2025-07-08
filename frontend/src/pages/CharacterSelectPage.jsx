import { useState ,useEffect} from "react"
import styles from "./characterPage.module.css"

function CharacterSelectPage(){

    const [allPossibleCharacterInfo,setAllPossibleCharacterInfo] = useState([
        {animDelay:500},
        {animDelay:243},
        {animDelay:784},
        {animDelay:1255},
    ])
    const [selectedScrollIndex,setSelectedScrollIndex] = useState(-1)

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            {/* BG container */}
            <div className="relative w-screen h-screen ">
                <img src="/img/pixel_bg2.png" className={`w-screen max-w-screen h-screen ${styles.bgContainer}`}/>

                {/* Banner */}
                <div className={`absolute h-fit w-full h-fit translate-x-[50%] translate-y-[-50%]  top-[50%] right-[50%] z-3 `}>
                    <div className="relative w-full h-fit items-center justify-center">
                        <div className="flex items-center justify-center">
                            <div className="text-center text-white font-bold text-6xl p-4 mb-10 rounded-lg inline-block">Choose Your Character</div>
                        </div>

                        {/* Scroll container */}
                        <div className="px-10">
                            <div className="relative w-fit flex gap-2 items-center justify-between">
                                {allPossibleCharacterInfo.map((charInfo,i)=>{
                                    return(
                                        <ScrollCharacterModel key={i} animDelay={charInfo.animDelay} isSelected={selectedScrollIndex == i} index={i} onClick={()=>setSelectedScrollIndex(i)}/>
                                    )
                                })}
                            </div>
                        </div>
                        
                    </div>
                </div>

            </div>
        

        </div>
    )
}

export default CharacterSelectPage


const ScrollCharacterModel = ({isSelected,onClick,index})=>{
    return(
        <div onClick={onClick} className="flex flex-col gap-2 justify-center items-center h-fit ">
            <img style={{animationDelay:"500ms"}} src="/assets/Pixel_Scroll_2.png" className={`${isSelected?"w-[80%]" : "w-[60%]"} z-3 ${styles.bannerContainer} cursor-pointer`}/>
            {isSelected && <div className="bg-green-500 px-8 py-3 text-black rounded-md font-semibold hover:cursor-pointer hover:bg-green-600">Select</div>}
        </div>
    )
}