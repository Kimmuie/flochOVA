import React, { useState, useEffect, useContext } from "react";

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`absolute flex flex-col w-full h-screen items-center justify-center z-100 
        bg-customDarkBlue transition-transform duration-1000 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}>
      <span class="loader"></span>
      <div className="pt-10 text-customWhite text-lg font-action font-extrabold">Floch Forster</div>
    </div>
  );
};

export default LoadingScreen;
