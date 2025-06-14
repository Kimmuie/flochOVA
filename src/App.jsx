import { BrowserRouter as Router, Routes, Route, useLocation, useParams } from "react-router-dom";
import React, { useState } from "react";
import Homepage from "./pages/Homepage";

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/homepage" element={<Homepage />} />
      </Routes>
    </Router>
  );
};

export default App;