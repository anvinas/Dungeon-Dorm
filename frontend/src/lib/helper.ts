
export const getBossFolderName = (questName:String |null)=>{
    if(questName==null) return ""
    let name = questName.toLowerCase()
    if(name.includes("shaq")){
        return "shaq"
    }else if(name.includes("andrea")){
        return "andrea"
    }else if(name.includes("adrian")){
        return "adrian"
    }else if(name.includes("dave")){
        return "dave"
    }else if(name.includes("narrator")){
        return "narrator"
    }else if(name.includes("gabriel")){
        return "gabriel"
    }
}