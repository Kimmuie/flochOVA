import React, { memo } from "react";

const Note1 = memo(({ openNote1, onClose }) => {
  if (!openNote1) return null;

  return (
    <div className="absolute w-full h-full flex justify-center items-center z-20 animate-fadeDown">
      <div className="absolute inset-0 bg-customWhite opacity-80 cursor-pointer" onClick={onClose}></div>
      <div className="relative text-lg text-customBlack font-action w-full max-w-xl">
          This fan-made OVA was created to further explore the character of Floch Forster, offering a deeper look into his story with the addition of some original characters to enhance the emotional and narrative experience. Please note that this project does not alter any canon events from Attack on Titan.
          Most of the artwork has been traced or inspired by various anime sources. If any copyright issues arise, I will take this site down immediately out of respect for the original creators.
          This is a non-profit, fan-created project made purely out of passion and hobby. However, if you'd like to support me, you can leave a tip on Buy Me a Coffee.
          Thank you for understanding and enjoy the story!
        <div className="flex justify-end mt-6">
          <span className="italic">— Kimmuie</span>
        </div>
      </div>
    </div>
  );
});

export default Note1;