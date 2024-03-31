import { useState, useEffect } from 'react';
import './App.css';
import CreateTeam from './pages/create-team';
import Dashboard from './pages/dashboard';
import Leaderboard from './pages/leaderboard';
import Login from './pages/login';
import TeamManagement from './pages/team-management';
import Schedule from './pages/schedule';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { OpenAPI } from '../api/generated/core/OpenAPI';
import TemplateCode from './pages/template-code';
import { UserService } from '../api/generated/services/UserService';

function App () {
  const [user, setUser] = useState(null);
  const [hasTeam, setHasTeam] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const currUser = await UserService.getUserMe();
        if (currUser.teamId) {
          setHasTeam(true);
        } else {
          setHasTeam(false);
        }
      } else {
        setUser(null);
        setHasTeam(false);
      }
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        OpenAPI.TOKEN = token;
      } else {
        OpenAPI.TOKEN = null;
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [auth]);

  return (
    <Router>
      <Routes>
        {!user && <Route path="/" element={<Login setUser={setUser} />} />}
        {user && hasTeam && <Route path="/" element={<Navigate to="/dashboard" />} />}
        {user && !hasTeam && <Route path="/" element={<Navigate to="/create-team" />} />}

        {!user && <Route path="/create-team" element={<Navigate to="/" />} />}
        {user && !hasTeam && <Route path="/create-team" element={<CreateTeam />} />}
        {user && hasTeam && <Route path="/create-team" element={<Navigate to="/dashboard" />} />}

        <Route path="/dashboard" element={user ? <Dashboard setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/leaderboard" element={user ? <Leaderboard /> : <Navigate to="/" />} />
        <Route path="/template-code" element={user ? <TemplateCode /> : <Navigate to="/" />} />
        <Route path="/team-management" element={user ? <TeamManagement /> : <Navigate to="/" />} />
        <Route path="/schedule" element={user ? <Schedule /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
