import { useState, useEffect } from 'react';
import NavBar from '../layouts/NavBar';
import { Button, List, ListItem, ListItemText, Dialog, DialogActions, DialogTitle, TextField, Box, Container, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../api/generated/services/UserService';
import { TeamService } from '../../api/generated/services/TeamService';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import loadingimg from '../assets/loading.gif'

const TeamManagement = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [newMembers, setNewMembers] = useState(['', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userResponse = await UserService.getUserMe();
            const teamResponse = await TeamService.getTeam(userResponse.teamId);
            setTeamData(teamResponse);
            setNewMembers(Array(4 - teamResponse.members.length).fill(''));
          } else {
            setTeamData(null);
            setNewMembers(['', '', '']);
          }
        });
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    fetchTeamData();
  }, []);

  const handleLeaveTeam = () => {
    setOpen(true);
  };

  const confirmLeaveTeam = async () => {
    try {
      setLoading(true);
      await UserService.postUserTeamLeave();
      setLoading(false);
      navigate('/create-team');
    } catch (error) {
      console.error('Error leaving team:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNewMemberChange = (index, value) => {
    const updatedNewMembers = [...newMembers];
    updatedNewMembers[index] = value;
    setNewMembers(updatedNewMembers);
  };

  const handleAddMembers = async () => {
    const newMembersToAdd = newMembers.filter((member) => member.trim() !== '');
    if (newMembersToAdd.length > 0) {
      const updatedMembers = [...teamData.members, ...newMembersToAdd];
      const updatedTeamData = { ...teamData, members: updatedMembers };

      try {
        setLoading(true);
        await TeamService.putTeam(teamData.githubUsername, updatedTeamData);
        const currUser = await UserService.getUserMe();
        const currTeam = await TeamService.getTeam(currUser.teamId);
        setLoading(false);
        setTeamData(currTeam);
        setNewMembers(Array(4 - currTeam.members.length).fill(''));
        setErrorMessage('');
      } catch (error) {
        console.error('Error updating team:', error);

        let errorMessage = 'An error occurred while adding team members. Please try again.';

        if (error.status === 422) {
          errorMessage = error.response?.data?.message || 'Andrewid is already in a team.';
        }

        setErrorMessage(errorMessage);
      }
    }
  };

  if (!teamData || loading) {
    return <div>
      <img src={loadingimg} width='100' height='100' />
      <h2>Loading</h2>
    </div>;
  }

  const isAddMembersDisabled = teamData.members.length >= 4;

  return (
    <>
      <NavBar />
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <h1 style={{ position: 'absolute', left: 300, top: 40, whiteSpace: 'nowrap' }}>Team Management</h1>
        </Box>
        <Box sx={{ mb: 4 }}>
          <h3 style={{ position: 'absolute', left: 300, top: 150, whiteSpace: 'nowrap' }}>Github Username: {teamData.githubUsername}</h3>
        </Box>
        <List sx={{ position: 'absolute', left: 285, top: 200 }}>
          {teamData.members.map((member, index) => (
            <ListItem key={member}>
              <ListItemText primary={`Team Member ${index + 1}:`} secondary={member} />
            </ListItem>
          ))}
          {newMembers.map((member, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`Team Member ${teamData.members.length + index + 1}:`}
                secondary={
                  <TextField
                    value={member}
                    onChange={(e) => handleNewMemberChange(index, e.target.value)}
                    placeholder="Enter AndrewID"
                    fullWidth
                    height='15'
                  />
                }
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 30, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            sx={{ position: 'absolute', marginTop: 18, left: 300, fontWeight: 'bold' }}
            variant="contained"
            onClick={handleAddMembers}
            disabled={isAddMembersDisabled}
          >
            Add Team Members
          </Button>
          <Button
            sx={{ position: 'absolute', marginTop: 18, left: 500, whiteSpace: 'nowrap', fontWeight: 'bold' }}
            variant="contained"
            color="error"
            onClick={handleLeaveTeam}
          >
            Leave Team
          </Button>
        </Box>
      </Container>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{"Are you sure you want to leave the team?"}</DialogTitle>
        <DialogActions>
          <Button onClick={confirmLeaveTeam} color="primary">
            Leave Team
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}
    </>
  );
};

export default TeamManagement;
