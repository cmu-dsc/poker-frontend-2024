import { useState, useLayoutEffect, useEffect } from 'react';
import NavBar from '../layouts/NavBar';
import { Box, Container, TextField, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { TeamService } from '../../api/generated/services/TeamService';
import { MatchService } from '../../api/generated/services/MatchService';
import { UserService } from '../../api/generated/services/UserService';
import './leaderboard.css';

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

const Leaderboard = () => {
  const [rows, setRows] = useState([]);
  const [lastGames, setLastGames] = useState(10);
  const [filterLastGames, setFilterLastGames] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async (games) => {
      try {
        const teams = await TeamService.getAllTeams(games);
        const currUser = await UserService.getUserMe();
        const matches = await MatchService.getMatchTeam(currUser.teamId);

        const filteredTeams = teams.filter((team) => team.wins + team.losses > 0);

        const formattedTeams = await Promise.all(
          filteredTeams.map(async (team, index) => {
            const isCurrentUserTeam = team.githubUsername === currUser.teamId;
            const userWins = !isCurrentUserTeam ? matches.filter(
              (match) =>
                (match.team1Id === currUser.teamId && match.team2Id === team.githubUsername && match.team1Score > match.team2Score) ||
                (match.team2Id === currUser.teamId && match.team1Id === team.githubUsername && match.team2Score > match.team1Score)
            ).length : 0;
            const userLosses = !isCurrentUserTeam ? matches.filter(
              (match) =>
                (match.team1Id === currUser.teamId && match.team2Id === team.githubUsername && match.team1Score < match.team2Score) ||
                (match.team2Id === currUser.teamId && match.team1Id === team.githubUsername && match.team2Score < match.team1Score)
            ).length : 0;

            return {
              id: index + 1,
              githubUsername: team.githubUsername,
              members: team.members.join(', '),
              wins: team.wins || 0,
              losses: team.losses || 0,
              winRate: calculateWinRate(team.wins || 0, team.losses || 0),
              userWinRate: isCurrentUserTeam ? null : calculateWinRate(userWins, userLosses),
            };
          })
        );

        setRows(formattedTeams);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData(filterLastGames ? lastGames : undefined);
  }, [filterLastGames, lastGames]);

  const calculateWinRate = (wins, losses) => {
    const totalMatches = wins + losses;
    return totalMatches === 0 ? 0 : (wins / totalMatches) * 100;
  };

  const getWinRateTier = (winRate) => {
    if (winRate >= 90) return 'diamond';
    if (winRate >= 70) return 'platinum';
    if (winRate >= 55) return 'gold';
    if (winRate >= 40) return 'silver';
    return 'bronze';
  };

  const handleLastGamesChange = (event) => {
    setLastGames(parseInt(event.target.value));
  };

  const handleFilterLastGamesChange = (event) => {
    setFilterLastGames(event.target.checked);
  };

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mt: 4, mb: 4 }}>
          <h1 style={{ position: 'absolute', top: 40, left: 300 }}>Leaderboard</h1>
          <Box sx={{ position: 'absolute', top: 90, right: 60, left: Math.max(useWindowSize()[0] - 448, 652), whiteSpace: 'nowrap', }}>
            <FormControlLabel
              control={<Checkbox checked={filterLastGames} onChange={handleFilterLastGamesChange} />}
              label="Filter Last Games"
            />
            <TextField
              label="Last Games"
              type="number"
              value={lastGames}
              onChange={handleLastGamesChange}
              disabled={!filterLastGames}
              sx={{ ml: 2 }}
            />
          </Box>
        </Box>
        <div style={{ position: 'absolute', left: 300, top: 180, paddingBottom: 100, height: (50 * rows.length) + 127, maxHeight: 850, width: useWindowSize()[0] - 360, minWidth: 740 }}>
          <DataGrid
            rows={rows}
            columns={getColumns(filterLastGames ? `the last ${lastGames}` : 'all')}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 15 },
              },
              sorting: {
                sortModel: [{ field: 'winRate', sort: 'desc' }],
              },
            }}
            pageSizeOptions={[15, 25, 50]}
            getCellClassName={(params) => {
              if (params.field === 'winRate') {
                const winRate = params.value;
                return `win-rate-cell ${getWinRateTier(winRate)}`;
              }
              return '';
            }}
          />
        </div>
      </Container>
    </>
  );
};

const getColumns = (lastGames) => [
  { field: 'githubUsername', headerName: <strong>GitHub Username</strong>, flex: 1.5 },
  { field: 'members', headerName: <strong>Members</strong>, flex: 2.5 },
  {
    field: 'wins',
    headerName: (
      <Tooltip title={`This team's wins in ${lastGames} games it played`}>
        <strong>Wins</strong>
      </Tooltip>
    ),
    flex: 1
  },
  {
    field: 'losses',
    headerName: (
      <Tooltip title={`This team's losses in ${lastGames} games it played`}>
        <strong>Losses</strong>
      </Tooltip>
    ),
    flex: 1
  },
  {
    field: 'winRate',
    headerName: (
      <Tooltip title={`This team's win rate in ${lastGames} games it played`}>
        <strong>Win Rate</strong>
      </Tooltip>
    ),
    width: 125,
    flex: 1,
    valueFormatter: (params) => `${params.value.toFixed(2)}%`,
  },
  {
    field: 'userWinRate',
    headerName: (
      <Tooltip title="Your all time win rate against this team">
        <strong>Your Win Rate</strong>
      </Tooltip>
    ),
    width: 125,
    flex: 1.5,
    valueFormatter: (params) => params.value === null ? 'N/A' : `${params.value.toFixed(2)}%`,
  },
];

export default Leaderboard;