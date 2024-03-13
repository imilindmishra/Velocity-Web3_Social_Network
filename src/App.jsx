import { useState } from 'react';
import Home from './home';
import { Routes, Route } from 'react-router-dom';
import CreateCard from './components/CreateCard';
import NavBar from './components/NavBar';
import MintSuccess from './components/MintSuccess';
import Profile from './components/Profile';
import BountyBoard from './components/BountyBoard.jsx'; // Adjust the import path as necessary


function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [userName, setUserName] = useState(''); // Add state for user name

  return (
    <>
      <NavBar walletAddress={walletAddress} setWalletAddress={setWalletAddress} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateCard walletAddress={walletAddress} setUserName={setUserName} />} /> {/* Pass setUserName to CreateCard */}
        <Route path="/mint-success" element={<MintSuccess userName={userName} walletAddress={walletAddress} />} /> {/* Pass userName and walletAddress to MintSuccess */}
        <Route path="/profile" element={<Profile />} userName={userName} walletAddress={walletAddress}/>
        <Route path="/bounties" element={<BountyBoard walletAddress={walletAddress} />} />
      </Routes>
    </>
  );
}

export default App;
