import React, { useCallback, useState } from "react";
import ThreeScene from "../components/ThreeScene";
import Note1 from "../components/Note1";
import Note2 from "../components/Note2";
import Chapter from "../components/chapterSelector";

const Homepage = () => {
  const [openNote1, setOpenNote1] = useState(false);
  const [openNote2, setOpenNote2] = useState(false);
  const [openChapter, setOpenChapter] = useState(false);
  const [openBook, setOpenBook] = useState(false);
  const [backHome, setBackHome] = useState(true);

  const handleNote1Click = () => {
    setBackHome(false);
    setOpenNote1(true);
  };

  const handleNote2Click = () => {
    setBackHome(false);
    setOpenNote2(true);
  };

  const handleBookClick = () => {
    setBackHome(false);
    setOpenChapter(true)
    // setOpenBook(true);
  };

  const handleCoffeeClick = () => {
    window.open("https://coff.ee/kimmue", "_blank");
  };

  const handleBackToHome = () => {
    setOpenNote1(false);
    setOpenNote2(false);
    setOpenChapter(false)
    setOpenBook(false);
    setBackHome(true);
  };

  return (
    <>
      <Note1 openNote1={openNote1} onClose={handleBackToHome} />
      <Note2 openNote2={openNote2} onClose={handleBackToHome} />
      <Chapter openChapter={openChapter} onClose={handleBackToHome} />
      <ThreeScene 
        onNote1Click={handleNote1Click}
        onNote2Click={handleNote2Click}
        onBookClick={handleBookClick}
        onCoffeeClick={handleCoffeeClick}
        onBackHome={backHome}
      />
    </>
  );
};

export default Homepage;