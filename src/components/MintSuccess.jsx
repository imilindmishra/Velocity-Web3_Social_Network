import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import axios from 'axios'; // Import axios at the top of your file
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  increment,
  arrayUnion,
  arrayRemove,
  orderBy,
  query,
  onSnapshot
} from 'firebase/firestore';

function MintSuccess({ userName, walletAddress }) {
  const [showPrompt, setShowPrompt] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState({});
  const [likedTweets, setLikedTweets] = useState({});
  const [tweets, setTweets] = useState([]);

  const navigate = useNavigate();

  const toggleCommentBox = (tweetId) => {
  setShowCommentBox((prev) => ({ ...prev, [tweetId]: !prev[tweetId] }));
  };

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => setShowPrompt(false), 5000);

    const q = query(collection(db, "tweets"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tweetsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTweets(tweetsArray);

      const newLikedTweets = {};
      tweetsArray.forEach(tweet => {
        if (tweet.likedBy && tweet.likedBy.includes(walletAddress)) {
          newLikedTweets[tweet.id] = true;
        } else {
          newLikedTweets[tweet.id] = false;
        }
      });
      setLikedTweets(newLikedTweets);
    });

    return () => unsubscribe();
  }, [walletAddress]);

  const postTweet = async () => {
    if (newTweet.trim() === '') return;
  
    const tweetContent = {
      content: newTweet,
      timestamp: new Date().toISOString(), // ISO string format for consistency
    };
  
    const blob = new Blob([JSON.stringify(tweetContent)], { type: 'application/json' });
    const file = new File([blob], 'tweet-content.json', { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', file);
  
    const pinataEndpoint = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const headers = {
      pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
      pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_API_KEY,
    };
  
    try {
      const response = await axios.post(pinataEndpoint, formData, {
        headers: {
          ...headers,
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        },
      });
  
      const ipfsHash = response.data.IpfsHash;
      console.log("Tweet content added to IPFS:", ipfsHash);
  
      // Now, store the tweet with its IPFS hash in Firestore
      await addDoc(collection(db, "tweets"), {
        content: newTweet,
        ipfsHash: ipfsHash, // Store the IPFS hash
        likes: 0,
        likedBy: [],
        comments: [],
        timestamp: new Date(),
        walletAddress: walletAddress
      });
  
      setNewTweet('');
      console.log("Tweet added successfully.")
    } catch (error) {
      console.error("Error adding tweet to IPFS or Firestore: ", error);
    }
  };

  const handleLike = async (tweetId) => {
    const tweetRef = doc(db, 'tweets', tweetId);
    const isLiked = likedTweets[tweetId];

    try {
      if (isLiked) {
        await updateDoc(tweetRef, {
          likes: increment(-1),
          likedBy: arrayRemove(walletAddress),
        });
      } else {
        await updateDoc(tweetRef, {
          likes: increment(1),
          likedBy: arrayUnion(walletAddress),
        });
      }

      setLikedTweets((prevLikedTweets) => ({
        ...prevLikedTweets,
        [tweetId]: !isLiked,
      }));

      const updatedTweetSnap = await getDoc(tweetRef);
      setTweets((prevTweets) =>
        prevTweets.map((tweet) =>
          tweet.id === tweetId
            ? { ...tweet, ...updatedTweetSnap.data() }
            : tweet
        )
      );
    } catch (error) {
      console.error("Error updating like: ", error);
    }
  };
  const goToProfile = () => {
    navigate('/profile'); // Navigate to Profile component
  };


  const handleCommentSubmit = async (tweetId, comment) => {
    if (!comment || comment.trim() === '') return;

    const tweetRef = doc(db, 'tweets', tweetId);
    try {
      await updateDoc(tweetRef, {
        comments: arrayUnion({
          text: comment,
          createdAt: new Date(),
          walletAddress: walletAddress
        }),
      });
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  return (
    <>
        <>
  <style>
    {`
      @keyframes typingEffect {
        0%, 100% {
          max-width: 0;
          opacity: 0;
        }
        5%, 50% {
          max-width: 100%;
          opacity: 1;
        }
        50%, 100% {
          opacity: 1;
        }
      }

      .typing-effect {
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        animation: typingEffect 10s infinite;
        border-right: 3px solid orange; /* Simulates the cursor */
        font-weight: bold;
        color: #a855f7; /* Approximate hex code for Tailwind's violet-400 */
      }
    `}
  </style>
  <div className="bg-orange-50 flex items-center h-[238px] px-4">
    <img
      className="h-52 w-52"
      src="public/images/logo.png"
      alt="Velocity Logo"
    />
    <h1 className="text-5xl font-serif">
      Welcome to <span className="text-orange-900 font-bold">Velocity</span>,<br />
      a social network<br />
      <span className="text-violet-400 typing-effect">built on Shardeum.</span>
    </h1>
  </div>
  </>
      <div className="bg-orange-100 pt-3 pb-3">
        <button onClick={goToProfile}>Go to Profile</button>

        <div className="max-w-6xl mx-auto px-4">
          {showPrompt && (
            <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white py-4 px-6 text-center z-50">
              Congratulations! Your card has been minted successfully.
            </div>
          )}
          <div className="p-4 bg-orange-100">
            <div className="tweet-box mb-4">
              <textarea
                className="textarea w-full mb-2 shadow-md h-18 rounded-md focus:outline-none focus:ring-0 focus:border-transparent focus:shadow-lg transition-all duration-300 px-4 py-2"
                placeholder="What's happening?"
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
              ></textarea>
              <button onClick={postTweet} className="bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium">Tweet</button>
            </div>
            <div className="tweet-feed">
  <h2 className="text-lg font-semibold mb-4">Latest Tweets</h2>
  {tweets.map((tweet) => (
    <div key={tweet.id} className="bg-gray-100 p-4 w-3/4 rounded-lg mb-4 shadow">
      <div>{tweet.content}</div>
      <p>{tweet.likes} Likes</p>
      <button
        onClick={() => handleLike(tweet.id)}
        className={`px-3 py-2 rounded-md text-sm font-medium ${likedTweets[tweet.id] ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
      >
        {likedTweets[tweet.id] ? 'Unlike' : 'Like'}
      </button>
      <button
        onClick={() => toggleCommentBox(tweet.id)}
        className="ml-2 bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
      >
        Comment
      </button>
      {showCommentBox[tweet.id] && (
        <div className="mt-4">
          <textarea
            className="textarea textarea-bordered w-full mb-2 px-4 py-2 shadow-lg"
            placeholder="Write a comment..."
            value={newComment[tweet.id] || ''}
            onChange={(e) => setNewComment({ ...newComment, [tweet.id]: e.target.value })}
          ></textarea>
          <button
            onClick={() => handleCommentSubmit(tweet.id, newComment[tweet.id])}
            className="bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center"
          >
            Post Comment
            <span className="ml-2">➤</span> {/* Arrow icon, you can replace it with an SVG or an icon from a library like FontAwesome */}
          </button>
        </div>
      )}
      {tweet.comments && tweet.comments.map((comment, index) => (
        <div key={index} className="mt-2">
          <p>{comment.text}</p>
        </div>
      ))}
    </div>
  ))}
</div>

          </div>
        </div>
      </div>
    </>
  );
}

export default MintSuccess;
