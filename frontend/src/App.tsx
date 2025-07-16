//import React from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import PlayPage from './pages/PlayPage';
import CharacterSelectPage from './pages/CharacterSelectPage';
import VerifyEmail from './pages/VerifyEmail';
import IntroPage from './pages/IntroPage';

function App() {
  return (
   <Router>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/play" element={<PlayPage/>} />
        <Route path="/character" element={<CharacterSelectPage/>} />
        <Route path="/verify" element={<VerifyEmail/>}/>
        <Route path='/intro' element={<IntroPage/>} />
      </Routes>
      </Router>
  );
}

export default App;






/*
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginPage from './pages/LoginPage.tsx'

function App() {
  return (
    <>
      <LoginPage />
    </>
  )
}

export default App
*/