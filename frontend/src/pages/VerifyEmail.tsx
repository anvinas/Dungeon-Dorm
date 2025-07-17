// // import styles from "./styles/loginModal.module.css"
// import {useState} from "react"
// import GetServerPath from "../lib/GetServerPath.ts"
// import {storeJWT} from "../lib/JWT.ts"
// import axios from "axios"
// import { useNavigate } from 'react-router-dom';


// function VerifyEmail() {

//   const navigate = useNavigate();

//   const confirmEmail= async ()=>
//   {

//   }
//   return (
//     <div className="z-4 absolute bg-[#000000db] flex justify-center items-center w-screen h-screen overflow-hidden ">
//       <div className="bg-white rounded-lg shadow-md min-w-[30%]">
//           {/* Header */}
//           <div className="flex justify-between bg-blue-400 rounded-t-lg  p-5">
//             <div className="font-semibold text-2xl text-white">Signup</div>
//             <div className="font-semibold text-2xl text-white hover:cursor-pointer hover:text-red-300" onClick={()=>onClickClose()}>X</div>
//           </div>
//           <div className="p-10 flex flex-col gap-3">
              
//               {/* First Name */}
//               <div className="flex flex-col gap-1">
//                 <div className="font-bold">gamerTag</div>
               
                
//               </div>
             

//               {/* Error Msg */}
//               <div className="text-red-500">{error==null ? "":error}</div>
//           </div>

//           {/* Footer */}
//           <div className="flex justify-between border-t-1 border-gray-200 p-5"> 
//               <div></div>
//               <div className="flex gap-3">
//                   <div className="p-5 pt-3 pb-3 rounded-md bg-green-400 hover:bg-green-500 hover:cursor-pointer" onClick={()=>confirmEmail()}>Login</div>
//               </div>
//           </div>
//       </div>
//     </div>
 
//   )
// }

// export default VerifyEmail
