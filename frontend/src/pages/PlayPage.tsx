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
              <span id="userName">Logged In</span><br />
            

            {/* <img src="/gif/amber.gif" className="absolute top-[10%] right-[25%]"/> */}
        </div>

        {/* left chain */}
        <div className="">
        </div>

    </div>

   
  )
}

export default PlayPage
