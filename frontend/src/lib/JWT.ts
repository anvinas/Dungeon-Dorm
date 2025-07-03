const storeJWT = (token:any)=>{
    if(token){
        localStorage.setItem("jwt",token)
    }else{
        console.log("No JWT to store")
    }
}

const fetchJWT = ()=>{
    let token = localStorage.getItem("jwt")
    return token
}

export {storeJWT,fetchJWT}