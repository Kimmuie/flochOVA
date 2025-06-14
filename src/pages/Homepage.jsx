import React, { useCallback, useState } from "react";
import ThreeScene from "../components/ThreeScene";
import Note1 from "../components/Note1";
import Note2 from "../components/Note2";

const Homepage = () => {
  const [openNote1, setOpenNote1] = useState(false);
  const [openNote2, setOpenNote2] = useState(false);
  const [openBook, setOpenBook] = useState(false);
  const [openCoffee, setOpenCoffee] = useState(false);

  const handleNote1Click = () => {
    setOpenNote1(!openNote1);
  };

  const handleNote2Click = () => {
    setOpenNote2(!openNote2);
  };

  const handleBookClick = () => {
    setOpenBook(true);
  };

  const handleCoffeeClick = () => {
    window.open("https://coff.ee/kimmue", "_blank");
  };

  return (
    <>
      <Note1 openNote1={openNote1} onClose={handleNote1Click} />
      <Note2 openNote2={openNote2} onClose={handleNote2Click} />
      <ThreeScene 
        onNote1Click={handleNote1Click}
        onNote2Click={handleNote2Click}
        onBookClick={handleBookClick}
        onCoffeeClick={handleCoffeeClick}
      />
    </>
  );
};

export default Homepage;