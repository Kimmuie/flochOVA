import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment, collection, addDoc, Timestamp, query, orderBy, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
import { createPortal } from 'react-dom';
import chapter_1Json from '../chapters/chapter_1.json';
import chapter_2Json from '../chapters/chapter_2.json';

const InteractiveBook = () => {
  const navigate = useNavigate();
  const [views, setViews] = useState(0);
  const [currentStar, setCurrentStar] = useState(0);
  const [previousStar, setPreviousStar] = useState(0);
  const [cooldownStar, setCooldownStar] = useState(false);
  const [allStar1, setAllStar1] = useState(0);
  const [allStar2, setAllStar2] = useState(0);
  const [allStar3, setAllStar3] = useState(0);
  const [allStar4, setAllStar4] = useState(0);
  const [allStar5, setAllStar5] = useState(0);
  const [closeLeftBar, setCloseLeftBar] = useState(false);
  const [closeBottomBar, setCloseBottomBar] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentComment, setCurrentComment] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [hoveredFilter, setHoveredFilter] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [nameComment, setNameComment] = useState("");
  const [msgComment, setmsgComment] = useState("");
  const [flippingPage, setFlippingPage] = useState(null); // 'left' or 'right'
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userInteractions, setUserInteractions] = useState({});
  const [cooldowns, setCooldowns] = useState({});
  const [showChapterBox, setShowChapterBox] = useState(false);
  const [showTagBox, setShowTagBox] = useState(false);
  const [showStarPhoneBox, setShowStarPhoneBox] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Top Comments');
  const [selectedChapter, setSelectedChapter] = useState('CH.1 : The Hatred');
  const [filteredComments, setFilteredComments] = useState([]);
  const filterStarPhoneBoxRef = useRef(null);
  const filterTagBoxRef = useRef(null);
  const filterChapterBoxRef = useRef(null);
  const pageRef = useRef(null);
  const commentRef = useRef(null);
  const starPhoneOptions = [ 5, 4, 3, 2, 1 ];
  const tagOptions = ['Top Comments', 'Worst Comments', 'Newest Comments', 'Oldest Comments'];
  const chapterOptions = ['CH.1 : The Hatred', 'CH.2 : The Subsitute', 'CH.3 : The Realization', 'CH.4 : The Dedication'];
  // Get book ID from URL params or use a default
  const { bookId } = useParams();
  const currentBookId = `chapter_${selectedChapter.match(/\d+/)?.[0] || 1}`;

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterTagBoxRef.current && !filterTagBoxRef.current.contains(event.target)) {
        setShowTagBox(false);
      }
      if (filterChapterBoxRef.current && !filterChapterBoxRef.current.contains(event.target)) {
        setShowChapterBox(false);
      }
      if (filterStarPhoneBoxRef.current && !filterStarPhoneBoxRef.current.contains(event.target)) {
        setShowStarPhoneBox(false);
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

  const handleDivPages = () => {
    if (pageRef.current) {
      pageRef.current.focus();
      pageRef.current.select();
    }
  };

  const handleTagSelect = async (value, type) => {
    console.log('handleTagSelect called with:', value, type)
    if (type === 'tag') {
      setSelectedTag(value);
      setShowTagBox(false);
    }
    if (type === 'chapter'){
      setSelectedChapter(value);
      setShowChapterBox(false);
      setCurrentPage(0);
      setCurrentStar(0);
    }
  };

  const handleChangeInput = (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    if (value > (comments.length / 10) + 1) {
      const overValue = (comments.length / 10) + 1
      setCurrentComment(overValue - 1);
    } else if (value == 0){
      setCurrentComment(0);
    } else {
      setCurrentComment(value - 1);
    }
  };

const handleChangePage = (e) => {
  let value = e.target.value;

  if (!/^\d*$/.test(value)) return; // only allow numbers

  value = parseInt(value, 10);
  if (isNaN(value)) return;

  if (value % 2 === 0) {
    value -= 1; // make sure it's odd
  }

  if (value >= pages.length) {
    const overValue = pages.length;
    setCurrentPage(overValue - 1);
  } else if (value == -1){
    setCurrentPage(0);
  } else {
    setCurrentPage(value - 1);
  }
};

const handleChangePagePhone = (e) => {
  let value = e.target.value;

  if (!/^\d*$/.test(value)) return; // only allow numbers

  value = parseInt(value, 10);
  if (isNaN(value)) return;

  if (value > pages.length) {
    const overValue = pages.length;
    setCurrentPage(overValue - 1);
  } else if (value == 0){
    setCurrentPage(0);
  } else {
    setCurrentPage(value - 1);
  }
};

  const chapterMap = {
    chapter_1: chapter_1Json,
    chapter_2: chapter_2Json,
    chapter_3: chapter_1Json,
    chapter_4: chapter_1Json
  };
  const rawPages = chapterMap[currentBookId];
  const pages = rawPages.map(page => {
    if (page.image) {
      return {
        type: page.type,
        content: (
          <div className="relative sm:absolute">
            <img src={page.image} alt="image" className="h-full w-full object-cover" />
          </div>
        )
      };
    } else if (page.text) {
      return {
        type: page.type,
        content: (
          <div className="p-6">
            {page.text.map((t, i) => (
              <p key={i} className="mb-4 text-base leading-relaxed text-gray-700">{t}</p>
            ))}
          </div>
        )
      };
    } else {
      return { type: page.type, content: <div /> };
    }
  });

  // Add Views
  useEffect(() => {
    const addView = async () => {
      const statDocRef = doc(db, 'books', currentBookId, 'stat', 'views');

      const statSnap = await getDoc(statDocRef);
      if (statSnap.exists()) {
        // increment view count
        await updateDoc(statDocRef, {
          views: increment(1)
        });
      } else {
        // create the document
        await setDoc(statDocRef, {
          views: 1
        });
      }
    };

    if (currentBookId) {
      addView();
    }
  }, [currentBookId]);

  // Load from Firestore
  useEffect(() => {
    const commentsRef = collection(db, 'books', currentBookId, 'comments');
    const viewsDocRef = doc(db, 'books', currentBookId, 'stat', 'views');
    const starsDocRef = doc(db, 'books', currentBookId, 'stat', 'stars');

    const commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    const unsubscribeViews = onSnapshot(viewsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setViews(docSnap.data().views);
      }
    });

    const unsubscribeStars = onSnapshot(starsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() || {};
        setAllStar1(data.star1 || 0);
        setAllStar2(data.star2 || 0);
        setAllStar3(data.star3 || 0);
        setAllStar4(data.star4 || 0);
        setAllStar5(data.star5 || 0);
      }else {
      setAllStar1(0);
      setAllStar2(0);
      setAllStar3(0);
      setAllStar4(0);
      setAllStar5(0);
  }
    });

    return () => {
      unsubscribeComments();
      unsubscribeViews();
      unsubscribeStars();
    };
  }, [currentBookId]);

