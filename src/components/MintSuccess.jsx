import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { db } from '../firebaseConfig';
import { collection, addDoc, orderBy, query, onSnapshot } from 'firebase/firestore';

function MintSuccess({ userName, walletAddress }) {
  const [showPrompt, setShowPrompt] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    // Launch confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    // Hide the minting success message after a delay
    setTimeout(() => setShowPrompt(false), 5000);

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

  const postTweet = async () => {
    if (newTweet.trim() === '') return;

    // Include user's name and wallet address in the tweet content
    const tweetContent = `Name: ${userName}, Wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}, Tweet: ${newTweet}`;

    try {
      await addDoc(collection(db, "tweets"), {
        content: tweetContent,
        timestamp: new Date()
      });
      setNewTweet(''); // Reset the tweet input after posting
      console.log("Tweet added successfully.")
    } catch (error) {
      console.error("Error adding tweet: ", error);
    }
  };

  return (
    <>
      {showPrompt && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white py-4 px-6 text-center z-50">
          Congratulations! Your card has been minted successfully.
        </div>
      )}
      <div className="p-4">
        <div className="tweet-box mb-4">
          <textarea
            className="textarea textarea-bordered w-full mb-2"
            placeholder="What's happening?"
            value={newTweet}
            onChange={(e) => setNewTweet(e.target.value)}
          ></textarea>
          <button onClick={postTweet} className="btn btn-primary">Tweet</button>
        </div>
        <div className="tweet-feed">
          <h2 className="text-lg font-semibold mb-4">Latest Tweets</h2>
          {tweets.map((tweet) => (
            <div key={tweet.id} className="bg-gray-100 p-4 rounded-lg mb-4">
              {tweet.content}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MintSuccess;
