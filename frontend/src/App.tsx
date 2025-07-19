//import React from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import PlayPage from './pages/PlayPage';
import CharacterSelectPage from './pages/CharacterSelectPage'; 
import VerifyEmail from './pages/VerifyEmail';
import IntroPage from './pages/IntroPage';
import ResetPassword from './pages/ResetPassword';
import BossFightPage from './pages/BossFightPage';


function App() {
  return (
   <Router>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/play" element={<PlayPage/>} />
        <Route path="/character" element={<CharacterSelectPage/>} />
        <Route path="/verify" element={<VerifyEmail/>}/>
        <Route path='/intro' element={<IntroPage/>} />
        <Route path='/reset-password' element={<ResetPassword/>} />
        <Route path="/bossfight" element={<BossFightPage/>} />
      </Routes>
      </Router>
  );
}

export default App;
