import React, { useState } from 'react';

const InteractiveBook = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [MaxPage, setMaxPage] = useState(100);
  const [hovered, setHovered] = useState(0);
  const [flippingPage, setFlippingPage] = useState(null); // 'left' or 'right'

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
          
          <p className="mb-4 text-base leading-relaxed text-gray-700">
            The uproar; the carriages, motor cars, omnibuses, vans, sandwich men shuffling and swinging; brass bands; barrel organs; in the triumph and the jingle and the strange high singing of some aeroplane overhead was what she loved; life; London; this moment of June.
          </p>
          
          <p className="mb-4 text-base leading-relaxed text-gray-700">
            For it was the middle of June. The War was over, except for some one like Mrs. Foxcroft at the Embassy last night eating her heart out because that nice boy was killed.
          </p>
          
          <div className="absolute bottom-6 right-6 text-sm text-gray-500">3</div>
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
          
          <p className="mb-4 text-base leading-relaxed text-gray-700">
            They had gone up into the smoking-room one evening. And she had felt suddenly, I cannot go through with it. I cannot commit this act of treachery against the human soul.
          </p>
          
          <p className="mb-4 text-base leading-relaxed text-gray-700">
            Yet it was a splendid morning too. Like the pulse of a perfect heart, life struck straight through the streets.
          </p>
          
          <div className="absolute bottom-6 right-6 text-sm text-gray-500">4</div>
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
        <button className='flex flex-col border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-11 mt-4 rounded-xl text-customWhite hover:text-customBlue font-action font-semibold text-lg'>Back Home</button>
        <button className='flex flex-col border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-11 mt-4 rounded-xl text-customWhite hover:text-customBlue'>
          <span className='font-action font-semibold text-lg '>Chapter 1</span>
          <span className='font-action font-semibold text-2xl'>The Dedication</span>
        </button>
        <div className='flex flex-row gap-1 mt-4'>
          <button className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>❮❮</button>
          <button className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>❮</button>
          <input
            type="text"
            placeholder="1"
            maxLength={8}
            value={`${currentPage + 1}/${MaxPage}`}
            className="text-center w-20 border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue"
            required
          />
          <button className='border-2 border-customWhite bg-customBlue hover:bg-customWhite cursor-pointer py-1 px-3 rounded-xl text-customWhite hover:text-customBlue'>❯</button>
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
      <div className='bg-customBlue w-xs h-screen border-l-1 border-l-customWhite flex items-center flex-col'>
        <span className='flex flex-col py-1 px-11 mt-4 rounded-xl text-customWhite font-action font-semibold text-xl'>Comment section</span>
        <div className='bg-customWhite w-75 rounded h-full'></div>
        <button className='flex flex-col border-2 border-customWhite bg-customWhite hover:bg-customBlue cursor-pointer py-1 w-75 mt-4 rounded-sm text-customBlue hover:text-customWhite font-action font-semibold text-2xl'>Add Comments</button>
      </div>
    </div>
  );
};

export default InteractiveBook;