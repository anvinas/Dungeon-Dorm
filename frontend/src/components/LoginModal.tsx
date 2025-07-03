// import styles from "./styles/loginModal.module.css"
import {useState,useEffect} from "react"

function LoginModal() {
  const [error,setError] = useState(null)

  return (
    <div className="z-4 absolute bg-[#000000db] flex justify-center items-center w-screen h-screen overflow-hidden ">
      <div className="bg-white rounded-lg shadow-md min-w-[40%]">
          {/* Header */}
          <div className="font-semibold text-2xl rounded-t-lg p-5 bg-blue-400 text-white">Login</div>
          <div className="p-10 flex flex-col gap-5">
              {/* First Name */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">First Name</div>
                <input placeholder="Johnathon" className="border border-gray-400 rounded-sm h-10  pl-5" />
              </div>
              {/* Last Name */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">Last Name</div>
                <input placeholder="Green" className="border border-gray-400 rounded-sm h-10  pl-5" />
              </div>
              {/* Email */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">Email</div>
                <input placeholder="john@domain.com" className="border border-gray-400 rounded-sm h-10 pl-5" />
              </div>

              {/* Error Msg */}
              <div>{error==null ? "":error}</div>
          </div>

          {/* Footer */}
          <div className="flex justify-between border-t-1 border-gray-200 p-5"> 
              <div></div>
              <div className="flex gap-3">
                  <div className="p-5 pt-3 pb-3 rounded-md bg-green-400 hover:bg-green-500 hover:cursor-pointer">Login</div>
              </div>
          </div>
      </div>
    </div>
 
  )
}

export default LoginModal
