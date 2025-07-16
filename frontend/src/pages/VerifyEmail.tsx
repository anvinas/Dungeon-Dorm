/*
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate , useSearchParams} from 'react-router-dom'; // For React Router v6+

const VerifyEmail = () => {
  const [message, setMessage] = useState('Verifying your email...');
  const location = useLocation();
  const navigate = useNavigate(); // To redirect after verification

  useEffect(() => {
    //const queryParams = new URLSearchParams(location.search);
   // const token = queryParams.get('token');
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");


    if (token) {
      // Send the token to your backend
      fetch('http://localhost:5000/api/auth/verify-email', { // Adjust port if different
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          setMessage(data.message); // "Email successfully verified!"
          // Optional: Redirect to login or dashboard after a delay
          setTimeout(() => {
            navigate('/login'); // Or wherever appropriate
          }, 3000);
        } else if (data.error) {
          setMessage(`Verification failed: ${data.error}`);
        }
      })
      .catch(error => {
        console.error('Error during email verification:', error);
        setMessage('An error occurred during verification. Please try again later.');
      });
    } else {
      setMessage('No verification token found in the URL.');
    }
  }, [location, navigate]); // Added navigate to dependency array for useEffect

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{message}</p>
      {message.includes("success") && <p>You will be redirected shortly.</p>}
    </div>
  );
};
*/









// import styles from "./styles/loginModal.module.css"
import {useEffect, useState, useRef} from "react"
import GetServerPath from "../lib/GetServerPath.ts"
import axios from "axios"
import { useSearchParams } from 'react-router-dom';

import styles from "./loginPage.module.css"
import { useNavigate } from 'react-router-dom';


function VerifyEmail() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("A verification code and link was sent to your email. Please enter the code or click the link.");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  console.log(token);

     /*if (token) {
      confirmEmail();
    } else {
      setMessage("❌ No verification token found.");
    }
      */
  useEffect(()=>{
    if(token && token?.length>0)
    {
      confirmEmail(token);
    }
  },[])
  
  const confirmEmail= async (token:string)=>
    {      
      try
      {
        console.log(token);
        const response = await axios.post(`${GetServerPath()}/api/auth/verify-email`,
        {token}, );
        
        console.log(response);

        if (response.data.message)
        {
          setMessage("✅ Email verified successfully! You may now log in.")
          setTimeout(()=>{navigate("/intro");},1000)
        } else {
            setMessage("❌ Something went wrong. Please try again.");
        }

      }
      catch (err)
      {
        setMessage("❌ Invalid or expired token.");
      }
    }


  const length = 6;
  const [values, setValues] = useState(Array(length).fill(''));
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, value: string) => {
    if (/^\d$/.test(value)) {
      const updated = [...values];
      updated[index] = value;
      setValues(updated);

      // Move focus to next input
      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    } else if (value === '') {
      const updated = [...values];
      updated[index] = '';
      setValues(updated);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && values[index] === '') {
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('Text').replace(/\D/g, ''); // Strip non-digits
    if (pasteData) {
      const updated = [...values];
      for (let i = 0; i < length; i++) {
        updated[i] = pasteData[i] || '';
        if (inputsRef.current[i]) {
          inputsRef.current[i].value = updated[i];
        }
      }
      setValues(updated);
      // Focus last filled input
      const nextIndex = Math.min(pasteData.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
    }
  };

  const makeTokenString = (values:string[]) => {
      const tokenString = values.join('');

      if(tokenString!= null && tokenString.length == 6)
      {
        console.log("Here is entered token: " + tokenString);
        confirmEmail(tokenString);
      }
      else
      {
         setMessage("❌ Entered code is Invalid.");
      }
      

  }


  return (
    <>
        
      <div className="relative w-screen h-screen overflow-hidden">
        {/* BG container */}
        <div className="absolute inset-0 z-0 ">
            <img src="/img/pixel_bg2.png" className={`w-screen max-w-screen h-screen ${styles.bgContainer}`}/>
        </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
      

          <div className="bg-stone-800 bg-opacity-70 p-8 rounded-xl shadow-lg flex flex-col items-center gap-6">


        <div className="text-white text-xl">
          <h1>Email Verification</h1>
        </div>

                
        <div className="flex gap-x-3">
          {values.map((val, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              ref={(el) => {inputsRef.current[i] = el!}}
              className="bg-white text-black w-16 h-16 text-xl text-center border border-gray-300 rounded-md focus:scale-110 focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
              placeholder="⚬"
            />
          ))}
        </div>
              
        {/*Button*/}
        <div>
          <div className="p-3 pr-4 pl-4 rounded-md bg-[#6b8e23] text-[#ffffff] border-1 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:cursor-pointer "onClick={()=>makeTokenString(values)} >Confirm</div>
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


export default VerifyEmail
