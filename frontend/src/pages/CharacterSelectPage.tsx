import { useState ,useEffect} from "react"
import { fetchJWT,storeJWT } from "../lib/JWT"
import axios from "axios"
import GetServerPath from "../lib/GetServerPath"
import styles from "./characterPage.module.css"

function CharacterSelectPage(){

    const [allPossibleCharacterInfo,setAllPossibleCharacterInfo] = useState([
        {id:"685d632886585be7727d064c",name:"mage",animDelay:500,scrollFrame:1},
        {id:"685d632886585be7727d064c",name:"mage",animDelay:943,scrollFrame:1},
        {id:"685d632886585be7727d064c",name:"mage",animDelay:3584,scrollFrame:1},
        {id:"685d632886585be7727d064c",name:"mage",animDelay:1255,scrollFrame:1},
    ])
    const [selectedScrollIndex,setSelectedScrollIndex] = useState(-1)


    useEffect(()=>{
        fetchCharacterID()
    },[])
    
    const fetchCharacterID = ()=>{
        
    }

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
                                        <ScrollCharacterModel key={i} 
                                            setScrollFrame={(frameNum)=>{setAllPossibleCharacterInfo((info)=>{const newInfo = [...info]; newInfo[i].scrollFrame = frameNum;return newInfo;})}} 
                                            characterInfo={charInfo}
                                            isSelected={selectedScrollIndex == i} 
                                            index={i} 
                                            onClick={()=>onClickScroll(i)}
                                        />
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


type ScrollCharacterModelProps = {
    isSelected: boolean;
    onClick: () => void;
    setScrollFrame: (frameNum:number) =>void;
    index: number;
    characterInfo: {id:string,name:string,animDelay:number,scrollFrame:number}
};

const ScrollCharacterModel = ({isSelected,onClick,index,setScrollFrame,characterInfo}: ScrollCharacterModelProps)=>{

    const [isHovered, setIsHovered] = useState(false);
    const[error, setError] = useState("");

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
                
                console.log(response.data)
            
            }else{
                // Failure
                console.log(response.data)
                setError(response.data.error)
            }

        }catch(e:any){
            console.log(e)
            setError("Server Error | contact admin")
            setError(e.response.data.error)
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