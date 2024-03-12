import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc, increment, orderBy, query, onSnapshot } from 'firebase/firestore';

function MintSuccess({ userName, walletAddress }) {
  const [showPrompt, setShowPrompt] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  const [likes, setLikes] = useState({});
  const [tweets, setTweets] = useState([]);
  const [likedTweets, setLikedTweets] = useState({});

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

  const handleLike = async (tweetId) => {
    // Get a reference to the tweet document
    const tweetRef = doc(db, 'tweets', tweetId);
  
    if (likedTweets[tweetId]) {
      // If the tweet has already been liked, unlike it
      setLikedTweets((prevLikedTweets) => {
        const newLikedTweets = { ...prevLikedTweets };
        delete newLikedTweets[tweetId];
        return newLikedTweets;
      });
  
      // Decrement the likes field of the tweet document
      await updateDoc(tweetRef, {
        likes: increment(-1),
      });
  
      // Update the local state
      setLikes((prevLikes) => ({
        ...prevLikes,
        [tweetId]: prevLikes[tweetId] - 1,
      }));
    } else {
      // If the tweet has not been liked, like it
      setLikedTweets((prevLikedTweets) => ({
        ...prevLikedTweets,
        [tweetId]: true,
      }));
  
      // Increment the likes field of the tweet document
      await updateDoc(tweetRef, {
        likes: increment(1),
      });
  
      // Update the local state
      setLikes((prevLikes) => ({
        ...prevLikes,
        [tweetId]: (prevLikes[tweetId] || 0) + 1,
      }));
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
              {userName}
              <button onClick={() => handleLike(tweet.id)} className="btn btn-primary">Like</button>
              <p>{likes[tweet.id] || 0} Likes</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MintSuccess;