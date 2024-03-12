import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc, getDoc, increment, arrayUnion, orderBy, query, onSnapshot } from 'firebase/firestore';

function MintSuccess({ userName, walletAddress }) {
  const [showPrompt, setShowPrompt] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  const [newComment, setNewComment] = useState('');
  const [likedTweets, setLikedTweets] = useState({});
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
        likes: 0, // Initialize likes to 0
        timestamp: new Date()
      });
      setNewTweet(''); // Reset the tweet input after posting
      console.log("Tweet added successfully.")
    } catch (error) {
      console.error("Error adding tweet: ", error);
    }
  };

  const handleLike = async (tweetId, walletAddress) => {
    // Get a reference to the tweet document
    const tweetRef = doc(db, 'tweets', tweetId);

    // Get the current tweet data
    const tweetSnap = await getDoc(tweetRef);
    const tweetData = tweetSnap.data();

    // Check if the user (wallet address) has already liked the tweet
    if (tweetData.likedBy && tweetData.likedBy.includes(walletAddress)) {
      // If the user has already liked the tweet, do nothing
      return;
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
  };

  const handleCommentSubmit = async (tweetId, comment) => {
    if (!comment || comment.trim() === '') return;

    const tweetRef = doc(db, 'tweets', tweetId);
    try {
      await updateDoc(tweetRef, {
        comments: arrayUnion({
          text: comment,
          createdAt: new Date(),
        }),
      });

      setNewComment(prevComments => ({ ...prevComments, [tweetId]: '' }));
      const updatedTweet = await getDoc(tweetRef);
      // Update the tweets state
      setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? { ...updatedTweet.data(), id: updatedTweet.id } : tweet));
    } catch (error) {
      console.error("Error adding comment: ", error);
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
              <p>{tweet.likes} Likes</p> {/* Display likes count */}
              <button
                onClick={() => handleLike(tweet.id, walletAddress)}
                className="btn btn-primary"
                disabled={likedTweets[tweet.id]}
              >
                {likedTweets[tweet.id] ? 'Liked' : 'Like'}
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