import styles from "./loginPage.module.css"
import {useEffect, useState, useRef} from "react"
import GetServerPath from "../lib/GetServerPath.js"
import {storeJWT} from "../lib/JWT.js"
import axios from "axios"
import { useNavigate } from 'react-router-dom';


type NewPassword = {
  password: string; 
  showPassword:boolean
};

type RetypedPassword = {
  password: string; 
  showPassword:boolean
};

function ResetPassword()
{
  const [message, setMessage] = useState("Please Enter A New Password");
  const [error,setError] = useState("")
  const navigate = useNavigate();

       const [newData,setNewData] = useState<NewPassword>({
          password:"",
          showPassword:false
        })

         const [retypedData,setRetypedData] = useState<NewPassword>({
          password:"",
          showPassword:false
        })

        const [inputErrorDisplay,setInputErrorDisplay] = useState({
          password:false
        })

         const handelReset = async ()=>{
            let hasErrors= false;
            setError("")
            
            // Reset all errors
            let tempInputErrorDisplay = {
              password:false
            }

            //Check input validation 
            if(newData.password == "" || retypedData.password == ""){
              tempInputErrorDisplay.password = true;
              hasErrors = true;
              setMessage("Invalid Password")
            }
            else if(!(newData.password == retypedData.password))
            {
              tempInputErrorDisplay.password = true;
              hasErrors = true;
              setMessage("Passwords Do Not Match ")
            }
            setInputErrorDisplay({...tempInputErrorDisplay})
            if(hasErrors) return;
            
            setMessage("No errors <3");
            
            // Completed Validation!
            try{
              let response = await axios.post(`${GetServerPath()}/api/auth/register`,{
                ...retypedData
              })

              // Succes
              if(response.status == 200){
                storeJWT(response.data.token)
                console.log(response.data)
                
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


    return(
    <>
        
      <div className="relative w-screen h-screen overflow-hidden">
        {/* BG container */}
        <div className="absolute inset-0 z-0 ">
            <img src="/img/pixel_bg2.png" className={`w-screen max-w-screen h-screen ${styles.bgContainer}`}/>
        </div>

      {/*Information Container*/}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
      

        <div className="bg-stone-800 bg-opacity-70 p-8 rounded-xl shadow-lg flex flex-col items-center gap-6">
           <div className="flex flex-col gap-1">
                <div className="text-white font-bold">New Password</div>
                <input type="password" onChange={(e)=>setNewData((oldData)=>{oldData.password = e.target.value; return oldData})} placeholder="xxxxxxxxxxxxx" className="bg-white border border-gray-400 rounded-sm h-10 pl-5" />           
            </div>

            <div className="flex flex-col gap-1">
                <div className="text-white font-bold">Re-Type Password</div>
                <input type="password" onChange={(e)=>setRetypedData((oldData)=>{oldData.password = e.target.value; return oldData})} placeholder="xxxxxxxxxxxxx" className="bg-white border border-gray-400 rounded-sm h-10 pl-5" />
                           
            </div>

        <div className="text-white text-xl">
          <h1>Password Reset</h1>
        </div>

                
              
        {/*Button*/}
        <div>
          <div className="p-3 pr-4 pl-4 rounded-md bg-[#6b8e23] text-[#ffffff] border-1 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:cursor-pointer"onClick={()=>handelReset()}>Reset Password</div>
        </div>


        <div className="text-white text-xl">    
          <p>{message}</p>
        </div>


      </div>

      </div>


    </div>

    </>
  );
}

export default ResetPassword