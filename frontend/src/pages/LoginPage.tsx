import styles from "./loginPage.module.css"

function App() {
  return (
    <div className="relative w-screen h-screen ">

        {/* BG container */}
        <div className="relative w-screen h-screen ">
            <img src="/img/pixel_bg.png" className={`w-screen max-w-screen h-screen ${styles.bgContainer}`}/>

            {/* Left Chain */}
            <img src="/img/pixel_chain.png" className="h-100 absolute z-2 translate-x-[-50%] translate-y-[-50%] top-[0%] left-[37%] "/>
            
            {/* Right Chain */}
            <img src="/img/pixel_chain.png" className="h-100 absolute z-2 translate-x-[-50%] translate-y-[-50%] top-[0%] left-[63%] " />
            
            {/* Banner */}
            <div className="absolute h-fit w-full h-fit translate-x-[50%] translate-y-[-50%]  top-[43%] right-[50%] z-3">
                <div className="relative w-full h-fit flex items-center justify-center">
                    <img src="/img/wood_texture.png" className="h-120 "/>
                    <div className={`absolute text-4xl font-bold translate-x-[50%] translate-y-[-50%]  top-[12%] right-[50%] ${styles.headerText}`}>Dungeons and Dorm</div>
                </div>
            </div>
            

            {/* <img src="/gif/amber.gif" className="absolute top-[10%] right-[25%]"/> */}
        </div>

        {/* left chain */}
        <div className="">
        </div>

    </div>

   
  )
}

export default App
