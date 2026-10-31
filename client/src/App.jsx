import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6">
        <h1 className="text-3xl font-bold text-teal-600 mb-2">SamvadAI</h1>
        <p className="text-slate-600 dark:text-slate-400">Voice & Conversational Intelligence Platform</p>
      </div>
    </BrowserRouter>
  );
}
