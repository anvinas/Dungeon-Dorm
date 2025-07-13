import { useState ,useEffect} from "react"
import styles from "./characterPage.module.css"
import { useNavigate } from 'react-router-dom';

import axios from "axios"
import GetServerPath from "../lib/GetServerPath.ts"
import {fetchJWT, storeJWT} from "../lib/JWT.ts"


function CharacterSelectPage(){
    const navigate = useNavigate();

    const [allPossibleCharacterInfo] = useState([
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
                
            <div className="absolute top-10 right-20 z-4" onClick={() => navigate("/")}>
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
                </svg>
                </div>
                

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

type ScrollCharacterModelProps = {
    isSelected: boolean;
    onClick: () => void;
    index: number;
    animDelay: number;
};

const ScrollCharacterModel = ({isSelected,onClick,index}: ScrollCharacterModelProps)=>{

  const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [frame, setFrame] = useState(0);

    const totalFrames = 6; // How many frames you have in your folder
    const animationSpeed = 100; // milliseconds per frame

    
    const framePath = (frame: number) =>
        `/assets/MageScrollAnimation/frame_${frame}.png`; // adjust path & naming if needed

    const defaultImage = '/assets/Closed_Pixel_Scroll_2.png';
    const hoverImage = '/assets/Mage_SliverOpen.png';

    useEffect(() => {
        if (!isClicked) return;

        let currentFrame = 0;

        const interval = setInterval(() => {
            currentFrame++;
            if (currentFrame >= totalFrames) {
                clearInterval(interval);
                //setIsClicked(false); // Animation done
                //setFrame(0);
            } else {
                setFrame(currentFrame);
            }
        }, animationSpeed);

        return () => clearInterval(interval);
    }, [isClicked]);

    const handleMouseEnter = () => {
        if (!isClicked) setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleClick = () => {
        setIsClicked(true);
        setFrame(0); // Start from the first frame
        onClick();
    };

    const imageToShow = isClicked
        ? framePath(frame)
        : isHovered
        ? hoverImage
        : defaultImage;

    
    const[setError] = useState("");

    type selectedCharacter = {
        userId:string;
    };
     
     const[curSelectedChar, setCurSelectedChar] = useState<selectedCharacter>({
        userId:""
      })


    const sendIndex = async () => {
        console.log(index);
        if(index === 0) //Warlock/Mage
        {
            setCurSelectedChar((oldData) => ({...oldData, userId: "685d632886585be7727d064c"}));
            console.log('685d632886585be7727d064c');
            console.log(curSelectedChar.userId + " Hi");
            try{
                const token = fetchJWT();
                let response = await axios.post(`${GetServerPath()}/api/user/selected-character`,{curSelectedChar}, 
                { headers: {
                    Authorization: 'Bearer ${token}'
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

        }
    

    return (
        <div onClick={handleClick} className="flex flex-col gap-2 justify-center items-center h-fit">
            <img
                src={imageToShow}
                alt="Character Scroll"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`${isSelected ? "w-[48]" : "w-[60%]"} z-3 ${styles.bannerContainer}`}
                style={{ cursor: 'pointer' }}
            />
            {isSelected && (
                <div onClick={sendIndex}className="bg-green-500 px-8 py-3 text-black rounded-md font-semibold hover:cursor-pointer hover:bg-green-600">
                    Select
                </div>
            )}
        </div>
    );

//const handleClick = () => {
//    setImageSrc('/assets/Mage_Scroll_Sheet.png');
//}


/*
const defaultImage = '/assets/Closed_Pixel_Scroll_2.png';
    const hoverImage = '/assets/MageScrollAnimation/Mage_SliverOpen.png';
    const clickImage = '/assets/MageScrollAnimaton/Mage_Scroll_Sheet.png';
    
    //const [isClicked, setIsClicked] = useState(false);
    const [currentImage, setCurrentImage] = useState(defaultImage);

    const MouseEnter = () => {
        if(!onClick){
            setCurrentImage(hoverImage);
        }
    };
   
    const MouseLeave = () => {
        if(!onClick){
            setCurrentImage(defaultImage);
        }
    };

    const handleClick = () => {
        //setIsClicked(!onClick);
        setCurrentImage(onClick() ? defaultImage : clickImage);
    };

return(
        <>
            <img
            src={currentImage}
            alt="Interactive image"
            onMouseEnter={MouseEnter}
            onMouseLeave={MouseLeave}
            onClick={handleClick}
            style={{ cursor: 'pointer', transition: 'filter 0.3s ease-in-out' }} // Add some basic styling and transition
    />
            
        </>
    )


*/

/*
<img onClick={onClick}
            src={isHovered ? '/assets/MageScrollAnimation/Mage_SliverOpen.png' : '/assets/Closed_Pixel_Scroll_2.png'}
            alt="Hoverable"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-48" 

            />
*/

/*
return(
        <>
           
            <div onClick={onClick} className="flex flex-col gap-2 justify-center items-center h-fit ">
                
                <img style={{animationDelay:"500ms"}}  src={isHovered ? '/assets/MageScrollAnimation/Mage_SliverOpen.png' : '/assets/Closed_Pixel_Scroll_2.png'}
                    alt="Hoverable"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`${isSelected?"w-[48]" : "w-[60%]"} z-3 ${styles.bannerContainer} cursor-pointer`}/>
                {isSelected && <div className="bg-green-500 px-8 py-3 text-black rounded-md font-semibold hover:cursor-pointer hover:bg-green-600">Select</div>}
            </div>
        </>
    )


*/

}