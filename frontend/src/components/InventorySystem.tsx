// import styles from "./styles/loginModal.module.css"
import {useEffect, useState} from "react"
import axios from "axios"
import GetServerPath from "../lib/GetServerPath.ts"
import { storeJWT, fetchJWT } from "../lib/JWT.ts"
import { useNavigate } from 'react-router-dom';
import styles from "./styles/InventorySystem.module.css"

interface InventoryItem {
  _id: string;
  name: string;
  healthAmount?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

function InventorySystem({onClose}:{onClose:()=>void;}){
    
  const fetchItems = async () => {
    try {
      const token = fetchJWT(); // Assuming this retrieves token from localStorage
      const res = await axios.get(`${GetServerPath()}/api/auth/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItems(res.data);
      storeJWT(res.data.token)
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
  // const [showAddModal,setShowAddModal] = useState(false)
  // const [createError,setCreateError] = useState("")
  // const [newItemData,setNewItemData] = useState({
  //   name:"",
  //   healthAmount:0,
  //   description:"",
  //   showHealth:false
  // })

  // const createItem = async () => {
  //   try {
  //     const token = fetchJWT(); // Assuming this retrieves token from localStorage
  //     const res = await axios.post(`${GetServerPath()}/api/auth/inventory`, newItemData,{
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       },
  //     });
  //     setShowAddModal(false)
  //     setItems(prevItems => [...prevItems, res.data]); 
  //   } catch (err:any) {
  //     console.error("Error fetching inventory:", err);
  //     setCreateError("Error creating item")
  //     // Optional: redirect to login if 401
  //     if (err.response?.status === 401 || err.response?.status === 403) {
  //       navigate('/login');
  //     }
  //   }
  // };

  // Divide into categories
  const consumables = items.filter(item => item.healthAmount && item.healthAmount > 0);
  const otherItems = items.filter(item => !item.healthAmount || item.healthAmount <= 0);

  // Ensure fixed slot lengths
  const paddedConsumables: (InventoryItem | null)[] = [...consumables.slice(0, 5)];
  while (paddedConsumables.length < 5) paddedConsumables.push(null);

  const paddedOtherItems: (InventoryItem | null)[] = [...otherItems.slice(0, 15)];
  while (paddedOtherItems.length < 15) paddedOtherItems.push(null);


  return (
    <div className="flex flex-col relative w-full h-full shadow-lg rounded-sm bg-[#f8bd7e] text-white border-10 border-[#b56c34] p-4 z-4">
      <div className="absolute top-[-3%] left-[50%] translate-[-50%] bg-[#95a0ba] px-10 py-2 border-2 border-[#afb5c4] rounded-lg">
        <div onClick={()=>onClose()} className={`text-[#535f6c] font-bold text-3xl ${styles.font}`}>Inventory</div>
      </div>

      {/* Collections */}
      <div className="mb-1 flex-1 flex flex-col gap-5">
        <InventoryCollectionConsumables itemsList={paddedConsumables} />
        <InventoryCollectionItems itemsList={paddedOtherItems}/>
      </div>
    </div>
  )
}

export default InventorySystem

interface InventoryCollectionProps {
  itemsList: (InventoryItem | null)[];
}


const InventoryCollectionConsumables = ({itemsList}:InventoryCollectionProps)=>{
  return(
    <div className="flex flex-col bg-[#eec399] border-2 border-[#bf834a] p-3 rounded-lg">
      <div>
      <div className={`text-center font-bold text-2xl text-[#4b2f15] ${styles.font}`}>~ Consumables ~</div>
        <div className="text-center font-bold text-xl text-[#4b2f15]">= = = =</div>
      </div>
      
      {/* Slots */}
      <div className="flex gap-4 mt-2">
        {itemsList.map((itemData,i)=>{
          return(
            <div key={i} className="w-[3.5vw] h-[3.5vw] aspect-square bg-[#fabe82] border-3 border-[#cd9159] rounded-sm">
              {itemData?.name != "Mini Health Potion" ?
                <div className="text-sm text-black">{itemData ? itemData.name : ""}</div> :
                <img className="w-[3.5vw] h-[3.5vw] aspect-square" src="/assets/inventoryItem/health_mini.png"/>
              }
            </div>
          )
        })}
        
      </div>
    </div>
  )
}

const InventoryCollectionItems = ({itemsList}:InventoryCollectionProps)=>{
  return(
    <div className="flex flex-col bg-[#eec399] border-2 border-[#bf834a] flex-1 p-3 rounded-lg">
      <div>
      <div className={`text-center font-bold text-2xl text-[#4b2f15] ${styles.font}`}>~ Items ~</div>
        <div className="text-center font-bold text-xl text-[#4b2f15]">= = = =</div>
      </div>
      
      {/* Slots */}
      <div className="flex gap-4 mt-2 flex-wrap">
        {itemsList.map((itemData,i)=>{
          return(
            <div key={i} className="w-[3.5vw] h-[3.5vw] aspect-square bg-[#fabe82] border-3 border-[#cd9159] rounded-sm">
                <div className="text-sm text-black">{itemData ? itemData.name : ""}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}