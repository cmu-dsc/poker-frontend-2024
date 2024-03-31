import { useState, useLayoutEffect, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import NavBar from '../layouts/NavBar';
import { Box, Container, Menu, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { UserService } from '../../api/generated/services/UserService';
import { MatchService } from '../../api/generated/services/MatchService';
import PropTypes from 'prop-types';

function useWindowSize () {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize () {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

const Dashboard = () => {
  const [rows, setRows] = useState([]);
  const [countdown, setCountdown] = useState('');
  const [userFirstName, setUserFirstName] = useState('');

  const openLogsInNewTab = async (matchId, logsType) => {
    try {
      let response;
      if (logsType === 'engineCsv') {
        response = await MatchService.getMatchLogsEngineCsv(matchId);
      } else if (logsType === 'engineTxt') {
        response = await MatchService.getMatchLogsEngineTxt(matchId);
      } else {
        response = await MatchService.getMatchLogsBot(matchId);
      }
      const logsUrl = response.downloadUrl;
      window.open(logsUrl, '_blank');
    } catch (error) {
      console.error(`Error retrieving ${logsType} logs:`, error);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const displayName = user.displayName;
        if (displayName) {
          const firstName = displayName.split(' ')[0];
          setUserFirstName(firstName);
        }
      } else {
        setUserFirstName('');
      }
    });

    const populateDashboard = async () => {
      const currUser = await UserService.getUserMe();
      setUserFirstName(currUser.andrewId);

      const matches = await MatchService.getMatchTeam(currUser.teamId);

      const formattedMatches = matches
        .map((match) => ({
          id: match.matchId,
          opponentTeam: match.team1Id === currUser.teamId ? match.team2Id : match.team1Id,
          timestamp: new Date(match.timestamp).getTime(),
          score: match.team1Id === currUser.teamId ? match.team1Score : match.team2Score,
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      const formattedMatchesWithDate = formattedMatches.map((match) => ({
        ...match,
        timestamp: new Date(match.timestamp).toLocaleString(),
      }));

      setRows(formattedMatchesWithDate);
    };

    const updateCountdown = () => {
      const now = new Date();
      const deadline = new Date('2024-03-30T17:00:00').toLocaleString('en-US', {
        timeZone: 'America/New_York',
      });
      const deadlineDate = new Date(deadline);
      const difference = deadlineDate.getTime() - now.getTime();
      const daysLeft = String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, '0');
      const hoursLeft = String(Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
      const minutesLeft = String(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const secondsLeft = String(Math.floor((difference % (1000 * 60)) / 1000)).padStart(2, '0');
      setCountdown("Submissions closed");
    };

    populateDashboard();
    updateCountdown();
    const timerId = setInterval(updateCountdown, 1000);

    return () => {
      unsubscribe();
      clearInterval(timerId);
    };
  }, []);

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <h1 style={{ position: 'absolute', left: 300, top: 40, whiteSpace: 'nowrap' }}>Welcome, {userFirstName}!</h1>
        </Box>
        <div style={{ position: 'absolute', left: 300, top: 180, paddingRight: 60, paddingBottom: 100, height: (50 * rows.length) + 111, maxHeight: 850, width: useWindowSize()[0] - 360, minWidth: 700 }}>
          <DataGrid
            rows={rows}
            columns={columns(openLogsInNewTab)}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            rowHeight={50}
          />
        </div>
      </Container>
      <Box
        sx={{
          position: 'absolute',
          top: 80,
          left: Math.max(useWindowSize()[0] - 291, 769),
          fontSize: '20px',
          color: '#333',
          backgroundColor: '#fff',
          border: '2px solid #333',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          padding: '10px 20px',
          borderRadius: '5px',
          boxShadow: '0px 3px 6px #00000029',
          whiteSpace: 'nowrap'
        }}
      >
        {countdown}
      </Box>
    </>
  );
};

const columns = (openLogsInNewTab) => [
  { field: 'opponentTeam', headerName: <strong>Opponent Team</strong>, flex: 1, align: 'left' },
  {
    field: 'timestamp',
    headerName: <strong>Timestamp</strong>,
    flex: 0.75,
    align: 'left',
    valueFormatter: (params) => new Date(params.value).toLocaleString(),
  },
  {
    field: 'score',
    headerName: <strong>Score</strong>,
    flex: 0.75,
    align: 'left',
    renderCell: (params) => (
      <Box
        sx={{
          color: params.value > 0 ? 'green' : 'red',
        }}
      >
        {params.value}
      </Box>
    ),
  },
  {
    field: 'logs',
    align: 'left',
    headerName: <strong>Logs</strong>,
    flex: 0.75,
    renderCell: (params) => <LogsButton matchId={params.row.id} openLogsInNewTab={openLogsInNewTab} />,
  },
];

const LogsButton = ({ matchId, openLogsInNewTab }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <button onClick={handleClick}>View Logs</button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => openLogsInNewTab(matchId, 'engineCsv')}>Engine Logs (CSV)</MenuItem>
        <MenuItem onClick={() => openLogsInNewTab(matchId, 'engineTxt')}>Engine Logs (TXT)</MenuItem>
        <MenuItem onClick={() => openLogsInNewTab(matchId, 'bot')}>Bot Logs</MenuItem>
      </Menu>
    </div>
  );
};

LogsButton.propTypes = {
  matchId: PropTypes.string.isRequired,
  openLogsInNewTab: PropTypes.func.isRequired,
};

export default Dashboard;
