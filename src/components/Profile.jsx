import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Web3 from 'web3';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Profile = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  const goToMintSuccess = () => {
    navigate('/mint-success'); // Navigate to MintSuccess component
  };

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
  if (!walletAddress) {
    return; // If walletAddress is not defined, exit the effect
  }

  // Listen for new tweets and update state
  const q = query(collection(db, "tweets"), orderBy("timestamp", "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const tweetsArray = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTweets(tweetsArray);

    // Collect all comments made by the current user's wallet address
    const userCommentsArray = tweetsArray.reduce((acc, tweet) => {
      if (tweet.comments) {
        const userComments = tweet.comments.filter(comment => comment.walletAddress === walletAddress);
        return [...acc, ...userComments];
      }
      return acc;
    }, []);
    setUserComments(userCommentsArray);
  });

  // Cleanup listener on component unmount
  return () => unsubscribe();
}, [walletAddress]); // Remove userComments from the dependency array

  return (
    <div>
    <button onClick={goToMintSuccess}>Go to Tweets </button> 
      <h2>Your Profile</h2>
      {walletAddress && (
        <div>
          <p>Wallet Address: {walletAddress}</p>
          <div>
            <h3>Your Tweets</h3>
            {tweets.map((tweet) => (
              <div key={tweet.id}>
                <p>{tweet.content}</p>
              </div>
            ))}
          </div>
          {userComments.length > 0 && (
            <div>
              <h3>Your Comments</h3>
              {userComments.map((comment, index) => (
                <div key={index}>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;