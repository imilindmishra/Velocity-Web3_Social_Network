import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useLocation, Link } from 'react-router-dom';


const NavBar = ({ walletAddress, setWalletAddress }) => {
  const [networkName, setNetworkName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const isCreateOrMintSuccessRoute = location.pathname === '/create' || location.pathname === '/mint-success';
  const isRootRoute = location.pathname === '/';


  const connectWalletHandler = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setWalletAddress(await signer.getAddress());
        
        // Attempt to switch to the Polygon Mumbai test network
        try {
          await provider.send("wallet_switchEthereumChain", [{ chainId: ethers.utils.hexValue(80001) }]);
          setNetworkName('Polygon Mumbai Testnet');
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              // Add the Polygon Mumbai test network to MetaMask
              await provider.send("wallet_addEthereumChain", [{
                chainId: ethers.utils.hexValue(80001),
                chainName: 'Polygon Mumbai Testnet',
                rpcUrls: ['https://rpc-mumbai.maticvigil.com/'], // Use an appropriate RPC URL for Mumbai
                blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
              }]);
              setNetworkName('Polygon Mumbai Testnet');
            } catch (addError) {
              console.error('Error adding Polygon Mumbai network:', addError);
            }
          } else {
            console.error('Error switching network:', switchError);
          }
        }
      } catch (err) {
        console.error('Error connecting to MetaMask:', err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };
  

  const disconnectWalletHandler = () => {
    setWalletAddress('');
    setNetworkName('');
    setShowDropdown(false); // Close the dropdown menu
  };

  return (
    <nav className="bg-orange-100 pt-3 pb-3">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex text-3xl mt-1 space-x-4 text-black font-serif text-3x1">
            Velocity
          </div>
          <div className="flex items-center space-x-4 relative">
            {isRootRoute && (
            <>
              <Link to="/about" className=" font-serif text-black hover:text-orange-900 text-lg">
                About
              </Link>
              <Link to="/developers" className=" font-serif text-black hover:text-orange-900 text-lg">
                Developers
              </Link>
              <Link to="/stories" className="font-serif text-black hover:text-orange-900 text-lg">
                Stories
              </Link>
            </>
          )}
            {walletAddress ? (
              <>
                <button
                  className="bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  <span className="ml-2">
                    <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
                  </span>
                </button>
                {showDropdown && (
                  <div className="origin-top-right absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                    <div className="py-1">
                      <a href="#" className="text-gray-700 block px-4 py-2 text-sm" onClick={e => e.preventDefault()}>
                        {networkName}
                      </a>
                      <a
                        href="#"
                        className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={(e) => {
                          e.preventDefault();
                          disconnectWalletHandler();
                        }}
                      >
                        Disconnect Wallet
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : isCreateOrMintSuccessRoute ?  (
              <button
                className="bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                onClick={connectWalletHandler}
              >
                Connect Wallet
              </button>
            ) :null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;