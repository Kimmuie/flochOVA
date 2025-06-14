import React, { useState } from "react";
import ThreeScene from "./components/ThreeScene";
import Note1 from "./components/Note1";

const App = () => {
  const [openNote1, setOpenNote1] = useState(false);
  const [openNote2, setOpenNote2] = useState(false);
  const [openBook, setOpenBook] = useState(false);
  const [openCoffee, setOpenCoffee] = useState(false);

  const handleNote1Click = () => {
    setOpenNote1(true);
  };

  const handleNote2Click = () => {
    setOpenNote2(true);
  };

  const handleBookClick = () => {
    setOpenBook(true);
  };

  const handleCoffeeClick = () => {
    setOpenCoffee(true);
  };

  const closeNote1 = () => {
    setOpenNote1(false);
  };

  return (
    <div className="relative w-full h-screen">
      <ThreeScene 
        onNote1Click={handleNote1Click}
        onNote2Click={handleNote2Click}
        onBookClick={handleBookClick}
        onCoffeeClick={handleCoffeeClick}
      />
      
      {/* Overlay UI Elements */}
      <div className="z-10">
        <Note1 openNote1={openNote1} onClose={closeNote1} />
      </div>
      
      {/* You can add other note components here */}
      {openNote2 && (
        <div className="absolute top-4 right-4 z-10 bg-white p-4 border rounded">
          Note 2 content
          <button onClick={() => setOpenNote2(false)} className="ml-2 text-red-500">×</button>
        </div>
      )}
    </div>
  );
};

export default App;