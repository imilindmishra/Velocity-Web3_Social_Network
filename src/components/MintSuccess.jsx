import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
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
  const [likedTweets, setLikedTweets] = useState({});
  const [tweets, setTweets] = useState([]);

  const navigate = useNavigate();

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

    try {
      await addDoc(collection(db, "tweets"), {
        content: newTweet,
        likes: 0,
        likedBy: [],
        comments: [],
        timestamp: new Date(),
        walletAddress: walletAddress
      });
      setNewTweet('');
      console.log("Tweet added successfully.")
    } catch (error) {
      console.error("Error adding tweet: ", error);
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

  {showPrompt && (
    <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white py-4 px-6 text-center z-50">
      Congratulations! Your card has been minted successfully.
    </div>
  )}
  <div className="p-4 bg-amber-100">
    <div className="tweet-box mb-4">
      <textarea
        className="textarea w-full mb-2 shadow-md h-18 rounded-md focus:outline-none focus:ring-0 focus:border-transparent focus:shadow-lg transition-all duration-300 px-4"
        placeholder=" What's happening?"
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
          <p>{tweet.likes} Likes</p>
          <button
            onClick={() => handleLike(tweet.id, walletAddress, likedTweets[tweet.id])}
            className="btn btn-primary"
          >
            {likedTweets[tweet.id] ? 'Unlike' : 'Like'}
          </button>
          <textarea
            className="textarea textarea-bordered w-full mb-2 px-4"
            placeholder="Write a comment..."
            value={newComment[tweet.id] || ''}
            onChange={(e) => setNewComment(prevComments => ({ ...prevComments, [tweet.id]: e.target.value }))}
          ></textarea>
          {tweet.comments && tweet.comments.map((comment, index) => (
            <div key={index}>
              <p>{comment.text}</p>
            </div>
          ))}
          <button onClick={() => handleCommentSubmit(tweet.id, newComment[tweet.id])} className="btn btn-primary">Post Comment</button>
        </div>
      ))}
    </div>
  </div>
</>

      <div className="bg-orange-100 pt-3 pb-3">
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
                <div key={tweet.id} className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div>{tweet.content}</div>
                  <p>{tweet.likes} Likes</p>
                  <button
                    onClick={() => handleLike(tweet.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${likedTweets[tweet.id] ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
                  >
                    {likedTweets[tweet.id] ? 'Unlike' : 'Like'}
                  </button>
                  <div>
                    <textarea
                      className="textarea textarea-bordered w-full mb-2 px-4 py-2"
                      placeholder="Write a comment..."
                      value={newComment[tweet.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [tweet.id]: e.target.value })}
                    ></textarea>
                    <button
                      onClick={() => handleCommentSubmit(tweet.id, newComment[tweet.id])}
                      className="bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Post Comment
                    </button>
                  </div>
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
