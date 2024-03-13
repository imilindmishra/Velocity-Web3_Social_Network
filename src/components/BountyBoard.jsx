import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

const contractAddress = "0x59B56C80FC82a8Ea38bD54EdF1aD69297A513cAE";
const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "poster",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "BountyCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "solver",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "SolutionAccepted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "solver",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "solution",
				"type": "string"
			}
		],
		"name": "SolutionSubmitted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "solver",
				"type": "address"
			}
		],
		"name": "acceptSolution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "createBounty",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "solution",
				"type": "string"
			}
		],
		"name": "submitSolution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "bounties",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "poster",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isClaimed",
				"type": "bool"
			},
			{
				"internalType": "address payable",
				"name": "solver",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "content",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalBounties",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

function BountyBoard({ walletAddress }) {
  const navigate = useNavigate();

  // State variables
  const [newBounty, setNewBounty] = useState('');
  const [bountyAmount, setBountyAmount] = useState('');
  const [bounties, setBounties] = useState([]);
  const [newSolution, setNewSolution] = useState({});

  // useEffect to fetch bounties
  useEffect(() => {
    const q = query(collection(db, "bounties"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bountiesArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBounties(bountiesArray);
    });

    return () => unsubscribe();
  }, []);

  // Function to post a bounty
  const postBounty = async () => {
    if (!newBounty.trim() || !bountyAmount.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const txn = await contract.createBounty({ value: ethers.utils.parseEther(bountyAmount) });
      console.log("Creating bounty...", txn.hash);

      await txn.wait();
      console.log("Bounty created", txn.hash);

      await addDoc(collection(db, "bounties"), {
        content: newBounty,
        amount: bountyAmount,
        timestamp: new Date().toISOString(),
        walletAddress: walletAddress,
        solutions: [],
        acceptedSolutionId: null
      });

      setNewBounty('');
      setBountyAmount('');
    } catch (error) {
      console.error("Failed to post bounty:", error);
      alert("Failed to post bounty. See the console for more details.");
    }
  };

  // Function to submit a solution
  const submitSolution = async (bountyId, solution) => {
    if (!solution.trim()) return;

    const bountyRef = doc(db, 'bounties', bountyId);
    await updateDoc(bountyRef, {
      solutions: arrayUnion({
        text: solution,
        createdAt: new Date().toISOString(),
        walletAddress: walletAddress
      }),
    });

    setNewSolution(prev => ({ ...prev, [bountyId]: '' }));
  };

  // Function to accept a solution
  const acceptSolution = async (bountyId, solutionIndex) => {
    const bountyRef = doc(db, 'bounties', bountyId);
    try {
      await updateDoc(bountyRef, {
        acceptedSolutionId: solutionIndex
      });
    } catch (error) {
      console.error("Error accepting solution: ", error);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-orange-50 flex items-center px-4 py-6">
        <h1 className="text-5xl font-serif">
          Welcome to <span className="text-orange-900 font-bold">Bounty Board</span>,<br />
          a platform to post and solve bounties.
        </h1>
      </div>

      {/* Main content */}
      <div className="bg-orange-100 py-6">
        {/* Go to Profile button */}
        <button onClick={() => navigate('/profile')} className="bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">Go to Profile</button>

        {/* Create a new bounty section */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="p-4 bg-orange-100">
            <h2 className="text-lg font-semibold mb-4">Create a New Bounty</h2>
            <div>
              <input
                type="text"
                value={newBounty}
                onChange={(e) => setNewBounty(e.target.value)}
                placeholder="Bounty description"
                className="input"
              />
              <input
                type="text"
                value={bountyAmount}
                onChange={(e) => setBountyAmount(e.target.value)}
                placeholder="Bounty amount in SHM"
                className="input"
              />
              <button onClick={postBounty} className="btn btn-blue">Post Bounty</button>
            </div>
          </div>
        </div>

        {/* Current bounties section */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="p-4 bg-orange-100">
            <h2 className="text-lg font-semibold mb-4">Current Bounties</h2>
            {bounties.map((bounty) => (
              <div key={bounty.id} className="bg-gray-100 p-4 rounded-lg mb-4 shadow">
                <div>Description: {bounty.content}</div>
                <div>Amount: {bounty.amount} SHM</div>
                {/* Solution submission form */}
                <div>
                  <textarea
                    value={newSolution[bounty.id] || ''}
                    onChange={(e) => setNewSolution({ ...newSolution, [bounty.id]: e.target.value })}
                    placeholder="Your solution..."
                    className="textarea textarea-bordered w-full mb-2 px-4 py-2 shadow-lg"
                  />
                  <button onClick={() => submitSolution(bounty.id, newSolution[bounty.id])} className="btn btn-green">Submit Solution</button>
                </div>
                {/* Display solutions */}
                <div>
                  {bounty.solutions.map((solution, index) => (
                    <div key={index}>
                      <p>Solution: {solution.text}</p>
                      {bounty.acceptedSolutionId === null && (
                        <button onClick={() => acceptSolution(bounty.id, index)} className="btn btn-blue">Accept Solution</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default BountyBoard;