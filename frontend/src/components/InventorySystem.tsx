// import styles from "./styles/loginModal.module.css"
import {useEffect, useState} from "react"
import axios from "axios"
import GetServerPath from "../lib/GetServerPath.ts"
import { storeJWT, fetchJWT } from "../lib/JWT.ts"
import { useNavigate } from 'react-router-dom';
import styles from "./styles/InventorySystem.module.css"

function InventorySystem({onClose}:{onClose:()=>void;}){
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const token = fetchJWT(); // Assuming this retrieves token from localStorage
      const res = await axios.get(`${GetServerPath()}/api/auth/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      storeJWT(res.data.token)
    } catch (err:any) {
      console.error("Error fetching inventory:", err);
      // Optional: redirect to login if 401
      if (err.response?.status === 401 || err.response?.status === 403) {
        // navigate('/');
      }
    }
  };

  useEffect(()=>{
    fetchItems()
  },[])
 
  return(
    <div className="w-full h-full bg-gray-800 p-10 rounded-t-lg flex flex-col">

      <div className="flex gap-5 flex-1">

        {/* Left Inventory */}
        <div className="flex-1 bg-gray-700 rounded-t-lg p-2">
          {/* Header Text */}
          <div className="flex items-center justify-center bg-gray-600 p-2 rounded-lg">
            <div className="white text-2xl font-bold text-white text-center">Inventory</div>
          </div>
        </div>

        {/* Middle Player Data */}
        <div className="flex-1 bg-gray-700 rounded-t-lg p-2">
          {/* Header Text */}
          <div className="flex items-center justify-center bg-gray-600 p-2 rounded-lg">
            <div className="white text-2xl font-bold text-white text-center">Character</div>
          </div>

        </div>

        {/* Right Stats */}
        <div className="flex-1 bg-gray-700 rounded-t-lg p-2">
          {/* Header Text */}
          <div className="flex items-center justify-center bg-gray-600 p-2 rounded-lg">
            <div className="white text-2xl font-bold text-white text-center">Stats</div>
          </div>

        </div>
      </div>
      
    </div>
  )
}

export default InventorySystem