const handleSelectStar = async (star) => {
  if (cooldownStar || star === currentStar) return;
  setCooldownStar(true);
  try {
    const starDocRef = doc(db, 'books', currentBookId, 'stat', 'stars');
    const oldField = `star${previousStar}`;
    const field = `star${star}`;
    const docSnap = await getDoc(starDocRef);
    
    if (!docSnap.exists()) {
      await setDoc(starDocRef, {
        star1: 0,
        star2: 0,
        star3: 0,
        star4: 0,
        star5: 0,
        [field]: 1
      });
    } else if (currentStar != 0) {
      await updateDoc(starDocRef, {
        [oldField]: increment(-1),
        [field]: increment(1)
      });
    } else {
      await updateDoc(starDocRef, {
        [field]: increment(1)
      });
    }
    setPreviousStar(star);
    setCurrentStar(star);
    setCooldownStar(false);
  } catch (error) {
    console.error("Error updating star rating:", error);
  }
};

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
        page: `${currentPage + 1}-${currentPage + 2}`,
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
    if (currentPage < pages.length - 2 && !flippingPage) {
      setFlippingPage('right');
      setTimeout(() => {
        setCurrentPage(currentPage + 2);
        setTimeout(() => setFlippingPage(null), 100);
      }, 400);
    }
  };

    const flipRightMax = () => {
    if (currentPage < pages.length - 2 && !flippingPage) {
      setFlippingPage('right');
      setTimeout(() => {
        setCurrentPage(pages.length - 2);
        setTimeout(() => setFlippingPage(null), 100);
      }, 400);
    }
  };

  const previousLeftPage = () => {
    if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
    }
  };

  const nextRightPage = () => {
    if (currentPage < pages.length - 1) {
        setCurrentPage(currentPage + 1);
    }
  };

  const totalRatings = allStar1 + allStar2 + allStar3 + allStar4 + allStar5;
  const totalScore = (1 * allStar1) + (2 * allStar2) + (3 * allStar3) + (4 * allStar4) + (5 * allStar5);
  const averageRating = totalRatings === 0 ? 0 : totalScore / totalRatings;

  const calculatePercentage = (starCount) => {
    if (totalRatings === 0) return 0;
    return (starCount / totalRatings) * 100;
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-customDarkBlue to-customDarkBlue flex items-start sm:items-center justify-start md:justify-center xl:justify-center 2xl:justify-between  overflow-hidden">
      <div className='w-full h-full flex sm:hidden flex-col'>
      {/* TopNav */}
      <div className='bg-customBlue w-screen h-20 border-b-1 border-b-customWhite items-center justify-between px-4 z-90 flex flex-row'>
        <button onClick={() => navigate('/home')} className="border-2 border-customWhite bg-customBlue hover:bg-customWhite py-1 px-3.5 rounded-full text-customWhite hover:text-customBlue cursor-pointer font-semibold text-lg flex md:flex xl:flex 2xl:hidden ">
          ❮
        </button>
        <div className='flex flex-col items-end my-2'>
          <span className='text-customWhite font-action font-semibold text-2xl'>{selectedChapter}</span>
          <div className='flex flex-row items-center justify-center'>
            <span className='font-action text-customWhite font-medium text-xl mr-1'>{views} Views</span>
            <img src="/views.svg" width="30" height="30" alt="views" />
          </div>
        </div>
      </div>
      {/* Page */}
      <div className='absolute flex w-full h-full z-80 justify-between'>
        <button onClick={previousLeftPage} className='w-full h-full flex bg-transparent z-10'></button>
        <button onClick={nextRightPage} className='w-full h-full flex bg-transparent z-10'></button>
      </div>
      {currentPage > 0 ? pages[currentPage]?.content : pages[0]?.content}
      {/* BottomNav */}
        <div className={`bg-customBlue w-screen h-20 border-t-1 border-t-customWhite items-center justify-between px-4 z-90 flex flex-row`}>
          <div className='flex flex-row gap-2'>
          <div className="relative flex justify-end" ref={filterStarPhoneBoxRef}>
            <button 
              onClick={() => setShowStarPhoneBox(prev => !prev)}
              className='flex flex-row justify-center items-center border-2 border-customWhite rounded-md px-2 py-1'>
              {currentStar != 0 ? (
              <img
                src="/star-full.svg"
                className={`${cooldownStar ? "cursor-progress" : "cursor-pointer"} mr-2`}
                width="35"
                height="30"
              />
              ):(
              <img
                src="/star-empty.svg"
                className={`${cooldownStar ? "cursor-progress" : "cursor-pointer"} mr-2`}
                width="35"
                height="30"
              />
              )
              }
              <span className='font-action text-customWhite font-medium text-xl mr-1'>{currentStar === 0 ? '-' : currentStar}</span>
            </button>
            {showStarPhoneBox && (
              <div className={`absolute -top-60 mt-3.5 left-1/2 -translate-x-1/2 w-20 bg-customBlue p-2 flex-col gap-1 rounded-md border-2 border-customWhite z-50 flex`}>
                {starPhoneOptions.map((tag, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStar(tag);
                    }}
                  >
                    <img
                      src="/star-full.svg"
                      className={`${cooldownStar ? "cursor-progress" : "cursor-pointer"} mr-2`}
                      width="35"
                      height="30"
                    />
                    <span className="font-action text-customWhite font-medium text-xl">
                      {tag}
                    </span>
                  </button>
                ))}
                <div className="absolute top-50.5 w-3 left-1/2 -translate-x-1/2 h-3 bg-customBlue rotate-45 border-r-2 border-b-2 border-r-customWhite border-b-customWhite"></div>
              </div>
            )}
          </div>
            <button 
              onClick={() => setCloseBottomBar(true)}
              className='flex flex-row justify-center items-center border-2 border-customWhite rounded-md px-2 py-1'>
              <img
                src="/comment-white.svg"
                className={`${cooldownStar ? "cursor-progress" : "cursor-pointer"} mr-2`}
                width="35"
                height="30"
              />
              <span className='font-action text-customWhite font-medium text-xl mr-1'>{comments.length === 0 ? '-' : comments.length}</span>
            </button>
          </div>
          <div onClick={handleDivPages}
              className='flex flex-row justify-center items-center border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-2 px-3 rounded-md font-action text-customWhite font-medium text-xl hover:text-customBlue'>
            <input
              type="text"
              maxLength={3}
              value={currentPage + 1}
              ref={pageRef}
              onChange={handleChangePagePhone}
              className='w-6 outline-none text-end'
              onClick={handleDivPages}
            />
            /{pages.length}
          </div>
        </div>
        {closeBottomBar && (
        <div className={`absolute bg-customBlue w-screen h-160 bottom-0 border-t-1 border-t-customWhite items-start justify-start px-4 z-90 flex flex-col`}>
          <div className='flex flex-row w-full'>
            <div className='w-full mt-4 flex flex-row justify-start items-center rounded-md px-2 py-1'>
              {currentStar != 0 ? (
              <img
                src="/star-full.svg"
                className={`${cooldownStar ? "cursor-progress" : "cursor-pointer"} mr-2`}
                width="35"
                height="30"
              />
              ):(
              <img
                src="/star-empty.svg"
                className={`${cooldownStar ? "cursor-progress" : "cursor-pointer"} mr-2`}
                width="35"
                height="30"
              />
              )
              }
              <span className='font-action text-customWhite font-medium text-xl mr-1'>{currentStar === 0 ? '-' : currentStar}</span>
            </div>
            <button onClick={() => setCloseBottomBar(false)} className="border-b-2 h-10 border-x-2 border-customWhite bg-customBlue hover:bg-customWhite pt-1 px-3 rounded-br-xl rounded-bl-xl text-customWhite hover:text-customBlue cursor-pointer font-semibold text-lg flex md:flex xl:flex 2xl:hidden ">
            ⮟
            </button>
            <div className='w-full flex flex-row justify-end items-center bg-customBlue hover:bg-customWhite cursor-pointer py-2 px-3 rounded-md font-action text-customWhite font-medium text-xl hover:text-customBlue mt-4'>
              {currentPage + 1}/{pages.length}
            </div>
          </div>
          <div className='flex flex-row items-center w-full justify-center mb-1 mt-2 gap-4'>
            <div className='flex flex-col lg:hidden md:flex xl:hidden 2xl:flex'>
              <div className='flex flex-row items-center justify-between'>
                <span className='font-action text-customWhite font-semibold text-2xl'>5</span>
                <div className='bg-customWhite w-60 h-3 rounded-full relative group'>
                  <div className='bg-customYellow h-3 rounded-full relative flex justify-center'
                      style={{ width: `${calculatePercentage(allStar5)}%` }}>
                    <div className={`absolute -top-5 bg-customYellow ${!allStar5 && "hidden"} text-customBlue font-bold text-xs px-2 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}>
                      {allStar5}
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-row items-center justify-between'>
                <span className='font-action text-customWhite font-semibold text-2xl'>4</span>
                <div className='bg-customWhite w-60 h-3 rounded-full relative group'>
                  <div className='bg-customYellow h-3 rounded-full relative flex justify-center'
                      style={{ width: `${calculatePercentage(allStar4)}%` }}>
                    <div className={`absolute -top-5 bg-customYellow ${!allStar4 && "hidden"} text-customBlue font-bold text-xs px-2 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}>
                      {allStar4}
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-row items-center justify-between'>
                <span className='font-action text-customWhite font-semibold text-2xl'>3</span>
                <div className='bg-customWhite w-60 h-3 rounded-full relative group'>
                  <div className='bg-customYellow h-3 rounded-full relative flex justify-center'
                      style={{ width: `${calculatePercentage(allStar3)}%` }}>
                    <div className={`absolute -top-5 bg-customYellow ${!allStar3 && "hidden"} text-customBlue font-bold text-xs px-2 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}>
                      {allStar3}
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-row items-center justify-between'>
                <span className='font-action text-customWhite font-semibold text-2xl'>2</span>
                <div className='bg-customWhite w-60 h-3 rounded-full relative group'>
                  <div className='bg-customYellow h-3 rounded-full relative flex justify-center'
                      style={{ width: `${calculatePercentage(allStar2)}%` }}>
                    <div className={`absolute -top-5 bg-customYellow ${!allStar2 && "hidden"} text-customBlue font-bold text-xs px-2 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}>
                      {allStar2}
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-row items-center justify-between gap-4'>
                <span className='font-action text-customWhite font-semibold text-2xl'>1</span>
                <div className='bg-customWhite w-60 h-3 rounded-full relative group'>
                  <div className='bg-customYellow h-3 rounded-full relative flex justify-center'
                      style={{ width: `${calculatePercentage(allStar1)}%` }}>
                    <div className={`absolute -top-5 bg-customYellow ${!allStar1 && "hidden"} text-customBlue font-bold text-xs px-2 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}>
                      {allStar1}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-col items-center justify-center'>
              <img src="/star-full.svg" width="50" height="50" alt="star"/>
              <div className='flex flex-col justify-center items-center'>
                <span className='font-action text-customWhite font-medium text-4xl'>{averageRating.toFixed(2)}</span>
                <span className='font-action text-customWhite font-medium text-xl opacity-50'>{totalRatings}</span>
              </div>
            </div>
          </div>
          {/* Comment Section */}
            <div className='flex flex-row justify-between mt-1 gap-1 w-full'>
              <button 
                onClick={() => {
                  if (currentComment != 0) {
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
              /{Math.floor(comments.length / 10) + 1}
              </div>
              <button 
                onClick={() => {
                  const maxPage = Math.floor(comments.length / 10);
                  if (currentComment < maxPage) {
                    setCurrentComment(currentComment + 1);
                  }
                }}  
                className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite py-1 px-3 rounded-xl text-customWhite hover:text-customBlue 
                  ${currentComment >= Math.floor(comments.length / 10) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              ❯</button>
              <div className="relative flex justify-end w-full">
                <button                
                  ref={filterTagBoxRef}
                  onClick={() => setShowTagBox(prev => !prev)}
                  onMouseEnter={() => setHoveredFilter(true)}
                  onMouseLeave={() => setHoveredFilter(false)}
                  className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>
                  <img
                    src="/filter_blue.svg"
                    className={`absolute ${hoveredFilter ? "opacity-100" : "opacity-0"}`}
                    width="25" height="15"
                  />
                  <img src="/filter_white.svg" width="25" height="15" />
                </button>
                {showTagBox &&
                  <div className="absolute top-full mt-3.5 w-35 bg-customBlue p-2 flex flex-col gap-1 rounded-sm border-2 border-customWhite z-50">
                    <div className="absolute -top-2 right-4.5 w-3 h-3 bg-customBlue rotate-45 border-s-2 border-t-2 border-s-customWhite border-t-customWhite"></div>
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
            <div className='bg-customWhite w-full rounded h-full flex flex-col mt-4 py-4 pl-2 pr-2 overflow-y-auto '>
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
                <div className='w-full rounded flex flex-col mt-2 animate-swipeUP'>
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
                    className="text-left w-full h-40 border-2 border-customWhite bg-customBlue cursor-pointer py-1 px-3 rounded-sm text-customWhite placeholder-gray-300 mt-2 resize-none"
                    required
                  />
                  <div className='text-right text-customWhite text-xs mt-1'>
                    {msgComment.length}/500
                  </div>
                </div>
                <button 
                  onClick={handleSubmitComment}
                  disabled={loading}
                  className={`z-50 flex flex-col border-2 border-customWhite bg-customWhite hover:bg-customBlue cursor-pointer py-1 w-full mt-1 rounded-sm text-customBlue hover:text-customWhite font-action font-semibold text-2xl ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                  {loading ? 'Sending...' : 'Send Comment'}
                </button>
              </>
            ) : (
              <button 
                onClick={() => setOpenComment(true)}
                className='flex flex-col w-full border-2 border-customWhite bg-customWhite hover:bg-customBlue cursor-pointer py-1 mt-4 rounded-sm text-customBlue hover:text-customWhite font-action font-semibold text-2xl'>
                  Add Comment
              </button>
            )}
        </div>
        )}
      </div>
      <div className={`bg-customBlue w-xs h-screen border-r-1 border-r-customWhite hidden sm:flex items-center flex-col z-10 absolute 2xl:relative left-0 transition ${closeLeftBar ? "-translate-x-70 2xl:-translate-x-0" : ""}`}>
        <div className='flex flex-row'>
          <button 
            onClick={() => navigate('/home')}
            className='flex flex-col border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-11 mt-4 rounded-xl text-customWhite hover:text-customBlue font-action font-semibold text-lg'>
              Back Home
          </button>
          <button onClick={() => setCloseLeftBar(prev =>!prev)} className="absolute border-y-2  border-l-2 border-customWhite bg-customBlue hover:bg-customWhite py-1 px-3 mt-4 right-0 rounded-tl-xl rounded-bl-xl text-customWhite hover:text-customBlue cursor-pointer font-semibold text-lg flex md:flex xl:flex 2xl:hidden ">
          {closeLeftBar ? "❯" :"❮"}
          </button>
          </div>
        <div className="relative flex justify-end">
        <button               
          ref={filterChapterBoxRef}
          onClick={() => setShowChapterBox(prev => !prev)}
          className='w-60 flex flex-col border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1  mt-4 rounded-xl text-customWhite hover:text-customBlue'>
          <span className='font-action font-semibold text-lg '>{currentBookId.replace('chapter_', 'Chapter ')}</span>
          <span className='font-action font-semibold text-2xl'>{selectedChapter.split(':')[1]?.trim() || ''}</span>
        </button>
          {showChapterBox &&
            <div className="absolute top-full mt-3.5 left-2 md:left-1/2 -translate-x-1/2 w-full bg-customBlue p-2 flex flex-col gap-1 rounded-sm border-2 border-customWhite z-50">
              <div className="absolute -top-2 w-3 left-1/2 -translate-x-1/2 h-3 bg-customBlue rotate-45 border-s-2 border-t-2 border-s-customWhite border-t-customWhite"></div>
              {chapterOptions.map((ch, index) => (
                <label key={index} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    checked={selectedChapter === ch}
                    onChange={() => handleTagSelect(ch, 'chapter')}
                    className="appearance-none w-3 h-3 rounded-full border-2 border-customWhite checked:bg-customWhite checked:border-transparent cursor-pointer"
                  />
                  <span className="font-prompt text-customWhite text-xs">
                    {ch}
                  </span>
                </label>
              ))}
            </div>
          }
        </div>
        <div className='flex flex-row gap-1 mt-4'>
          <button onClick={flipLeftMax} className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue ${currentPage > 0 && !flippingPage ? 'page-clickable' : currentPage === 0 ? 'page-disabled opacity-50' : ''}`}>❮❮</button>
          <button 
            onClick={flipLeftPage}
            className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue ${currentPage > 0 && !flippingPage ? 'page-clickable' : currentPage === 0 ? 'page-disabled opacity-50' : ''}`}>❮</button>
          <div onClick={handleDivPages}
              className='flex flex-row justify-center items-center border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>
            <input
              type="text"
              maxLength={3}
              value={`${currentPage + 1}-${currentPage + 2}`}
              ref={pageRef}
              onChange={handleChangePage}
              className='w-6 outline-none text-end'
              onClick={handleDivPages}
            />
           /{pages.length}
          </div>
          <button 
            onClick={flipRightPage}
            className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue ${currentPage < pages.length - 2 ? 'page-clickable' : 'page-disabled opacity-50'}`}>❯</button>
          <button onClick={flipRightMax} className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue ${currentPage < pages.length - 2 ? 'page-clickable' : 'page-disabled opacity-50'}`}>❯❯</button>
        </div>
        <div className='flex flex-row items-center justify-center mt-4'>
          <img src="/views.svg" width="30" height="30" alt="views" />
          <span className='font-action text-customWhite font-medium text-xl ml-2'>{views} Views</span>
        </div>
        <div className="flex gap-1 mt-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="relative"
            >
              <img
                onClick={() => handleSelectStar(star)}
                src="/star-full.svg"
                className={`absolute ${(hovered || currentStar) >= star ? "opacity-100" : "opacity-0"} ${cooldownStar ? "cursor-progress" : "cursor-pointer"}`}
                width="35"
                height="30"
              />
              <img src="/star-empty.svg" width="35" height="30" />
            </div>
          ))}
        </div>
        <div className='flex flex-col items-between justify-center mt-4 2xl:mt-auto mb-4 gap-2'>
          <div className='flex flex-col mt-4 lg:hidden md:flex xl:hidden 2xl:flex'>
            <div className='flex flex-row items-center justify-between'>
              <span className='font-action text-customWhite font-semibold text-2xl'>5</span>
              <div className='bg-customWhite w-60 h-3 rounded-full relative group'>
                <div className='bg-customYellow h-3 rounded-full relative flex justify-center'
                    style={{ width: `${calculatePercentage(allStar5)}%` }}>
                  <div className={`absolute -top-5 bg-customYellow ${!allStar5 && "hidden"} text-customBlue font-bold text-xs px-2 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}>
                    {allStar5}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-row items-center justify-between'>
              <span className='font-action text-customWhite font-semibold text-2xl'>4</span>
              <div className='bg-customWhite w-60 h-3 rounded-full relative group'>
                <div className='bg-customYellow h-3 rounded-full relative flex justify-center'
                    style={{ width: `${calculatePercentage(allStar4)}%` }}>
                  <div className={`absolute -top-5 bg-customYellow ${!allStar4 && "hidden"} text-customBlue font-bold text-xs px-2 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}>
                    {allStar4}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-row items-center justify-between'>
              <span className='font-action text-customWhite font-semibold text-2xl'>3</span>
              <div className='bg-customWhite w-60 h-3 rounded-full relative group'>
                <div className='bg-customYellow h-3 rounded-full relative flex justify-center'
                    style={{ width: `${calculatePercentage(allStar3)}%` }}>
                  <div className={`absolute -top-5 bg-customYellow ${!allStar3 && "hidden"} text-customBlue font-bold text-xs px-2 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}>
                    {allStar3}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-row items-center justify-between'>
              <span className='font-action text-customWhite font-semibold text-2xl'>2</span>
              <div className='bg-customWhite w-60 h-3 rounded-full relative group'>
                <div className='bg-customYellow h-3 rounded-full relative flex justify-center'
                    style={{ width: `${calculatePercentage(allStar2)}%` }}>
                  <div className={`absolute -top-5 bg-customYellow ${!allStar2 && "hidden"} text-customBlue font-bold text-xs px-2 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}>
                    {allStar2}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-row items-center justify-between gap-4'>
              <span className='font-action text-customWhite font-semibold text-2xl'>1</span>
              <div className='bg-customWhite w-60 h-3 rounded-full relative group'>
                <div className='bg-customYellow h-3 rounded-full relative flex justify-center'
                    style={{ width: `${calculatePercentage(allStar1)}%` }}>
                  <div className={`absolute -top-5 bg-customYellow ${!allStar1 && "hidden"} text-customBlue font-bold text-xs px-2 py-1 rounded-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10`}>
                    {allStar1}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-row items-center justify-center'>
            <img src="/star-full.svg" width="50" height="50" alt="star"/>
            <div className='flex flex-col justify-center items-center ml-3'>
              <span className='font-action text-customWhite font-medium text-4xl'>{averageRating.toFixed(2)}</span>
              <span className='font-action text-customWhite font-medium text-xl opacity-50'>{totalRatings}</span>
            </div>
          </div>
        </div>
          <span className='flex-col py-1 px-11 rounded-xl text-customWhite font-action font-semibold text-xl hidden md:flex xl:flex 2xl:hidden'>
            Comment Section ({comments.length})
          </span>
          <div className='flex-row mt-1 gap-1 hidden md:flex xl:flex 2xl:hidden'>
            <button 
              onClick={() => {
                if (currentComment != 0) {
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
            /{Math.floor(comments.length / 10) + 1}
            </div>
            <button 
              onClick={() => {
                const maxPage = Math.floor(comments.length / 10);
                if (currentComment < maxPage) {
                  setCurrentComment(currentComment + 1);
                }
              }}  
              className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite py-1 px-3 rounded-xl text-customWhite hover:text-customBlue 
                ${currentComment >= Math.floor(comments.length / 10) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            ❯</button>
            <div className="relative flex justify-end w-30">
              <button                
                ref={filterTagBoxRef}
                onClick={() => setShowTagBox(prev => !prev)}
                onMouseEnter={() => setHoveredFilter(true)}
                onMouseLeave={() => setHoveredFilter(false)}
                className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>
                <img
                  src="/filter_blue.svg"
                  className={`absolute ${hoveredFilter ? "opacity-100" : "opacity-0"}`}
                  width="25" height="15"
                />
                <img src="/filter_white.svg" width="25" height="15" />
              </button>
              {showTagBox &&
                <div className="absolute top-full mt-3.5 left-2 md:left-1/2 -translate-x-1/2 w-35 bg-customBlue p-2 flex flex-col gap-1 rounded-sm border-2 border-customWhite z-50">
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
          <div className='bg-customWhite w-75 rounded h-full mt-4 py-4 pl-2 mx-4 pr-2 overflow-y-auto hidden md:flex xl:flex 2xl:hidden flex-col'>
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
              <div className='w-75 rounded flex-col mt-2 animate-swipeUP hidden md:flex xl:flex 2xl:hidden'>
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
                className={`hidden md:flex xl:flex 2xl:hidden z-50 flex-col border-2 border-customWhite bg-customWhite hover:bg-customBlue cursor-pointer py-1 w-75 mt-1 rounded-sm text-customBlue hover:text-customWhite font-action font-semibold text-2xl ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                {loading ? 'Sending...' : 'Send Comment'}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setOpenComment(true)}
              className='flex-col border-2 border-customWhite bg-customWhite hover:bg-customBlue cursor-pointer py-1 w-75 mt-4 rounded-sm text-customBlue hover:text-customWhite font-action font-semibold text-2xl hidden md:flex xl:flex 2xl:hidden'>
                Add Comment
            </button>
          )}
        </div>
      
      {/* Book Container */}
      <div className="book-container relative w-195 h-174 lg:w-227.5 lg:h-200 2xl:w-197 2xl:h-174.75 rounded-xs border-8 border-customWhite hidden md:flex xl:flex 2xl:flex">
        {/* Left Page Behind */}
        <div className="page h-full w-sm lg:w-md 2xl:w-sm  left-page z-0">
            <div className="bg-customWhite page-content">
                {pages[currentPage - 2]?.content}
            </div>
        </div>
        {/* Left Page */}
        <div className={`page h-full w-sm lg:w-md 2xl:w-sm left-page z-10 ${flippingPage === 'left' ? 'flipping-left' : ''}`}>
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
        <div className="book-spine bg-customBlack"></div>
        {/* Right Page */}
        <div className={`page h-full w-sm lg:w-md 2xl:w-sm  right-page z-10 ${flippingPage === 'right' ? 'flipping-right' : ''}`}>
            <div 
                className={`bg-customWhite page-content ${currentPage < pages.length - 2 && !flippingPage ? 'page-clickable' : 'page-disabled'}`}
                onClick={flipRightPage}
            >
                {pages[currentPage + 1 ]?.content}
            </div>
            <div className="bg-customWhite page-content page-back">
                {pages[currentPage + 2]?.content}
            </div>
        </div>
        {/* Right Page Behind */}
        <div className="page h-full w-sm lg:w-md 2xl:w-sm right-page z-0">
            <div className="bg-customWhite page-content">
                {pages[currentPage + 3]?.content}
            </div>
        </div>
      </div>
      
      {/* Comment Section */}
      <div className='bg-customBlue w-xs h-screen border-l-1 border-l-customWhite items-center flex-col hidden md:hidden xl:hidden 2xl:flex'>
        <span className='flex flex-col py-1 px-11 mt-4 rounded-xl text-customWhite font-action font-semibold text-xl'>
          Comment Section ({comments.length})
        </span>
        <div className='flex flex-row mt-1 gap-1'>
          <button 
            onClick={() => {
              if (currentComment != 0) {
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
           /{Math.floor(comments.length / 10) + 1}
          </div>
          <button 
            onClick={() => {
              const maxPage = Math.floor(comments.length / 10);
              if (currentComment < maxPage) {
                setCurrentComment(currentComment + 1);
              }
            }}  
            className={`border-2 border-customWhite bg-customBlue hover:bg-customWhite py-1 px-3 rounded-xl text-customWhite hover:text-customBlue 
              ${currentComment >= Math.floor(comments.length / 10) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          ❯</button>
          <div className="relative flex justify-end w-30">
            <button                
              ref={filterTagBoxRef}
              onClick={() => setShowTagBox(prev => !prev)}
              onMouseEnter={() => setHoveredFilter(true)}
              onMouseLeave={() => setHoveredFilter(false)}
              className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>
              <img
                src="/filter_blue.svg"
                className={`absolute ${hoveredFilter ? "opacity-100" : "opacity-0"}`}
                width="25" height="15"
              />
              <img src="/filter_white.svg" width="25" height="15" />
            </button>
            {showTagBox &&
              <div className="absolute top-full mt-3.5 left-2 md:left-1/2 -translate-x-1/2 w-35 bg-customBlue p-2 flex flex-col gap-1 rounded-sm border-2 border-customWhite z-50">
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