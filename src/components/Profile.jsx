import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Profile = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        // Check if Web3 is injected by the browser (e.g., MetaMask)
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          const accounts = await web3.eth.getAccounts();
          setWalletAddress(accounts[0]);

          // Here, you can fetch the metadata associated with the wallet address
          // from your smart contract or centralized storage
          // For example:
          // const metadata = await fetchMetadataFromContract(accounts[0]);
          // setMetadata(metadata);
        } else {
          alert('Please install a Web3 wallet like MetaMask to use this feature');
        }
      } catch (error) {
        console.error('Error fetching wallet address:', error);
      }
    };

    fetchWalletAddress();
  }, []);

  useEffect(() => {
    // Listen for new tweets and update state
    const q = query(collection(db, "tweets"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tweetsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTweets(tweetsArray);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Your Profile</h2>
      {walletAddress && (
        <div>
          <p>Wallet Address: {walletAddress}</p>
          {metadata && (
            <div>
              {/* Display metadata fields */}
            </div>
          )}
          <div>
            <h3>Your Tweets</h3>
            {tweets.map((tweet) => (
              <div key={tweet.id}>
                <p>{tweet.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;