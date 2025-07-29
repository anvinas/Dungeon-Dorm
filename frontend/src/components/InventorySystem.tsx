// import styles from "./styles/loginModal.module.css"
import {useEffect, useState} from "react"
import axios from "axios"
import GetServerPath from "../lib/GetServerPath.ts"
import { storeJWT, fetchJWT } from "../lib/JWT.ts"
import { useNavigate } from 'react-router-dom';
import {type UserProfile_T, type UserStats,type InventoryItem_T } from "../lib/types.ts"
import { useMediaQuery } from 'react-responsive';

import styles from "./styles/InventorySystem.module.css"


function InventorySystem({onClose,onHealthChange}:{onClose:()=>void;onHealthChange:(newHealth:number)=>void;}){
  const navigate = useNavigate();

  const [userData,setUserData] = useState<UserProfile_T | null >(null)
  const [itemShopList,setItemShopList] = useState<InventoryItem_T[]>([])
  const [isUsingItem,setIsUsingItem] = useState<InventoryItem_T | null> (null)

  const [isShopOpen,setIsShopOpen] = useState<Boolean> (false)
  const [purchasingItem,setPurchasingItem] = useState<InventoryItem_T | null> (null)
  const [buyError,setBuyError] = useState<string> ("")
  const [useItemError,setUseItemError] = useState<string> ("")

  const [itemsSeperatedObj, setItemsSeperatedObj] = useState({
    weapons: [] as { quantity: number; item: InventoryItem_T }[],
    potions: [] as { quantity: number; item: InventoryItem_T }[],
    keys: [] as { quantity: number; item: InventoryItem_T }[],
  });


  const handleCreatePaddingForItems = (CurrentLoot:any)=>{
    let tempSeperated:{
    weapons:{quantity:number;item:InventoryItem_T}[];
    potions:{quantity:number;item:InventoryItem_T}[];
    keys:{quantity:number;item:InventoryItem_T}[]
    } = {
      weapons:[],
      potions:[],
      keys:[],
    }

    for(let item of CurrentLoot){
      if(item.itemId.itemType == "Weapon"){
        tempSeperated.weapons.push({quantity:item.quantity,item:item.itemId})
      }
      else if(item.itemId.itemType == "Potion"){
        tempSeperated.potions.push({quantity:item.quantity,item:item.itemId})
      }else{
        tempSeperated.keys.push({quantity:item.quantity,item:item.itemId})
      }
    }

    // Fill blanks if needed
    for(let i=0;i<5;i++){
      // Weapon
      if(i==0 && tempSeperated.weapons.length==0){
        tempSeperated.weapons.push({quantity:0,item:FAKEITEM})
      }
      
      if(!tempSeperated.keys[i]){
        tempSeperated.keys.push({quantity:0,item:FAKEITEM})
      }

      if(i<4 && !tempSeperated.potions[i] ){
        tempSeperated.potions.push({quantity:0,item:FAKEITEM})
      }
    }
    setItemsSeperatedObj({...tempSeperated})
  }

  const fetchUserData = async () => {
    try {
      const token = fetchJWT(); 
      const res = await axios.get(`${GetServerPath()}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      storeJWT(res.data.token)
      setUserData(res.data.userProfile)
      console.log(res.data.userProfile)
      handleCreatePaddingForItems(res.data.userProfile.CurrentLoot)
      
    } catch (err:any) {
      console.error("Error fetching userData:", err);
      // Optional: redirect to login if 401
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/');
      }
    }
  };

  const fetchItemShop = async () => {
    try {
      const token = fetchJWT(); // Assuming this retrieves token from localStorage
      const res = await axios.get(`${GetServerPath()}/api/auth/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setItemShopList(res.data);
      storeJWT(res.data.token)
    } catch (err:any) {
      console.error("Error fetching inventory:", err);
      // Optional: redirect to login if 401
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/');
      }
    }
  };

  const handleCountRealItems = (arr:{quantity:number,item:InventoryItem_T}[])=>{
    let count =0
    for(let itemData of arr){
      if(itemData.item.itemType!="fake"){
        count++;
      }
    }
    return count
  }
  useEffect(()=>{
    fetchUserData()
    fetchItemShop()
  },[])
  

  if(!userData) return(<div>Loading</div>)
  const AllStatsKey = Object.keys(userData.currentStats)
  let largestStatNumber = 0
  for(let statKey of AllStatsKey){
    const value = userData.currentStats[statKey as keyof UserStats];
    if(value>largestStatNumber) largestStatNumber = value
  }

  const handlePopupDeleteModal = async()=>{
    const answer = confirm("Are you sure you want to delete your character?")
    if(answer){
      try {
        const token = fetchJWT(); // Assuming this retrieves token from localStorage
        const res = await axios.post(`${GetServerPath()}/api/user/delete-user-progress`,{}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        navigate('/');
      } catch (err:any) {
        console.error("Error buying item:", err)
        setBuyError(err.response.data.error || "Server Error")
        // Optional: redirect to login if 401
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/');
        }
      }
    }
  }


  const handlePopupLogoutModal = async()=>{
    const answer = confirm("Are you sure you want to logout?")
    if (answer) {
      localStorage.removeItem('jwt'); // Remove token
      navigate("/")
    }
  }

  const handleBuyItem = async(itemData:InventoryItem_T,quantity:number,price:number)=>{
    setBuyError("")
    // If buying weapon
    if(itemData.itemType =="Weapon"){
      if(handleCountRealItems(itemsSeperatedObj.weapons)>=1){
        setBuyError("Weapon slot is already used")
        return;
      }
    }

    if(itemData.itemType =="Potion"){
      if(handleCountRealItems(itemsSeperatedObj.potions)>=3){

        // Check if buying an already existing slot item
        let allowBuy = false
        for(let i=0;i<3;i++){
          if(itemsSeperatedObj.potions[i].item._id == itemData._id){
           allowBuy = true
           break
          }
        }

        if(!allowBuy){
          setBuyError("All potion slots are full")
          return;
        }
      }
    }

    if(itemData.itemType =="Key"){
      return
    }

    try {
      const token = fetchJWT(); // Assuming this retrieves token from localStorage
      const res = await axios.post(`${GetServerPath()}/api/user/purchase-item`,{itemId:itemData._id,quantity,price}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      handleCreatePaddingForItems(res.data.user.CurrentLoot)
      setIsShopOpen(false)
      storeJWT(res.data.token)
      try{
        setUserData(old => {
          if (!old) return old; // Or you can throw or handle it differently
          return {
            ...old,
            currency: res.data.user.currency,
          };
        });
      }catch{}
      

    } catch (err:any) {
      console.error("Error buying item:", err)
      setBuyError(err.response.data.error || "Server Error")
      // Optional: redirect to login if 401
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/');
      }
    }

  }

  const handleUseItem = async(itemData:InventoryItem_T)=>{
    setUseItemError("")
    if(itemData.itemType!="Potion"){
      setUseItemError("Cannot use Item")
    }

    try {
      const token = fetchJWT(); // Assuming this retrieves token from localStorage
      const res = await axios.post(`${GetServerPath()}/api/user/use-item`,{itemId:itemData._id}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(res.data)
      handleCreatePaddingForItems(res.data.user.CurrentLoot)
      setIsUsingItem(null)
      storeJWT(res.data.token)

      // Update UI
      let tempUser = {...userData}
      tempUser.currentHP = res.data.user.currentHP;
      setUserData({...tempUser});
      onHealthChange(res.data.user.currentHP)

    } catch (err:any) {
      console.error("Error using item:", err)
      setBuyError(err.response.data.error || "Server Error")
      // Optional: redirect to login if 401
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/');
      }
    }

  }

  const userHealthPercentage = (userData.currentHP/userData.maxHP)*100 
  const userXPPercentage = Math.min(100,(userData.currentXP/(userData.currentXP + userData.toLevelUpXP))*100 )
  return(
    <div className={`${styles.container} w-full max-h-full h-full bg-gray-800 p-5 rounded-t-lg flex flex-col gap-2`}>
      <div className="text-center font-bold text-white text-2xl bg-red-400 px-5 py-2 rounded-lg cursor-pointer hover:bg-red-500" onClick={()=>onClose()}>Close</div>
      
        <div className="flex gap-5 flex-col md:flex-row overflow-auto md:flex-1 md:overflow-visible max-h-[100vh]">
          
          {/* Left Inventory */}
          {(!isUsingItem || isUsingItem.itemType=="fake") && 
            <div className="flex-1 bg-gray-700 rounded-t-lg p-2 gap-3 flex flex-col">
              {/* Header Text */}
              <div className="flex items-center justify-center bg-gray-600 p-2 rounded-lg">
                <div className="white text-2xl font-bold text-white text-center">Inventory</div>
              </div>

              <div className="flex flex-col flex-1 justify-center gap-5">
                <div className="flex flex-col gap-2">
                  <div className="font-bold text-2xl text-white bg-gray-800 px-2 rounded-sm">Boss Keys</div>
                  <div className="flex items-center justify-center w-full gap-5">
                    <ItemState onClick={()=>{}} size="3vw" itemSize="2vw"   display="bottom" bg="#1e2939" itemData={itemsSeperatedObj.keys[0].item} showQuantity={false} quantity={itemsSeperatedObj.keys[0].quantity}/>
                    <ItemState onClick={()=>{}} size="3vw" itemSize="2vw"  display="bottom" bg="#1e2939" itemData={itemsSeperatedObj.keys[1].item} showQuantity={false} quantity={itemsSeperatedObj.keys[1].quantity}/>
                    <ItemState onClick={()=>{}} size="3vw" itemSize="2vw"  display="bottom" bg="#1e2939" itemData={itemsSeperatedObj.keys[2].item} showQuantity={false} quantity={itemsSeperatedObj.keys[2].quantity}/>
                    <ItemState onClick={()=>{}} size="3vw" itemSize="2vw"  display="bottom" bg="#1e2939" itemData={itemsSeperatedObj.keys[3].item} showQuantity={false} quantity={itemsSeperatedObj.keys[3].quantity}/>
                    <ItemState onClick={()=>{}} size="3vw" itemSize="2vw"   display="bottom" bg="#1e2939" itemData={itemsSeperatedObj.keys[4].item} showQuantity={false} quantity={itemsSeperatedObj.keys[4].quantity}/>
                  </div>
                </div>

                <div className="flex flex-col flex-1 justify-center">
                  <div className="font-bold text-2xl text-white bg-gray-800 px-2 rounded-sm mb-2">Potions</div>
                  {/* Top Items */}
                  <div className="flex items-center justify-center w-full gap-5">
                    <ItemState onClick={()=>setIsUsingItem(itemsSeperatedObj.potions[0].item)} size="5vw" itemSize="3vw" display="bottom" bg="#1e2939" itemData={itemsSeperatedObj.potions[0].item} showQuantity={true} quantity={itemsSeperatedObj.potions[0].quantity}/>
                  </div>

                  {/* Bottom Items */}
                  <div className="flex items-center justify-center w-full gap-5">
                    <ItemState onClick={()=>setIsUsingItem(itemsSeperatedObj.potions[1].item)} size="5vw" itemSize="3vw"  display="bottom" bg="#1e2939" itemData={itemsSeperatedObj.potions[1].item} showQuantity={true} quantity={itemsSeperatedObj.potions[1].quantity}/>
                    <ItemState onClick={()=>setIsUsingItem(itemsSeperatedObj.potions[2].item)} size="5vw" itemSize="3vw"  display="bottom" bg="#1e2939" itemData={itemsSeperatedObj.potions[2].item} showQuantity={true} quantity={itemsSeperatedObj.potions[2].quantity}/>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between w-full gap-5 flex-0">
                  {/* Current Weapon */}
                  <div className="flex flex-col items-center justify-center" >
                    {itemsSeperatedObj.weapons.length==0 && <div className={`h-3vw w-3vw bg-teal-500 rounded-[50%] p-3 hover:p-2 hover:cursor-pointer`}></div>}
                    {itemsSeperatedObj.weapons.length>0 && <ItemState onClick={()=>{}} showQuantity={false} quantity={1} size="4vw" itemSize="3vw" display="top" bg="#008585" itemData={itemsSeperatedObj.weapons[0].item}/>}
                    <div className="font-bold text-white text-xl">Weapon</div>
                  </div>


                  {/* Shop button */}
                  <div className="flex items-center">
                    <div className="text-yellow-500 font-bold text-4xl">${userData.Currency}</div>
                    <div className="flex flex-col items-center justify-center" onClick={()=>setIsShopOpen(!isShopOpen)}>
                      <div className={`h-20 w-20 ${isShopOpen?"bg-red-800":"bg-gray-800"} rounded-[50%] p-3 hover:p-2 hover:cursor-pointer`}>
                          <img className="h-full w-full" src="/assets/shopIcon.png"/>
                      </div>
                      <div className="font-bold text-white text-xl">{isShopOpen?"Close":"Open"} Shop</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          }
          {isUsingItem && isUsingItem.itemType !=="fake" &&
            <UsingItemScreen itemData={isUsingItem} onPressBack={()=>{setIsUsingItem(null);setUseItemError("")}} onClickUse={(itemData)=>handleUseItem(itemData)} error={useItemError}/>
          }


          {/* Middle Player Data */}
          {!isShopOpen &&
            <div className="flex-1 bg-gray-700 rounded-t-lg p-2 gap-3 flex flex-col">
              {/* Header Text */}
              <div className="flex items-center justify-center bg-gray-600 p-2 rounded-lg">
                <div className="white text-2xl font-bold text-white text-center">Character</div>
              </div>

              {/* Middle Main */}
              <div className="flex flex-col flex-1">
                <div className="text-center text-white font-bold capitalize text-lg">{userData.gamerTag}</div>
                {/* Image takes up remaining space */}
                <div className="flex-1 flex items-center justify-center overdlow-y-auto">
                  <img
                    className={`${styles.pixelImage} w-[40%] object-contain`}
                    src={`/assets/playableCharacter/${userData.Character.class.toLowerCase()}/pixel.png`}
                    alt="Character"
                  />
                </div>
                {/* HP CONTAINER */}
                <div className="flex flex-col gap-2">
                  <div className="text-xl text-white font-bold">HP: {userData.currentHP} / {userData.maxHP}</div>
                  <div className={`relative top-[-10%] w-[100%] h-5 border-2 bg-[#697284e3]  rounded-md`}>
                      <div 
                        className={`
                          absolute h-full rounded-lg
                          ${userHealthPercentage>75?"bg-green-400":userHealthPercentage>35?"bg-yellow-400":"bg-red-400"}
                        `} 
                        style={{ width: `${userHealthPercentage}%` }}>
                      </div>
                    </div>
                </div>
                {/* XP CONTAINER */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="text-xl text-white font-bold">Level: {userData.level} --</div>
                    <div className="text-xl text-white font-bold">XP: {userData.currentXP} / {(userData.currentXP + userData.toLevelUpXP)}</div>
                  </div>
                  <div className={`relative top-[-10%] w-[100%] h-5 border-2 bg-[#697284e3]  rounded-md`}>
                      <div 
                        className={`
                          absolute h-full rounded-lg
                          bg-blue-400
                        `} 
                        style={{ width: `${userXPPercentage}%` }}>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          }

          {/* SHOP */}
          {isShopOpen && !purchasingItem &&
            <div className="flex-1 bg-gray-700 rounded-t-lg p-2 gap-3 flex flex-col">
              {/* Header Text */}
              <div className="flex items-center justify-center bg-gray-600 p-2 rounded-lg">
                <div className="white text-2xl font-bold text-white text-center">Item Shop</div>
              </div>

              {/* Middle Main */}
              <div className="flex flex-col flex-1 gap-5">

                {/* Weapons */}
                <div className="w-full bg-gray-600 p-2 rounded-md flex-1  flex flex-col gap-2">
                  <div className="font-bold text-2xl text-white bg-green-800 px-2 rounded-lg">Weapons</div>
                  <div className="flex flex-wrap gap-5">
                    {itemShopList.map((itemData,i)=>{
                      if(!itemData.imageURL || (itemData.itemType !== "Weapon")) return(<></>)
                      return(
                        <ItemState key={`item_${i}`} onClick={()=>setPurchasingItem(itemData)} showQuantity={false} quantity={1} size={"3vw"} itemSize="2vw" bg="#1e2939" display="bottom"  itemData={itemData}/>
                      )
                    })}
                  </div>
                </div>
                
                {/* Potions */}
                <div className="w-full bg-gray-600 p-2 rounded-md flex-1 flex flex-col gap-2">
                  <div className="font-bold text-2xl text-white bg-purple-800 px-2 rounded-lg">Potions</div>
                  <div className="flex flex-wrap gap-5">
                    {itemShopList.map((itemData,i)=>{
                      if(!itemData.imageURL || (itemData.itemType !== "Potion")) return(<></>)
                      return(
                        <ItemState key={`item_${i}`} onClick={()=>setPurchasingItem(itemData)} showQuantity={false} quantity={1} size="3vw" itemSize="2vw" bg="#1e2939" display="bottom" itemData={itemData}/>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          }
          {isShopOpen && purchasingItem &&
            <PurchaseItemScreen itemData={purchasingItem} onPressBack={()=>{setPurchasingItem(null);setBuyError("")}} onClickBuy={(itemData,quantity,price)=>handleBuyItem(itemData,quantity,price)} error={buyError}/>
          }

          {/* Right Stats */}
          <div className="flex-1 bg-gray-700 rounded-t-lg p-2 gap-3 flex flex-col">
            {/* Header Text */}
            <div className="flex items-center justify-center bg-gray-600 p-2 rounded-lg">
              <div className="white text-2xl font-bold text-white text-center">Stats</div>
            </div>

            {/* Right Main */}
            <div className="flex flex-col flex-1 gap-2 p-3 w-[80%]">
              {AllStatsKey.map((statKey,i)=>{
                const value = userData.currentStats[statKey as keyof UserStats];
                let percentage = (value /largestStatNumber) * 100
                percentage = percentage == 0?5:percentage
                return(
                  <div key={`stat_${i}`}  className="flex flex-col gap-2">
                    
                    <div className="font-bold uppercase text-white">{statKey} : {value}</div>

                    <div className={`relative top-[-10%] w-[100%] h-5 border-2 bg-[#697284e3]  rounded-lg`}>
                      <div 
                        className={`
                          absolute h-full rounded-lg
                          bg-${i==0?"red":i==1?"blue":i==2?"orange":i==3?"green":i==4?"red":"red"}-400
                        `} 
                        style={{ width: `${percentage}%` }}>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="flex justify-between gap-4">
              <div className="w-full bg-blue-600 rounded text-center hover:bg-blue-800 cursor-pointer text-white font-bold py-2" onClick={()=>handlePopupLogoutModal()}>Logout</div>
              <div className="w-full bg-red-600 rounded text-center hover:bg-red-800 cursor-pointer text-white font-bold py-2" onClick={()=>handlePopupDeleteModal()}>Delete Character</div>
            </div>
           

            {/* {isTryingToDelete && 
              <div className="flex flex-col gap-2">
                <div className="text-center text-white font-bold">Are you sure you you want to delete? Your Entire Data will be wiped!</div>
                <div className="flex items-center justify-around">
                    <div className="w-[20%] px-4 py-2 bg-green-400 hover:bg-green-500 font-bold rounded text-center cursor-pointer" onClick={()=>setIsTryingDelete(false)}>Cancel</div>
                    <div className="w-[20%] px-4 py-2 bg-red-400 hover:bg-red-500 font-bold rounded text-center cursor-pointer">Delete</div>
                </div>
              </div>
            } */}

          </div>
        </div>
      
      
    </div>
  )
}


export default InventorySystem


const ItemState = ({itemData,display,bg,size,itemSize,quantity,showQuantity,onClick}:{
  itemData:InventoryItem_T;
  display:"top"|"bottom";
  bg:string;
  size:string;
  itemSize:string;
  quantity:number;
  showQuantity:boolean;
  onClick:()=>void
})=>{
  const [isHover,setIsHover] = useState<Boolean>(false)
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const computedSize = isMobile ? "10vw" : size;
  const computedItemSize = isMobile ? "8vw" : itemSize;

  if(!itemData || !itemData.imageURL || itemData.itemType=="fake") return(
    <div className="relative flex flex-col justify-center items-center">
      <div className={`rounded-[50%] p-3 flex items-center justify-center hover:bg-gray-900 cursor-pointer`}
        style={{ width: `${computedSize}`, height: `${computedSize}`, backgroundColor: isHover ? '#111827' : bg }}
      >
         
      </div>
    </div>
  )

  return(
    <div onClick={()=>onClick()} onMouseEnter={()=>setIsHover(true)} onMouseLeave={()=>setIsHover(false)} className="relative flex flex-col justify-center items-center">
      {isHover && 
        <div 
          className={`absolute text-center text-white font-bold capitalize text-lg z-10`}
          style={{transform: `translateY(${display === "top" ? "-" : ""} 120%)`}}
        >{itemData.name}</div>
      }
      {showQuantity &&
        <div 
          className={`absolute left-[70%] p-3 flex items-center justify-center border-1 border-black text-center text-white font-bold capitalize text-xs z-5 bg-blue-600 rounded-[50%] h-[1vw] w-[1vw]`}
          style={{[display === "top" ? "bottom" : "top"]: "-5%"}}
        >
          <div>x{quantity}</div>
        </div>
      }
      <div className={`rounded-[50%] p-2 flex items-center justify-center hover:bg-gray-900 cursor-pointer`}
          style={{ width: `${computedSize}`, height: `${computedSize}`, backgroundColor: isHover ? '#111827' : bg }}
          
      >
          <img
            className={`object-contain`}
            style={{ width: `${computedItemSize}`, height: `${computedItemSize}`}}
            src={`/assets/item${itemData.imageURL}.png`}
            alt={itemData.name}
          />
      </div>
    </div>
  )
}


const UsingItemScreen  = ({itemData,onClickUse,onPressBack,error}:
  {
    itemData:InventoryItem_T;
    onClickUse:(itemData:InventoryItem_T)=>void;
    onPressBack:()=>void;
    error:string;
  }
)=>{
  const [quantity, setQuantity] = useState(1);
  const price = (1 || 0) * quantity;

  return(
    <div className="flex-1 bg-gray-700 rounded-t-lg p-2 gap-3 flex flex-col">
      {/* Header Text */}
      <div className="flex items-center justify-center bg-gray-600 p-2 rounded-lg">
        <div className="white text-2xl font-bold text-white text-center">Purchase Item</div>
      </div>

      {/* Middle Main */}
      <div className="flex flex-col flex-1 gap-5">
        <div className="flex flex-col flex-1">
          <div className="text-center text-white font-bold capitalize text-lg">
            {itemData.name}
          </div>
          <div className="text-center text-white font-semibold capitalize text-sm">
            {itemData.description}
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center">
            <img
              className={`${styles.pixelImage} h-[60%] max-w-full object-contain`}
              src={`/assets/item${itemData.imageURL}.png`}
              alt={itemData.name}
            />
          </div>
        </div>

        {/* Use Button */}
        <div className="w-full flex justify-center gap-3">
          <button
            className="bg-red-600 cursor-pointer hover:bg-red-700 text-white font-bold py-2 px-6 rounded shadow-lg transition-all duration-200 "
            onClick={() => onPressBack()}
          >Back</button>

          <button
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow-lg transition-all duration-200 "
            onClick={() => onClickUse(itemData)}
          >Use</button>
        </div>

        <div className="text-red-600 text-center">{error}</div>
      </div>
    </div>
  )
}


const PurchaseItemScreen = ({itemData,onClickBuy,onPressBack,error}:
  {
    itemData:InventoryItem_T;
    onClickBuy:(itemData:InventoryItem_T,quantity:number,price:number)=>void;
    onPressBack:()=>void;
    error:string;
  }
)=>{
  const [quantity, setQuantity] = useState(1);
  const basePrice = itemData.baseValue;
  const price = (basePrice|1) * quantity;

  return(
    <div className="flex-1 bg-gray-700 rounded-t-lg p-2 gap-3 flex flex-col">
      {/* Header Text */}
      <div className="flex items-center justify-center bg-gray-600 p-2 rounded-lg">
        <div className="white text-2xl font-bold text-white text-center">Purchase Item</div>
      </div>

      {/* Middle Main */}
      <div className="flex flex-col flex-1 gap-5">
        <div className="flex flex-col flex-1">
          <div className="text-center text-white font-bold capitalize text-lg">
            {itemData.name}
          </div>
          <div className="text-center text-white font-semibold capitalize text-sm">
            {itemData.description}
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center">
            <img
              className={`${styles.pixelImage} h-[60%] max-w-full object-contain`}
              src={`/assets/item${itemData.imageURL}.png`}
              alt={itemData.name}
            />
          </div>

          {/* Quantity & Price */}
          <div className="flex flex-col items-center gap-2 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">Quantity:</span>
              <input
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => {if(itemData.itemType=="Weapon"){setQuantity(1)}else{setQuantity(Math.max(1, +e.target.value))}}}
                className="w-16 text-center rounded px-2 py-1 text-black bg-white"
              />
            </div>
            <div className="text-white text-md">
              Total: <span className="font-bold">{price} gold</span>
            </div>
          </div>
        </div>

        {/* Buy Button */}
        <div className="w-full flex justify-center gap-3">
          <button
            className="bg-red-600 cursor-pointer hover:bg-red-700 text-white font-bold py-2 px-6 rounded shadow-lg transition-all duration-200 "
            onClick={() => onPressBack()}
          >Back</button>

          <button
            className="bg-green-600 cursor-pointer hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow-lg transition-all duration-200 "
            onClick={() => onClickBuy(itemData,quantity,price)}
          >Buy</button>
        </div>

        <div className="text-red-600 text-center">{error}</div>
      </div>
    </div>
  )
}


const FAKEITEM:InventoryItem_T = {
  _id: "",
  name: "",
  description: "",
  itemType: "fake",
  healthAmount: 200,
  imageURL: null,
  damage:3,
  baseValue:0
}