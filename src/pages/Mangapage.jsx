import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment, collection, addDoc, Timestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../components/firebase';

const InteractiveBook = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [currentComment, setCurrentComment] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [openComment, setOpenComment] = useState(false);
  const [nameComment, setNameComment] = useState("");
  const [msgComment, setmsgComment] = useState("");
  const [flippingPage, setFlippingPage] = useState(null); // 'left' or 'right'
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userInteractions, setUserInteractions] = useState({});
  const [cooldowns, setCooldowns] = useState({});
  const [showTagBox, setShowTagBox] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Top Comments');
  const [filteredComments, setFilteredComments] = useState([]);
  const filterTagBoxRef = useRef(null);
  const commentRef = useRef(null);
  const tagOptions = ['Top Comments', 'Worst Comments', 'Newest Comments', 'Oldest Comments'];
  // Get book ID from URL params or use a default
  const { bookId } = useParams();
  const currentBookId = bookId || 'chapter_1';

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterTagBoxRef.current && !filterTagBoxRef.current.contains(event.target)) {
        setShowTagBox(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDivComments = () => {
    if (commentRef.current) {
      commentRef.current.focus();
      commentRef.current.select();
    }
  };


    const handleTagSelect = async (value, type) => {
    if (type === 'tag') {
      setSelectedTag(value);
      setShowTagBox(false);
    }
    setShowTagBox(false);
  };

  const handleChangeInput = (e) => {
    const value = e.target.value;
    const overValue = 0
    if (!/^\d*$/.test(value)) return;
    if (value > (comments.length / 11) + 1) {
      overValue = (comments.length / 11) + 1
      setCurrentComment(overValue);
    } else {
      setCurrentComment(value);
    }
  };
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
    setSelectedTag("Newest Comments");
  };

  const handleLikeDislike = async (commentId, action) => {
    if (cooldowns[commentId]) return; // Prevent spamming

    setCooldowns(prev => ({ ...prev, [commentId]: true }));

    try {
      const commentRef = doc(db, 'books', currentBookId, 'comments', commentId);
      const currentInteraction = userInteractions[commentId];

      let updates = {};
      let newInteraction = action;

      if (currentInteraction === action) {
        updates[action] = increment(-1);
        newInteraction = null;
      } else if (currentInteraction && currentInteraction !== action) {
        updates[currentInteraction] = increment(-1);
        updates[action] = increment(1);
      } else {
        updates[action] = increment(1);
      }

      await updateDoc(commentRef, updates);

      setUserInteractions(prev => ({
        ...prev,
        [commentId]: newInteraction
      }));
    } catch (error) {
      console.error("Error updating like/dislike:", error);
    } finally {
      setTimeout(() => {
        setCooldowns(prev => ({ ...prev, [commentId]: false }));
      }, 300);
    }
  };

  useEffect(() => {
  let result = [...comments];
  // Status Filter
  if (selectedTag === 'Top Comments') {
    result.sort((a, b) => (b.like - b.dislike) - (a.like - a.dislike));
  } else if (selectedTag === 'Worst Comments') {
    result.sort((a, b) => (b.dislike - b.like) - (a.dislike - a.like));
  } else if (selectedTag === 'Newest Comments') {
    result.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  } else if (selectedTag === 'Oldest Comments') {
    result.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
  }
  const startIndex = currentComment * 10;
  const endIndex = startIndex + 10;
  const paginatedResult = result.slice(startIndex, endIndex);

  setFilteredComments(paginatedResult);
}, [selectedTag, currentComment, comments]);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const flipLeftMax = () => {
    if (currentPage > 0 && !flippingPage) {
      setFlippingPage('left');
      setTimeout(() => {
        setCurrentPage(0);
        setTimeout(() => setFlippingPage(null), 100);
      }, 400);
    }
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

    const flipRightMax = () => {
    if (currentPage < pages.length - 1 && !flippingPage) {
      setFlippingPage('right');
      setTimeout(() => {
        setCurrentPage(pages.length);
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
          <button onClick={flipLeftMax} className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue ${currentPage > 0 && !flippingPage ? 'page-clickable' : currentPage === 0 ? 'page-disabled opacity-50' : ''}`}>❮❮</button>
          <button 
            onClick={flipLeftPage}
            className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue ${currentPage > 0 && !flippingPage ? 'page-clickable' : currentPage === 0 ? 'page-disabled opacity-50' : ''}`}>❮</button>
          <input
            type="text"
            placeholder="1"
            maxLength={8}
            value={`${currentPage + 1}-${currentPage + 2}/${pages.length}`}
            className="text-center w-20 border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue"
            required
          />
          <button 
            onClick={flipRightPage}
            className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue ${currentPage < pages.length - 1 ? 'page-clickable' : 'page-disabled opacity-50'}`}>❯</button>
          <button onClick={flipRightMax} className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue ${currentPage < pages.length - 1 ? 'page-clickable' : 'page-disabled opacity-50'}`}>❯❯</button>
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
        <div className='flex flex-row mt-4 gap-1'>
          <button 
            onClick={() => {
              if (currentComment == 1) {
                setCurrentComment(currentComment - 1);
              }
            }}
            className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite py-1 px-3 rounded-xl text-customWhite hover:text-customBlue 
              ${currentComment == 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          ❮</button>
          <div onClick={handleDivComments}
              className='flex flex-row justify-center items-center border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>
            <input
              type="text"
              maxLength={2}
              value={currentComment + 1}
              ref={commentRef}
              onChange={handleChangeInput}
              className='w-2 outline-none text-end'
              onClick={handleDivComments}
            />
           /{Math.floor(comments.length / 11) + 1}
          </div>
          <button 
            onClick={() => {
              const maxPage = Math.floor(comments.length / 11);
              if (currentComment < maxPage) {
                setCurrentComment(currentComment + 1);
              }
            }}  
            className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite py-1 px-3 rounded-xl text-customWhite hover:text-customBlue 
              ${currentComment >= Math.floor(comments.length / 11) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          ❯</button>
          <div className="relative flex justify-end w-30">
            <button 
              onClick={() => setShowTagBox(prev => !prev)}
              className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>
              <img src="/filter-on-light.svg" width="25" height="15" />
            </button>
            {showTagBox &&
              <div className="absolute top-full mt-3.5 left-2 md:left-1/2 -translate-x-1/2 w-35 bg-customBlue p-2 flex flex-col gap-1 rounded-sm border-2 border-customWhite z-50"
                ref={filterTagBoxRef}>
                <div className="absolute -top-2 right-7 w-3 h-3 bg-customBlue rotate-45 border-s-2 border-t-2 border-s-customWhite border-t-customWhite"></div>
                {tagOptions.map((tag, index) => (
                  <label key={index} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectedTag === tag}
                      onChange={() => handleTagSelect(tag, 'tag')}
                      className="appearance-none w-3 h-3 rounded-full border-2 border-customWhite checked:bg-customWhite checked:border-transparent cursor-pointer"
                    />
                    <span className="font-prompt text-customWhite text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTagSelect(tag, 'tag');
                      }}>
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            }
          </div>
        </div>
        {/* Comments Display */}
        <div className='bg-customWhite w-75 rounded h-full mt-4 py-4 pl-2 pr-2 overflow-y-auto'>
          {comments.length === 0 ? (
            <p className='text-gray-500 text-center mt-8'>No comments yet. Be the first to comment!</p>
          ) : (
            filteredComments.map((comment) => (
              <div key={comment.id} className='mb-4 pl-1 border-b border-gray-200 last:border-b-0'>
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
                  <button  
                    onClick={() => handleLikeDislike(comment.id, 'like')}
                    className={`cursor-pointer rounded border-customBlack px-1 flex flex-row gap-1 ${userInteractions[comment.id] === 'like' ? 'border-customGreen border-3 text-customGreen' : 'border-customBlack border-1 text-customBlack'} `}>
                    {userInteractions[comment.id] === 'like' ?
                    (<img src="/like_green.svg" width="15" height="15" />):
                    (<img src="/like_black.svg" width="15" height="15" />)}  
                    <span>{comment.like}</span>
                  </button>  
                  <button 
                    onClick={() => handleLikeDislike(comment.id, 'dislike')}
                    className={`cursor-pointer rounded border-customBlack px-1 flex flex-row gap-1 ${userInteractions[comment.id] === 'dislike' ? 'border-customRed border-3 text-customRed' : 'border-customBlack border-1 text-customBlack'} `}>
                    {userInteractions[comment.id] === 'dislike' ?
                    (<img src="/dislike_red.svg" width="15" height="15" />):
                    (<img src="/dislike_black.svg" width="15" height="15" />)}  
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