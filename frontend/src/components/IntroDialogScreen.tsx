// import styles from "./styles/loginModal.module.css"
import {useState} from "react"
import { useNavigate } from 'react-router-dom';


const dialogList = [
    "Once upon a time, you were a psychology major, working as a barista to help pay rent and tuition.",
    "Suddenly, a mysterious portal opens up in the middle of Starbags, sucking you in.",
    "You are transported into the magical realm of UCF.",
    "Your task is to defeat all the bosses and acquire their magical relics to escape"
]

function IntroDialogScreen({ onClickFinish }: { onClickFinish: () => void }) {
    const navigate = useNavigate();
    const [dialogIndex,setDialogIndex] = useState(0)
 
    return (
        <div className=" p-5 h-fit w-full bg-gray-800 rounded-lg gap-10 flex flex-col">
            {dialogList.map((dialog,i)=>{
                if(i>dialogIndex) return
                return(
                    <div className="text-white font-semibold text-2xl">{dialog}</div>
                )
            })}

            <div className="flex justify-end">
                {dialogIndex != dialogList.length-1 && <div className="px-5 py-2 bg-blue-500 rounded text-white cursor-pointer hover:bg-blue-600" onClick={()=>setDialogIndex(old=>old+1)}>Next</div>}
                {dialogIndex == dialogList.length-1 && <div className="px-5 py-2 bg-green-500 rounded text-black font-bold cursor-pointer hover:bg-green-600" onClick={()=>onClickFinish()}>Begin Your Journey</div>}
            </div>
        </div>

    )
}

export default IntroDialogScreen
