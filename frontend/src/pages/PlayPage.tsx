import styles from "./loginPage.module.css"
import LoginModal from "../components/LoginModal.tsx"
import SignupModal from "../components/SignupModal.tsx"

import { useState ,useEffect} from "react"
function PlayPage() {

  useEffect(()=>{
    //Check if already logged in -> HANDLE LATER
    try{

    }catch{}
  },[])

  const [loginModalOpen,setLoginModalOpen] = useState(false)
  const [signupModalOpen,setSignupModalOpen] = useState(false)

  return (
    <div className="relative w-screen h-screen overflow-hidden">
        <LoginModal isOpen={loginModalOpen} onClickClose={()=>setLoginModalOpen(false)}/>
        <SignupModal isOpen={signupModalOpen} onClickClose={()=>setSignupModalOpen(false)}/>

        {/* BG container */}
        <div className="relative w-screen h-screen ">
            <img src="/img/pixel_bg2.png" className={`w-screen max-w-screen h-screen ${styles.bgContainer}`}/>

            {/* Banner */}
            <div className={`absolute h-fit w-full h-fit translate-x-[50%] translate-y-[-50%]  top-[43%] right-[50%] z-3 ${styles.bannerContainer}`}>
                <div className="relative w-full h-fit flex items-center justify-center">
                   {/* Left Chain */}
                    <img src="/img/chain.png" className={`h-100 absolute z-2  top-[100%] left-[40.5%] ${styles.chain}`}/>
                    
                    {/* Right Chain */}
                    <img src="/img/chain.png" className={`h-100 absolute z-2 top-[0%] left-[59.75%] ${styles.chain}`} />
                    
                    {/* Wood container */}
                    <div className="relative w-fit">
                      <img src="/img/wood_texture2.png" className={`h-120 z-3 ${styles.banner}`}/>

                       {/* Buttons Container */}
                        <div className="flex justify-around absolute z-4 translate-x-[-50%] translate-y-[-50%] bottom-[10%] left-[50%] w-full">
                          <div className="p-3 pr-4 pl-4 rounded-md bg-[#6b8e23] text-[#ffffff] border-1 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:cursor-pointer "onClick={()=>setSignupModalOpen(true)} >Signup</div>
                          <div className="p-3 pr-4 pl-4 rounded-md bg-indigo-500 text-[#ffffff] border-black border-1  transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:cursor-pointer hover:bg-indigo-500" onClick={()=>setLoginModalOpen(true)}>Login</div>
                        </div>
                    </div>
                </div>
            </div>
            

            {/* <img src="/gif/amber.gif" className="absolute top-[10%] right-[25%]"/> */}
        </div>

        {/* left chain */}
        <div className="">
        </div>

    </div>

   
  )
}

export default PlayPage
