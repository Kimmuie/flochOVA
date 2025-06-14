import React from "react";

const Note1 = ({ openNote1 }) => {
  if (!openNote1) return null;

  return (
    <div className="absolute w-full h-full bg-customWhite flex justify-center items-center opacity-40 px-4 py-2 text-lg text-black cursor-pointer"
    onClick={() => openNote1(false)}>
      <span className="cursor-text font-action">Thank you for entering this site</span>
    </div>
  );
};

export default Note1;