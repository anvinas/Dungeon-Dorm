import { useState ,useEffect} from "react"
import { fetchJWT,storeJWT } from "../lib/JWT"
import { useNavigate } from 'react-router-dom';

import axios from "axios"
import GetServerPath from "../lib/GetServerPath"
import styles from "./characterPage.module.css"

type SuccessSelectionData = {
    message:string;
    UserProfile: object;
}

function CharacterSelectPage(){
    const navigate = useNavigate();

    const [allPossibleCharacterInfo,setAllPossibleCharacterInfo] = useState([
        {id:"685d632886585be7727d064c",name:"mage",animDelay:500,scrollFrame:1},
        {id:"686552bddd55124b4da9b83e",name:"mage",animDelay:943,scrollFrame:1},
        {id:"686552bddd55124b4da9b83e",name:"mage",animDelay:3584,scrollFrame:1},
        {id:"686552bddd55124b4da9b83e",name:"mage",animDelay:1255,scrollFrame:1},
    ])
    const [selectedScrollIndex,setSelectedScrollIndex] = useState(-1)
    const [error,setError] = useState("")
    const [successSelectionData,setSuccessSelectionData] = useState<SuccessSelectionData | null>(null)

    useEffect(()=>{
        // fetchCharacterID()
        if(error.includes("already")){
            navigate("/play")
        }
    },[error])
    

    const onClickScroll = (index:number)=>{
        setSelectedScrollIndex(index);

        // Reset animations
        let tempCharacterInfo = [...allPossibleCharacterInfo]
        tempCharacterInfo.forEach((info)=>{
            info.scrollFrame = 1;
        })
        setAllPossibleCharacterInfo(tempCharacterInfo)
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            {/* BG container */}
            <div className="relative w-screen h-screen ">
                <img src="/img/pixel_bg2.png" className={`w-screen max-w-screen h-screen ${styles.bgContainer}`}/>

                {!successSelectionData && 
                    <div className={`absolute h-fit w-full h-fit translate-x-[50%] translate-y-[-50%]  top-[50%] right-[50%] z-3 `}>
                        {/* Character select */}
                        <div className="relative w-full h-fit items-center justify-center">
                            <div className="flex items-center justify-center">
                                <div className="text-center text-white font-bold text-6xl p-4 mb-10 rounded-lg inline-block">Choose Your Character</div>
                            </div>

                            {/* Scroll container */}
                            <div className="px-10">
                                <div className="relative w-fit flex gap-2 items-center justify-between">
                                    {allPossibleCharacterInfo.map((charInfo,i)=>{
                                        return(
                                            <ScrollCharacterModel key={i} 
                                                setScrollFrame={(frameNum)=>{setAllPossibleCharacterInfo((info)=>{const newInfo = [...info]; newInfo[i].scrollFrame = frameNum;return newInfo;})}} 
                                                characterInfo={charInfo}
                                                isSelected={selectedScrollIndex == i} 
                                                index={i} 
                                                onClick={()=>onClickScroll(i)}
                                                setPageError={(error)=>setError(error)}
                                                setSuccessSelectionData = {(data)=>setSuccessSelectionData(data)}
                                            />
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <div className="text-center text-red-500 bg-gray-100 rounded-md px-2 w-fit">{error}</div>
                            </div>
                        </div>
                    </div>
                }
                
                {/* START GAME */}
                {successSelectionData &&
                    <div className={`absolute flex flex-col h-fit w-fit opacity-[0.99] translate-x-[50%] translate-y-[-50%]  top-[50%] right-[50%] z-3 bg-white p-10 rounded gap-5`}>
                        <div className="text-center font-semibold">{successSelectionData?.message}</div>
                        <div className="flex justify-center">
                            <div className="text-center font-bold bg-green-400 w-fit px-5 py-4 rounded hover:bg-green-500 hover:cursor-pointer" onClick={()=>navigate("/play")}>BEGIN YOUR JOURNEY</div>
                        </div>
                    </div>
                }

            </div>
        

        </div>
    )
}

export default CharacterSelectPage


type ScrollCharacterModelProps = {
    isSelected: boolean;
    onClick: () => void;
    setScrollFrame: (frameNum:number) =>void;
    setSuccessSelectionData: (data:any) =>void;
    index: number;
    characterInfo: {id:string,name:string,animDelay:number,scrollFrame:number};
    setPageError:(error:string) => void;
};

const ScrollCharacterModel = ({isSelected,index,characterInfo,onClick,setScrollFrame,setPageError,setSuccessSelectionData}: ScrollCharacterModelProps)=>{

    const [isHovered, setIsHovered] = useState(false);

    const totalFrames = 6; // How many frames you have in your folder
    const animationSpeed = 100; // milliseconds per frame

    
    const framePath = (scrollFrame: number) =>
        `/assets/playableCharacter/${characterInfo.name}/scroll/animation/frame_${scrollFrame}.png`; // adjust path & naming if needed

    const defaultImage = `/assets/playableCharacter/${characterInfo.name}/scroll/closed.png`;
    const hoverImage = `/assets/playableCharacter/${characterInfo.name}/scroll/peek.png`;

    useEffect(() => {
        if (!isSelected) return;

        let currentFrame = characterInfo.scrollFrame;

        const interval = setInterval(() => {
            currentFrame++;
            if (currentFrame >= totalFrames) {
                clearInterval(interval);
            } else {
                setScrollFrame(currentFrame);
            }
        }, animationSpeed);

        return () => clearInterval(interval);
    }, [isSelected]);

    const handleMouseEnter = () => {
        if (!isSelected) setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleClick = () => {
        if(isSelected) return
        setScrollFrame(1); // Start from the first frame
        onClick();
    };

    const imageToShow = isSelected
        ? framePath(characterInfo.scrollFrame)
        : isHovered
        ? hoverImage
        : defaultImage;

    
    const handleCharacterSelect = async () => {
        // setCurSelectedChar((oldData) => ({...oldData, userId: "685d632886585be7727d064c"}));
        // console.log('685d632886585be7727d064c');
        // console.log(curSelectedChar.userId + " Hi");
        setPageError("")
        try{
            const token = fetchJWT();
            let response = await axios.post(`${GetServerPath()}/api/user/select-character`,{
                characterClassId:characterInfo.id,
            }, 
            { headers: {
                Authorization: `Bearer ${token}`
            },
            });
            
            // Succes
            if(response.status == 200){
                storeJWT(response.data.token)
                setSuccessSelectionData(response.data)
                console.log(response.data)
            
            }else{
                // Failure
                console.log(response.data)
                setPageError(response.data.error)
            }

        }catch(e:any){
            console.log(e)
            setPageError("Server Error | contact admin")
            setPageError(e.response.data.error)
        }
    
    }
    

    return (
        <div onClick={handleClick} className="flex flex-col gap-2 justify-center items-center h-fit">
            <img
                src={imageToShow}
                alt="Character Scroll"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`${isSelected ? "w-[48]" : "w-[60%]"} z-3 ${styles.bannerContainer}`}
                style={{ cursor: 'pointer' ,animationDelay:`${characterInfo.animDelay}ms`}}
            />
            {isSelected && (
                <div onClick={handleCharacterSelect} className="bg-green-500 px-8 py-3 text-black rounded-md font-semibold hover:cursor-pointer hover:bg-green-600">
                    Select
                </div>
            )}
        </div>
    );
}



// const ScrollCharacterModel = ({isSelected,onClick,index})=>{
//     return(
//         <div onClick={onClick} className="flex flex-col gap-2 justify-center items-center h-fit ">
//             <img style={{animationDelay:"500ms"}} src="/assets/Pixel_Scroll_2.png" className={`${isSelected?"w-[80%]" : "w-[60%]"} z-3 ${styles.bannerContainer} cursor-pointer`}/>
//             {isSelected && <div className="bg-green-500 px-8 py-3 text-black rounded-md font-semibold hover:cursor-pointer hover:bg-green-600">Select</div>}
//         </div>
//     )
// }