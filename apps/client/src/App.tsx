import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Main from './features/main/Main';

// Desktop entry point that keeps routing hash-based for Tauri compatibility.
const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <HashRouter>
        <Routes>
          <Route path="/*" element={<Main />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
