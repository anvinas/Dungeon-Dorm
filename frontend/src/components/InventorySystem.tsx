// import styles from "./styles/loginModal.module.css"
import {useEffect, useState} from "react"
import axios from "axios"
import GetServerPath from "../lib/GetServerPath.ts"
import { storeJWT, fetchJWT } from "../lib/JWT.ts"
import { useNavigate } from 'react-router-dom';

interface InventoryItem {
  _id: string;
  name: string;
  healthAmount?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

function InventorySystem(){
    
  const fetchItems = async () => {
    try {
      const token = fetchJWT(); // Assuming this retrieves token from localStorage
      const res = await axios.get(`${GetServerPath()}/api/auth/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItems(res.data);
      console.log(res.data)
    } catch (err:any) {
      console.error("Error fetching inventory:", err);
      // Optional: redirect to login if 401
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  useEffect(()=>{
    fetchItems()
  },[])
 
  const navigate = useNavigate();
  const [items,setItems] = useState<InventoryItem[]>([])
  const [search,setSearch] = useState("")
  const [showAddModal,setShowAddModal] = useState(false)
  const [createError,setCreateError] = useState("")
  const [newItemData,setNewItemData] = useState({
    name:"",
    healthAmount:0,
    description:"",
    showHealth:false
  })

  let filteredItems:InventoryItem[] = []
  if(search.length > 0){
      // 🔎 Filter based on search
      filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
  }

  const createItem = async () => {
    try {
      const token = fetchJWT(); // Assuming this retrieves token from localStorage
      const res = await axios.post(`${GetServerPath()}/api/auth/inventory`, newItemData,{
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      setShowAddModal(false)
      setItems(prevItems => [...prevItems, res.data]); 
    } catch (err:any) {
      console.error("Error fetching inventory:", err);
      setCreateError("Error creating item")
      // Optional: redirect to login if 401
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  return (
    <div className="relative w-full h-full shadow-lg rounded-sm bg-[#09122cfc] text-white">

      {/* MODAL */}
      {showAddModal &&
        <div className="absolute top-[50%] left-[50%] w-[60%] h-fit pb-20 translate-[-50%] bg-white text-black">
            <div className="flex justify-between w-full text-center font-bold text-3xl  bg-[#322945] p-3 text-white">
              <div>Add Item</div>
              <div className="text-3xl hover:cursor-pointer" onClick={()=>setShowAddModal(false)}>X</div>
            </div>

            <div className="p-10 flex flex-col gap-3">
              {/* Inputs */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">Item Name:</div>
                <input  onChange={(e)=>setNewItemData((oldData)=>{oldData.name = e.target.value; return oldData})} placeholder="Enter item name" className="border border-gray-400 rounded-sm h-10  pl-5" />
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">Item Description:</div>
                <input   onChange={(e)=>setNewItemData((oldData)=>{oldData.description = e.target.value; return oldData})} placeholder="Enter item description" className="border border-gray-400 rounded-sm h-10  pl-5" />
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-1">
                <div className="font-bold">Item Name:</div>
                <input  onChange={(e)=>setNewItemData((oldData)=>{oldData.healthAmount = Number(e.target.value); return oldData})} type="number"className="border border-gray-400 rounded-sm h-10  pl-5" />
              </div>
            </div>
            <div className="flex px-10">
              <div className="p-2 w-fit rounded-sm bg-[#872341] hover:cursor-pointer hover:bg-[#691931] items-center flex justify-center text-white" onClick={()=>createItem()}>Create Item</div>
              <div className="text-red-400 text-md my-1">{createError}</div>
            </div>
        </div>
      }
      

      <div className="w-full text-center font-bold text-3xl  bg-[#872341] p-3">Inventory System</div>
      
      {/* Add Buttuon */}
      <div className="flex w-full justify-between mt-2 p-5 pb-3">
        <div></div>
        <div className="p-2 rounded-sm bg-[#872341] hover:cursor-pointer hover:bg-[#691931] items-center flex justify-center" onClick={()=>setShowAddModal(true)}>Add New Item</div>
      </div>

      {/* \Searchbar container */}
      <div className="pl-5 pr-5">
          <div className="">Search Item:</div>
          <input onChange={(e)=>setSearch(e.target.value)} className="w-full h-10 bg-white border-1 rounded-sm text-black pl-3" placeholder="Enter Item name" />
      </div>

      {/* Display Filtered Items */}
      <div className="px-5 overflow-y-auto max-h-[500px]">
        {filteredItems.length === 0 ? (
          <p className="text-gray-400">No items match your search.</p>
        ) : (
          filteredItems.map(item => (
            <div key={item._id} className=" p-2 bg-[#571f30] rounded-lg  mb-2 hover:bg-[#7d233e] hover:cursor-pointer">
              <div className="font-semibold ">{item.name}</div>
              <div className="text-sm text-gray-300">{item.description}</div>
              {item.healthAmount > 0 && (
                <div className="text-green-400 text-sm">+{item.healthAmount} HP</div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
    
  )
}

export default InventorySystem
