// import styles from "./styles/loginModal.module.css"
import {useState} from "react"
import GetServerPath from "../lib/GetServerPath.js"
import {storeJWT} from "../lib/JWT.js"
import axios from "axios"
import { useNavigate } from 'react-router-dom';


type LoginData = {
  gamerTag: string;
  email: string;
  password: string; 
  showPassword:boolean
};

type SignupModalProps = {
  onClickClose: () => void;
  isOpen: boolean;
};

function SignupModal({onClickClose,isOpen}:SignupModalProps) {

  const navigate = useNavigate();

  const [error,setError] = useState("")
  const [inputErrorDisplay,setInputErrorDisplay] = useState({
    gamerTag:false,
    email:false,
    password:false
  })
  const [signupData,setSignupData] = useState<LoginData>({
    gamerTag:"",
    email:"",
    password:"",
    showPassword:false
  })


  const handleSignup = async ()=>{
    let hasErrors= false;
    setError("")
    
    // Reset all errors
    let tempInputErrorDisplay = {
      gamerTag:false,
      email:false,
      password:false
    }

    //Check input validation 
    if(signupData.gamerTag == ""){
      tempInputErrorDisplay.gamerTag = true;
      hasErrors = true;
    }
    if(signupData.email == ""){
      tempInputErrorDisplay.email = true;
      hasErrors = true;
    }
    if(signupData.password == ""){
      tempInputErrorDisplay.password = true;
      hasErrors = true;
    }
    setInputErrorDisplay({...tempInputErrorDisplay})
    if(hasErrors) return;

    // Completed Validation!
    try{
      let response = await axios.post(`${GetServerPath()}/api/auth/register`,{
        ...signupData
      })

      // Succes
      if(response.status == 200){
        storeJWT(response.data.token)
        navigate("/verify");
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
            <div className="font-semibold text-2xl text-white">Signup</div>
            <div className="font-semibold text-2xl text-white hover:cursor-pointer hover:text-red-300" onClick={()=>onClickClose()}>X</div>
          </div>
          <div className="p-10 flex flex-col gap-3">
              
              {/* First Name */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">gamerTag</div>
                <input onChange={(e)=>setSignupData((oldData)=>{oldData.gamerTag = e.target.value; return oldData})} placeholder="Johny345" className="border border-gray-400 rounded-sm h-10  pl-5" />
                {inputErrorDisplay.gamerTag &&<div className="text-red-500 text-sm">Please Input a valid gamerTag</div>}
              </div>
              {/* Last Name */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">Email</div>
                <input onChange={(e)=>setSignupData((oldData)=>{oldData.email = e.target.value; return oldData})}placeholder="john@domain.com" className="border border-gray-400 rounded-sm h-10  pl-5" />
                {inputErrorDisplay.email &&<div className="text-red-500 text-sm">Please Input a valid email</div>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">Password</div>
                <input type="password" onChange={(e)=>setSignupData((oldData)=>{oldData.password = e.target.value; return oldData})} placeholder="xxxxxxxxxxxxx" className="border border-gray-400 rounded-sm h-10 pl-5" />
                {inputErrorDisplay.password &&<div className="text-red-500 text-sm">Please Input a valid password</div>}           
              </div>

              {/* Error Msg */}
              <div className="text-red-500">{error==null ? "":error}</div>
          </div>

          {/* Footer */}
          <div className="flex justify-center border-t-1 border-gray-200 p-5"> 
              <div></div>

              <div className="flex gap-3">
                  <div className="w-60 p-5 pt-3 pb-3 text-center rounded-md bg-indigo-400 hover:bg-green-500 hover:cursor-pointer" onClick={()=>handleSignup()}>Create Account</div>
              </div>
          </div>
      </div>
    </div>
 
  )
}

export default SignupModal
