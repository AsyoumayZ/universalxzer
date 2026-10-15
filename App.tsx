import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Page1 } from './pages/Page1';
import { Page2 } from './pages/Page2';
import { Page3Admin } from './pages/Page3Admin';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Discreet floating admin shortcut */}
      <nav className="fixed bottom-3 right-3 z-50">
        <Link
          to="/admin"
          className="bg-slate-900/90 hover:bg-slate-800 text-[11px] font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-full border border-slate-700 shadow-xl backdrop-blur transition"
        >
          Admin Panel
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
        <Route path="/admin" element={<Page3Admin />} />
      </Routes>
    </BrowserRouter>
  );
};