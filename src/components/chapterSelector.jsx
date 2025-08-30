import React, { memo } from "react";
import { useParams, useNavigate } from 'react-router-dom';

const Chapter = memo(({ openChapter, onClose }) => {
const navigate = useNavigate();
  if (!openChapter) return null;

  return (
    <div className="absolute w-full h-full flex justify-center items-center z-20 animate-fadeDown">
      <div className="cursor-pointer absolute inset-0 bg-customWhite opacity-80" onClick={onClose}></div>
        <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/manga/chapter_1')}
                className='cursor-pointer z-50 hover:bg-customWhite bg-customBlue hover:text-customBlue text-customWhite font-action font-semibold text-2xl border-2 py-2 px-4 rounded-xl'>
                Chapter 1 
                <br />
                Buried In The Memory
            </button>
            <button onClick={() => navigate('/manga/chapter_2')}
                className='cursor-pointer z-50 hover:bg-customWhite bg-customBlue hover:text-customBlue text-customWhite font-action font-semibold text-2xl border-2 py-2 px-4 rounded-xl'>
                Chapter 2
                <br />
                Coming Soon
            </button>
        </div>
    </div>
  );
});

export default Chapter;