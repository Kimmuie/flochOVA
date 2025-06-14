import React, { memo } from "react";

const Note1 = memo(({ openNote1, onClose }) => {
  if (!openNote1) return null;

  return (
    <div className="absolute w-full h-full flex justify-center items-center z-20 animate-fadeDown">
      <div className="absolute inset-0 bg-customWhite opacity-60 cursor-pointer" onClick={onClose}></div>
      <div className="relative text-lg text-customBlack font-action w-full max-w-xl">
          This OVA was created for parallel and further exploration of Floch Forster's character,
          including some original characters to make the story engaging and emotional. However, 
          it doesn't alter any canon events from Attack on Titan.
        <div className="flex justify-end mt-6">
          <span className="italic">— Kimmuie</span>
        </div>
      </div>
    </div>
  );
});

export default Note1;