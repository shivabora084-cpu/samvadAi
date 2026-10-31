import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Chat from './pages/Chat.jsx';
import MyHistory from './pages/MyHistory.jsx';

// Admin Pages
import Dashboard from './pages/admin/Dashboard.jsx';
import Conversations from './pages/admin/Conversations.jsx';
import ConversationDetail from './pages/admin/ConversationDetail.jsx';
import Knowledge from './pages/admin/Knowledge.jsx';
import Tickets from './pages/admin/Tickets.jsx';
import Appointments from './pages/admin/Appointments.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* User / Guest Routes */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <MyHistory />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/conversations"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Conversations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/conversations/:id"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ConversationDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/knowledge"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Knowledge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tickets"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Tickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/appointments"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Appointments />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
