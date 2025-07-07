import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, Timestamp, doc, getDoc, updateDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../components/firebase';

const InteractiveBook = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [MaxPage, setMaxPage] = useState(100);
  const [hovered, setHovered] = useState(0);
  const [openComment, setOpenComment] = useState(false);
  const [nameComment, setNameComment] = useState("");
  const [msgComment, setmsgComment] = useState("");
  const [flippingPage, setFlippingPage] = useState(null); // 'left' or 'right'
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get book ID from URL params or use a default
  const { bookId } = useParams();
  const currentBookId = bookId || 'chapter_1';

  const pages = [
    {
      type: 'cover',
      content: (
        <div className="absolute">
            <img src="./FlochOVA1.jpg" alt="image" className="h-full w-full object-cover"/>
        </div>
      )
    },
    {
      type: 'page',
      content: (
        <div className="absolute">
            <img src="./FlochOVA2.jpg" alt="image" className="h-full w-full object-cover"/>
        </div>
      )
    },
    {
      type: 'page',
      content: (
        <div className="absolute">
            <img src="./FlochOVA1.jpg" alt="image" className="h-full w-full object-cover"/>
        </div>
      )
    },
    {
      type: 'page',
      content: (
        <div className="p-6">
          <p className="mb-4 text-base leading-relaxed text-gray-700">
            For having lived in Westminster—how many years now? over twenty,—one feels even in the midst of the traffic, or waking at night, Clarissa was positive, a particular hush, or solemnity.
          </p>
        </div>
      )
    },
    {
      type: 'page',
      content: (
        <div className="p-6">
          <p className="mb-4 text-base leading-relaxed text-gray-700">
            "Good-morning to you, Clarissa!" said Hugh, rather extravagantly, for they had known each other as children. "Where are you off to?"
          </p>
          
          <p className="mb-4 text-base leading-relaxed text-gray-700">
            "I love walking in London," said Mrs. Dalloway. "Really it's better than walking in the country."
          </p>
        </div>
      )
    },
    {
      type: 'page',
      content: (
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">The End</h2>
          <p className="text-lg text-gray-600 mb-6">Thank you for reading</p>
          <div className="text-4xl">📖</div>
          <p className="text-sm text-gray-500 mt-4">Virginia Woolf's Mrs. Dalloway</p>
        </div>
      )
    }
  ];

  // Load comments from Firestore
  useEffect(() => {
    const commentsRef = collection(db, 'books', currentBookId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [currentBookId]);

  // Submit comment to Firestore
  const handleSubmitComment = async () => {
    if (!nameComment.trim() || !msgComment.trim()) {
      setError("Please fill in both name and comment");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const commentsRef = collection(db, 'books', currentBookId, 'comments');
      await addDoc(commentsRef, {
        name: nameComment.trim(),
        message: msgComment.trim(),
        createdAt: Timestamp.now(),
        page: currentPage + 1,
        like: 0,
        dislike: 0,
      });

      // Clear form
      setNameComment("");
      setmsgComment("");
      setOpenComment(false);
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const flipLeftPage = () => {
    if (currentPage > 0 && !flippingPage) {
      setFlippingPage('left');
      setTimeout(() => {
        setCurrentPage(currentPage - 2);
        setTimeout(() => setFlippingPage(null), 100);
      }, 400);
    }
  };

  const flipRightPage = () => {
    if (currentPage < pages.length - 1 && !flippingPage) {
      setFlippingPage('right');
      setTimeout(() => {
        setCurrentPage(currentPage + 2);
        setTimeout(() => setFlippingPage(null), 100);
      }, 400);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-customDarkBlue to-customDarkBlue flex items-center justify-between overflow-hidden">
      <div className='bg-customBlue w-xs h-screen border-r-1 border-r-customWhite flex items-center flex-col'>
        <button 
          onClick={() => navigate('/home')}
          className='flex flex-col border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-11 mt-4 rounded-xl text-customWhite hover:text-customBlue font-action font-semibold text-lg'>
            Back Home
        </button>
        <button className='flex flex-col border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-11 mt-4 rounded-xl text-customWhite hover:text-customBlue'>
          <span className='font-action font-semibold text-lg '>Chapter 1</span>
          <span className='font-action font-semibold text-2xl'>The Dedication</span>
        </button>
        <div className='flex flex-row gap-1 mt-4'>
          <button className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>❮❮</button>
          <button 
            onClick={flipLeftPage}
            className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>❮</button>
          <input
            type="text"
            placeholder="1"
            maxLength={8}
            value={`${currentPage + 1}/${MaxPage}`}
            className="text-center w-20 border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue"
            required
          />
          <button 
            onClick={flipRightPage}
            className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>❯</button>
          <button className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>❯❯</button>
        </div>
        <div className='flex flex-row items-center justify-center mt-4'>
          <img src="/views.svg" width="30" height="30" alt="views" />
          <span className='font-action text-customWhite font-medium text-xl ml-2'>321 Views</span>
        </div>
        <div className="flex gap-1 mt-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="relative cursor-pointer"
            >
              <img
                src="/star-full.svg"
                className={`absolute ${hovered >= star ? "opacity-100" : "opacity-0"}`}
                width="35"
                height="30"
              />
              <img src="/star-empty.svg" width="35" height="30" />
            </div>
          ))}
        </div>
        <div className='flex flex-col items-between justify-center mt-auto mb-10 gap-2'>
          <div className='flex flex-row items-center justify-between'>
            <span className='font-action text-customWhite font-semibold text-2xl'>5</span>
            <div>
              <div className='absolute bg-customYellow w-60 h-3 rounded-full'></div>
              <div className='bg-customWhite w-60 h-3 rounded-full'></div>
            </div>
          </div>
          <div className='flex flex-row items-center justify-between'>
            <span className='font-action text-customWhite font-semibold text-2xl'>4</span>
            <div className='bg-customWhite w-60 h-3 rounded-full'></div>
          </div>
          <div className='flex flex-row items-center justify-between'>
            <span className='font-action text-customWhite font-semibold text-2xl'>3</span>
            <div className='bg-customWhite w-60 h-3 rounded-full'></div>
          </div>
          <div className='flex flex-row items-center justify-between'>
            <span className='font-action text-customWhite font-semibold text-2xl'>2</span>
            <div className='bg-customWhite w-60 h-3 rounded-full'></div>
          </div>
          <div className='flex flex-row items-center justify-between gap-4'>
            <span className='font-action text-customWhite font-semibold text-2xl'>1</span>
            <div className='bg-customWhite w-60 h-3 rounded-full'></div>
          </div>
          <div className='flex flex-row items-center justify-center'>
            <img src="/star-full.svg" width="50" height="50" alt="star"/>
            <span className='font-action text-customWhite font-medium text-4xl ml-3'>4.89</span>
          </div>
        </div>
      </div>
      
      {/* Book Container */}
      <div className="book-container relative w-197 h-174 border-8 ">
        {/* Left Page Behind */}
        <div className="page h-full w-sm left-page z-0">
            <div className="bg-customWhite page-content">
                {pages[currentPage - 2]?.content}
            </div>
        </div>
        {/* Left Page */}
        <div className={`page h-full w-sm left-page z-10 ${flippingPage === 'left' ? 'flipping-left' : ''}`}>
            <div 
                className={`bg-customWhite page-content  ${currentPage > 0 && !flippingPage ? 'page-clickable' : currentPage === 0 ? 'page-disabled' : ''}`}
                onClick={flipLeftPage}
            >
                {currentPage > 0 ? pages[currentPage]?.content : pages[0]?.content}
            </div>
            <div className="bg-customWhite page-content page-back">
                {currentPage > 1 ? pages[currentPage - 1]?.content : null}
            </div>
        </div>
        {/* Book Spine */}
        <div className="book-spine bg-amber-800"></div>
        {/* Right Page */}
        <div className={`page h-full w-sm right-page z-10 ${flippingPage === 'right' ? 'flipping-right' : ''}`}>
            <div 
                className={`bg-customWhite page-content ${currentPage < pages.length - 1 && !flippingPage ? 'page-clickable' : 'page-disabled'}`}
                onClick={flipRightPage}
            >
                {pages[currentPage + 1 ]?.content}
            </div>
            <div className="bg-customWhite page-content page-back">
                {pages[currentPage + 2]?.content}
            </div>
        </div>
        {/* Right Page Behind */}
        <div className="page h-full w-sm right-page z-0">
            <div className="bg-customWhite page-content">
                {pages[currentPage + 3]?.content}
            </div>
        </div>
      </div>
      
      {/* Comment Section */}
      <div className='bg-customBlue w-xs h-screen border-l-1 border-l-customWhite flex items-center flex-col'>
        <span className='flex flex-col py-1 px-11 mt-4 rounded-xl text-customWhite font-action font-semibold text-xl'>
          Comment Section ({comments.length})
        </span>
        
        {/* Comments Display */}
        <div className='bg-customWhite w-75 rounded h-full mt-4 p-4 overflow-y-auto'>
          {comments.length === 0 ? (
            <p className='text-gray-500 text-center mt-8'>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className='mb-4 px-1 border-b border-gray-200 last:border-b-0'>
                <div className='flex justify-between items-start mb-2'>
                  <h4 className='font-semibold text-customBlue'>{comment.name}</h4>
                  <div className='text-xs text-gray-500 text-end'>
                    <span>{formatTimestamp(comment.createdAt)}</span>
                    <br />
                    <span>Page {comment.page}</span>
                  </div>
                </div>
                <p className='text-gray-700 text-sm leading-relaxed'>{comment.message}</p>
                <div className='flex flex-row gap-1 mt-1 justify-end'>
                  <button className='cursor-pointer border-1 rounded border-customBlack px-1 flex flex-row gap-1'>
                    <img src="/like_black.svg" width="15" height="15" />  
                    <span>{comment.like}</span>
                  </button>  
                  <button className='cursor-pointer border-1 rounded border-customBlack px-1 flex flex-row gap-1'>
                    <img src="/dislike_black.svg" width="15" height="15" />  
                    <span>{comment.dislike}</span>
                  </button>        
                </div>            
                <div className='h-0.25 w-full bg-gray-300 mt-2'></div>
              </div>
            ))
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className='text-red-400 text-sm mt-2 px-4 text-center'>{error}</div>
        )}
        
        {/* Comment Form */}
        {openComment ? (
          <>
            <div className='w-75 rounded flex flex-col mt-2 animate-swipeUP'>
              <div className='flex flex-row'>
                <input
                  type="text"
                  placeholder="Enter Your Name"
                  maxLength={50}
                  value={nameComment}
                  onChange={(e) => setNameComment(e.target.value)}
                  className="text-left w-full h-sm border-2 border-customWhite bg-customBlue cursor-pointer py-1 px-3 rounded-sm text-customWhite placeholder-gray-300"
                  required
                />
                <button 
                  onClick={() => {
                    setOpenComment(false);
                    setError("");
                    setNameComment("");
                    setmsgComment("");
                  }}
                  className='flex flex-col border-2 border-customWhite bg-customWhite hover:bg-customBlue cursor-pointer py-1 px-3 h-sm ml-2 rounded-sm text-customBlue hover:text-customWhite font-action font-semibold text-2xl'>
                    X
                </button>
              </div>
              <textarea
                placeholder="Enter Your Comment"
                maxLength={500}
                value={msgComment}
                onChange={(e) => setmsgComment(e.target.value)}
                className="text-left w-full h-32 border-2 border-customWhite bg-customBlue cursor-pointer py-1 px-3 rounded-sm text-customWhite placeholder-gray-300 mt-2 resize-none"
                required
              />
              <div className='text-right text-customWhite text-xs mt-1'>
                {msgComment.length}/500
              </div>
            </div>
            <button 
              onClick={handleSubmitComment}
              disabled={loading}
              className={`z-50 flex flex-col border-2 border-customWhite bg-customWhite hover:bg-customBlue cursor-pointer py-1 w-75 mt-1 rounded-sm text-customBlue hover:text-customWhite font-action font-semibold text-2xl ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}>
              {loading ? 'Sending...' : 'Send Comment'}
            </button>
          </>
        ) : (
          <button 
            onClick={() => setOpenComment(true)}
            className='flex flex-col border-2 border-customWhite bg-customWhite hover:bg-customBlue cursor-pointer py-1 w-75 mt-4 rounded-sm text-customBlue hover:text-customWhite font-action font-semibold text-2xl'>
              Add Comment
          </button>
        )}
      </div>
    </div>
  );
};

export default InteractiveBook;