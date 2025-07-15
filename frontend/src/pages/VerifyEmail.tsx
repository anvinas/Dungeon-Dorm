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
import {useEffect, useState} from "react"
import GetServerPath from "../lib/GetServerPath.ts"
import axios from "axios"
import { useSearchParams } from 'react-router-dom';


function VerifyEmail() {

  const [message, setMessage] = useState("Verifying...");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  useEffect(() => {
    
  const confirmEmail= async ()=>
    {
      try
      {
        if (token) {
          confirmEmail();
        } else {
          setMessage("❌ No verification token found.");
        }

        const response = await axios.post(`${GetServerPath()}/api/auth/verify-email`,
        {token}, );

        if (response.data.message)
        {
          setMessage("✅ Email verified successfully! You may now log in.")
        } else {
            setMessage("❌ Something went wrong. Please try again.");
        }

      }
      catch (err)
      {
        setMessage("❌ Invalid or expired token.");
      }
    };

     /*if (token) {
      confirmEmail();
    } else {
      setMessage("❌ No verification token found.");
    }
      */
  }, [token]);
  
  
  return (
      <div>
      <h1>Email Verification</h1>
      <p>{message}</p>
    </div>
  );
}


export default VerifyEmail
