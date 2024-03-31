import { useState } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemText, Box, Button } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import logoImage from '../../images/pokerlogo.jpeg';
import { getAuth, signOut } from 'firebase/auth';

export default function NavBar () {
  const navigate = useNavigate();
  const [setUser] = useState(null);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', external: false },
    { name: 'Manage Team', path: '/team-management', external: false },
    { name: 'Leaderboard', path: '/leaderboard', external: false },
    { name: 'Schedule', path: '/schedule', external: false },
    { name: 'Starter Template Code', path: '/template-code', external: false },
    { name: 'Game Visualizer', path: 'https://cmu-poker-ai-2024.streamlit.app/', external: true },
    { name: 'Splash Page', path: 'https://cmudsc.com/pokerai', external: true },
  ];

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUser(null);
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <List>
        <ListItem disablePadding sx={{ justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
          <NavLink to="/dashboard" style={{ width: '70%', display: 'flex', justifyContent: 'center' }}>
            <img src={logoImage} alt="Poker Logo" style={{ width: '70%', cursor: 'pointer' }} />
          </NavLink>
        </ListItem>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            {item.external ? (
              <a href={item.path} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', width: '100%', textDecoration: 'none' }}>
                <ListItemButton>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </a>
            ) : (
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  color: 'inherit',
                  width: '100%',
                  backgroundColor: isActive ? '#f0f0f0' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                })}
              >
                <ListItemButton>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </NavLink>
            )}
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 'auto', width: '100%', textAlign: 'center' }}>
        <Button onClick={handleLogout} variant="outlined" sx={{ my: 5, color: 'red', borderColor: 'inherit', fontWeight: 'bold', borderWidth: '1.5px' }}>
          Log Out
        </Button>
      </Box>
    </Drawer>
  );
}
