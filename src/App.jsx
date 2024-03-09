import React, { useState } from 'react';
import Home from './home';
import { Routes, Route } from 'react-router-dom';
import CreateCard from './components/CreateCard';
import NavBar from './components/NavBar';

function App() {
  const [walletAddress, setWalletAddress] = useState('');

  return (
    <>
      <NavBar walletAddress={walletAddress} setWalletAddress={setWalletAddress} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateCard walletAddress={walletAddress} />} />
      </Routes>
    </>
  );
}

export default App;
