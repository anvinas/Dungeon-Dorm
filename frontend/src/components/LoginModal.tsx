// import styles from "./styles/loginModal.module.css"
import {useState} from "react"
import axios from "axios"
import GetServerPath from "../lib/GetServerPath.ts"
import {storeJWT} from "../lib/JWT.ts"
import { useNavigate } from 'react-router-dom';

type LoginData = {
  gamerTag: string;
  password: string; 
  showPassword:boolean
};

type LoginModalProps = {
  onClickClose: () => void;
  isOpen: boolean;
};

function LoginModal({onClickClose,isOpen} : LoginModalProps) {
  const navigate = useNavigate();

  const [error,setError] = useState("")
  const [inputErrorDisplay,setInputErrorDisplay] = useState({
    gamerTag:false,
    password:false
  })
  const [loginData,setLoginData] = useState<LoginData>({
    gamerTag:"",
    password:"",
    showPassword:false
  })


  const handleLogin = async()=>{
    let hasErrors= false;
    setError("")
    
    // Reset all errors
    let tempInputErrorDisplay = {
      gamerTag:false,
      email:false,
      password:false
    }

    //Check input validation 
    if(loginData.gamerTag == ""){
      tempInputErrorDisplay.gamerTag = true;
      hasErrors = true;
    }

    if(loginData.password == ""){
      tempInputErrorDisplay.password = true;
      hasErrors = true;
    }
    setInputErrorDisplay({...tempInputErrorDisplay})
    if(hasErrors) return;

    // Completed Validation!
    try{
      let response = await axios.post(`${GetServerPath()}/api/auth/login`,{
        ...loginData
      })

      // Succes
      if(response.status == 200){
        storeJWT(response.data.token)
        
        console.log(response.data)

        const profileResponse = await axios.get(`${GetServerPath()}/api/auth/profile`,{
          headers:{
            Authorization: `Bearer ${response.data.token}`
          }
        });

        console.log(profileResponse.data.userProfile);
        
        if(profileResponse.data.userProfile.Character == null && profileResponse.data.userProfile.isEmailVerified == true)
        {
          navigate("/character");
        }
        else if(profileResponse.data.userProfile.Character != null && profileResponse.data.userProfile.isEmailVerified == true)
        {
          navigate("/play");
        }
        else
        {
          console.log("MUST VERIFY");
          setError("You must validate your email before login")
        }

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

  if(!isOpen) return

  return (
    <div className="z-4 absolute bg-[#000000db] flex justify-center items-center w-screen h-screen overflow-hidden ">
      <div className="bg-white rounded-lg shadow-md min-w-[30%]">
          {/* Header */}
          <div className="flex justify-between bg-blue-400 rounded-t-lg  p-5">
            <div className="font-semibold text-2xl text-white">Login</div>
            <div className="font-semibold text-2xl text-white hover:cursor-pointer hover:text-red-300" onClick={()=>onClickClose()}>X</div>
          </div>
          <div className="p-10 flex flex-col gap-3">
              
              {/* Gamertag */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">Gamertag</div>
                <input onChange={(e)=>setLoginData((oldData)=>{oldData.gamerTag = e.target.value; return oldData})} placeholder="Johny345" className="border border-gray-400 rounded-sm h-10  pl-5" />
                {inputErrorDisplay.gamerTag &&<div className="text-red-500 text-sm">Please Input a valid gamertag</div>}
              </div>


              {/* Password */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">Password</div>
                <input type="password" onChange={(e)=>setLoginData((oldData)=>{oldData.password = e.target.value; return oldData})} placeholder="xxxxxxxxxxxxx" className="border border-gray-400 rounded-sm h-10 pl-5" />
                {inputErrorDisplay.password &&<div className="text-red-500 text-sm">Please Input a valid password</div>}           
              </div>

               <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900"></label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                </div>
              </div>


              {/* Error Msg */}
              <div className="text-red-500">{error==null ? "":error}</div>
          </div>

          {/* Footer */}
          <div className="flex justify-between border-t-1 border-gray-200 p-5"> 
              <div></div>
              <div className="flex gap-3">
                  <div className="p-5 pt-3 pb-3 rounded-md bg-green-400 hover:bg-green-500 hover:cursor-pointer" onClick={()=>handleLogin()}>Login</div>
              </div>
          </div>
      </div>
    </div>
    
  )
}

export default LoginModal
