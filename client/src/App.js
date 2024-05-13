import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import MyNotes from './pages/myNotes';
import CompiledNotes from './pages/compiledNotes';
import MainLayout from './MainLayout';  // Import your new layout
import { AuthProvider } from './context/authContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            {/* Nested routes here will render inside MainLayout's <Outlet> */}
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
            <Route path="/my-notes/:groupId" element={<MyNotes />} />
            <Route path="/compiled-notes/:groupId" element={<CompiledNotes />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
