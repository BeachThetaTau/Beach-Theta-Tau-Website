import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // Ensure this is a .tsx file
import Home from "./pages/Home";
import About from "./pages/About";
import Social from "./pages/Social";
import Professionalism from "./pages/Professionalism";
import Service from "./pages/Service";
import Apply from "./pages/Apply";
import Login from "./pages/Login"; // Ensure this is a .tsx file
import Signup from "./pages/Signup"; // Ensure this is a .tsx file
import Profile from "./pages/Profile"; // Ensure this is a .tsx file

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/social" element={<Social />} />
          <Route path="/professionalism" element={<Professionalism />} />
          <Route path="/service" element={<Service />} />
          <Route path="/apply" element={<Apply />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
