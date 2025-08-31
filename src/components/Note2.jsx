import React from "react";

const Note2 = ({ openNote2, onClose }) => {
  if (!openNote2) return null;

  return (
    <div className="absolute w-full h-full flex justify-center items-center z-20">
      <div className="absolute inset-0 bg-customWhite opacity-80 cursor-pointer" onClick={onClose}></div>
      <div className="relative text-lg text-customBlack font-action w-full max-w-xl px-4">
          The Website, Manga Panel, and Storyline arrange by
          <br />
          <div className="flex flex-row gap-4">
          <a href="https://www.instagram.com/kimmuie_/" target="_blank">
            <button className="group my-5 bg-customBlack hover:bg-customWhite text-lg text-customWhite hover:text-customBlack font-action py-2 px-4 rounded-md flex flex-row items-center justify-center cursor-pointer active:scale-98">
              <img src="instagramBlack.svg" className="w-7 mr-3 hidden group-hover:block"/>
              <img src="instagramWhite.svg" className="w-7 mr-3 group-hover:hidden"/>
              kimmuie_
            </button>
          </a>
          <a href="https://github.com/Kimmuie" target="_blank">
            <button className="group my-5 bg-customBlack hover:bg-customWhite text-lg text-customWhite hover:text-customBlack font-action py-2 px-4 rounded-md flex flex-row items-center justify-center cursor-pointer active:scale-98">
              <img src="githubBlack.svg" className="w-7 mr-3 hidden group-hover:block"/>
              <img src="githubWhite.svg" className="w-7 mr-3 group-hover:hidden"/>
              Kimmuie
            </button>
          </a>
          </div>
          <br />
          Thank for letting use of the original character, Ellie Farmhart.
          <br />
          <a href="https://www.instagram.com/kn_237k/" target="_blank">
            <button className="group my-5 bg-customBlack hover:bg-customWhite text-lg text-customWhite hover:text-customBlack font-action py-2 px-4 rounded-md flex flex-row items-center justify-center cursor-pointer active:scale-98">
              <img src="instagramBlack.svg" className="w-7 mr-3 hidden group-hover:block"/>
              <img src="instagramWhite.svg" className="w-7 mr-3 group-hover:hidden"/>
              kn_237k
            </button>
          </a>
      </div>
    </div>
  );
};

export default Note2;