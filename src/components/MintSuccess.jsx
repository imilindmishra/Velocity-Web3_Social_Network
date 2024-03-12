import { useEffect, useState } from 'react';
import Profile from './Profile';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc, getDoc, increment, arrayUnion, arrayRemove, orderBy, query, onSnapshot } from 'firebase/firestore';

function MintSuccess({ userName, walletAddress }) {
  const [showPrompt, setShowPrompt] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  const [newComment, setNewComment] = useState('');
  const [likedTweets, setLikedTweets] = useState({});
  const [tweets, setTweets] = useState([]);

  const navigate = useNavigate(); // Initialize useHistory

  const goToProfile = () => {
    navigate('/profile'); // Navigate to Profile component
  };

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
  
      // Reset likedTweets state based on the new tweets array
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
  
    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [walletAddress]);

  const postTweet = async () => {
    if (newTweet.trim() === '') return;
  
    try {
      await addDoc(collection(db, "tweets"), {
        content: newTweet,
        likes: 0,
        likedBy: [], // Initialize likedBy array
        comments: [], // Initialize comments array
        timestamp: new Date(),
        walletAddress: walletAddress // Include the user's wallet address
      });
      setNewTweet(''); // Reset the tweet input after posting
      console.log("Tweet added successfully.")
    } catch (error) {
      console.error("Error adding tweet: ", error);
    }
    setNewTweet('')
  };
  

  const handleLike = async (tweetId, walletAddress, isLiked) => {
    // Get a reference to the tweet document
    const tweetRef = doc(db, 'tweets', tweetId);
  
    try {
      if (isLiked) {
        // If the user has already liked the tweet, unlike it
        // Remove the user's wallet address from the likedBy array
        await updateDoc(tweetRef, {
          likes: increment(-1),
          likedBy: arrayRemove(walletAddress),
        });
  
        // Update the local state
        setLikedTweets((prevLikedTweets) => ({
          ...prevLikedTweets,
          [tweetId]: false,
        }));
      } else {
        // If the user has not liked the tweet, like it
        // Add the user's wallet address to the likedBy array
        await updateDoc(tweetRef, {
          likes: increment(1),
          likedBy: arrayUnion(walletAddress),
        });
  
        // Update the local state
        setLikedTweets((prevLikedTweets) => ({
          ...prevLikedTweets,
          [tweetId]: true,
        }));
      }
  
      // Update the tweets state with the new like count
      const updatedTweetSnap = await getDoc(tweetRef);
      setTweets((prevTweets) =>
        prevTweets.map((tweet) =>
          tweet.id === tweetId
            ? { ...updatedTweetSnap.data(), id: updatedTweetSnap.id }
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
          walletAddress: walletAddress // Include the commenter's wallet address
        }),
      });
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  return (
    <>
    <button onClick={goToProfile}>Go to Profile</button>
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
              <p>{tweet.likes} Likes</p> {/* Display likes count */}
              <button
                onClick={() => handleLike(tweet.id, walletAddress, likedTweets[tweet.id])}
                className="btn btn-primary"
              >
                {likedTweets[tweet.id] ? 'Unlike' : 'Like'}
              </button>
              <textarea
                className="textarea textarea-bordered w-full mb-2"
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
  );
}
export default MintSuccess;