import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Container, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert } from '@mui/material';
import { UserService } from '../../api/generated/services/UserService';
import { TeamService } from '../../api/generated/services/TeamService';
import { getAuth, signOut } from 'firebase/auth';
import loadingimg from '../assets/loading.gif'

export default function CreateTeam () {
  const navigate = useNavigate();
  const [setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [username, setUsername] = useState('');
  const [teamMember1, setTeamMember1] = useState('');
  const [teamMember2, setTeamMember2] = useState('');
  const [teamMember3, setTeamMember3] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

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


  const handleSubmit = (event) => {
    event.preventDefault();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const checkTeam = async () => {
      const currUser = await UserService.getUserMe();
      setUsername(currUser.andrewId);
      if (currUser.teamId) {
        navigate('/dashboard');
      } else {
        setLoading(false);
      }
    };

    checkTeam();
  }, [navigate]);

  if (loading) {
    return <div>
      <img src={loadingimg} width='100' height='100' />
      <h2>Loading</h2>
    </div>;
  }

  const handleFinalSubmit = async () => {
    console.log("Final Submission:", { teamName, teamMember1, teamMember2, teamMember3 });

    const members = [username];

    if (teamMember1) {
      members.push(teamMember1);
    }

    if (teamMember2) {
      members.push(teamMember2);
    }

    if (teamMember3) {
      members.push(teamMember3);
    }

    const teamBody = {
      githubUsername: teamName,
      members: members,
    };

    try {
      setLoading(true);
      await TeamService.postTeam(teamBody);
      setLoading(false);
      setOpen(false);
      navigate('/dashboard');
    } catch (error) {
      setLoading(false);
      console.log(error)
      console.error('Error creating team:', error);
      let errorMessage = 'An error occurred while trying to create your team.';

      if (error.status === 422) {
        errorMessage = error.response?.data?.message || 'Team with that github username already exists or a teammate is already in a team.';
      }
      setErrorMessage(errorMessage);
    }
  };

  const isSubmitDisabled = teamName.trim() === '';

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" color="inherit" fontWeight='bold' gutterBottom>
        Create Your Team
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="team-name"
          label="Github Username"
          name="teamName"
          autoComplete="team-name"
          autoFocus
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="team-name"
          label="You"
          name="teamName"
          autoComplete="team-name"
          autoFocus
          value={username}
          disabled
        />
        <TextField
          margin="normal"
          fullWidth
          id="team-member-1"
          label="Teammate 1 AndrewID"
          name="teamMember1"
          autoComplete="team-member-1"
          value={teamMember1}
          onChange={e => setTeamMember1(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="team-member-2"
          label="Teammate 2 AndrewID"
          name="teamMember2"
          autoComplete="team-member-2"
          value={teamMember2}
          onChange={e => setTeamMember2(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="team-member-3"
          label="Teammate 3 AndrewID"
          name="teamMember3"
          autoComplete="team-member-3"
          value={teamMember3}
          onChange={e => setTeamMember3(e.target.value)}
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }} disabled={isSubmitDisabled}>
          Submit
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Your Team:</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Team Name:</strong> {teamName}<br />
            <strong>You:</strong> {username}<br />
            <strong>Team Member 1:</strong> {teamMember1 || "N/A"}<br />
            <strong>Team Member 2:</strong> {teamMember2 || "N/A"}<br />
            <strong>Team Member 3:</strong> {teamMember3 || "N/A"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleFinalSubmit} color="primary">Confirm and Submit</Button>
        </DialogActions>
      </Dialog>
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}
      <Box sx={{ mt: 'auto', width: '100%', textAlign: 'center' }}>
        <Button onClick={handleLogout} variant="outlined" sx={{ my: 5, color: 'red', borderColor: 'inherit', fontWeight: 'bold', borderWidth: '1.5px' }}>
          Log Out
        </Button>
      </Box>
    </Container>
  );
}
