import styles from "./loginPage.module.css"
import {useState} from "react"
import GetServerPath from "../lib/GetServerPath.js"
import {storeJWT} from "../lib/JWT.js"
import axios from "axios"
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

type NewPassword = {
  token: string;
  newPassword: string;
};

type RetypedPassword = {
  token: string;
  newPassword: string;
};

function ResetPassword()
{
  const [message, setMessage] = useState("Please Enter A New Password");

  //const [error,setError] = useState("")
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newData,setNewData] = useState<NewPassword>({
    token: "",  
    newPassword:""
  })

    const [retypedData,setRetypedData] = useState<RetypedPassword>({
      token: "",
      newPassword:""
    })

  //const [inputErrorDisplay,setInputErrorDisplay] = useState({
  //  password:false
  //})


    const handelReset = async ()=>{
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$/;

      if (!passwordRegex.test(newData.newPassword)) {
        setMessage("Password must be at least 5 characters long and include a number and a symbol.");
        return;
      }
      
      if(!token || token?.length<=0 || token ==='')
      {
        setMessage("User Token Not Found");
        return;
      }

        let hasErrors= false;
        //setError("")
        
        // Reset all errors
        let tempInputErrorDisplay = {
          password:false
        }

        //Check input validation 
        if(newData.newPassword == "" || retypedData.newPassword == ""){
          tempInputErrorDisplay.password = true;
          hasErrors = true;
          setMessage("Invalid Password")
        }
        else if(!(newData.newPassword == retypedData.newPassword))
        {
          tempInputErrorDisplay.password = true;
          hasErrors = true;
          setMessage("Passwords Do Not Match ")
        }
        //setInputErrorDisplay({...tempInputErrorDisplay})
        if(hasErrors) return;
        
        //setMessage("No errors <3");
        
        // Completed Validation!
        try{

          let payload = {
            ...retypedData,
            token: token
          };
          
          setNewData(prev => ({...prev, token: token}));
          setRetypedData(prev => ({...prev, token: token}));

          //console.log("What is being passed:",retypedData);
          console.log("What is being passed:", payload);

          let response = await axios.post(`${GetServerPath()}/api/auth/reset-password`,
          {
            ...payload
          })
          

          // Succes
          if(response.status == 200){
            storeJWT(response.data.token)
            console.log(response.data)
            console.log(response)
            
            setMessage("Your password has been reset. You will be redirected to the login page momentarily.")
            setTimeout(()=>{navigate("/");},6000) //Bring you back to login page

            //navigate("/verify");
          }else{
            // Failure
            console.log(response.data)
            //setError(response.data.error)
          }

        }catch(e:any){
          console.log(e)
          //setMessage("Server Error | contact admin")
          setMessage(e.response.data.error)
          //setError("Server Error | contact admin")
          //setError(e.response.data.error)
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
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full ">
      

        <div className="bg-stone-800 bg-opacity-70 p-8 min-w-[40%] rounded-xl shadow-lg flex flex-col items-center gap-6">
           <div className="flex flex-col gap-1 w-[90%]">
                <div className="text-white font-bold">New Password</div>
                <input type="password" onChange={(e)=>setNewData((oldData)=> ({ ...oldData , newPassword: e.target.value}))} placeholder="xxxxxxxxxxxxx" className="bg-white border border-gray-400 rounded-sm h-10 pl-5" />           
            </div>

            <div className="flex flex-col gap-1 w-[90%]">
                <div className="text-white font-bold">Re-Type Password</div>
                <input type="password" onChange={(e)=>setRetypedData((oldData)=> ({ ...oldData, newPassword: e.target.value}))} placeholder="xxxxxxxxxxxxx" className="bg-white border border-gray-400 rounded-sm h-10 pl-5" />
                           
            </div>
            <div className="text-sm text-gray-100">Password should have atleast 5 characters including a number and a symbol (!,@ etc)</div>

            <div className="text-white text-xl">
              <h1>Password Reset</h1>
            </div>
            <div>{}</div>
                    
                  
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