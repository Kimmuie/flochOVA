import { BrowserRouter as Router, Routes, Route, useLocation, useParams } from "react-router-dom";
import React, { useState } from "react";
import Homepage from "./pages/Homepage";
import InteractiveBook from "./pages/Mangapage";

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/home" element={<Homepage />} />
        <Route path="/manga" element={<InteractiveBook />} />
      </Routes>
    </Router>
  );
};

export default App;