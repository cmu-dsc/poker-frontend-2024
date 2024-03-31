import NavBar from '../layouts/NavBar';
import { Container, Box, List, ListItem, ListItemText } from '@mui/material';

const Schedule = () => {
  return (
    <>
      <NavBar />
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <h1 style={{ position: 'absolute', left: 300, top: 40, paddingRight: 50, whiteSpace: 'nowrap' }}>Schedule</h1>
          <h3 style={{ position: 'absolute', left: 300, top: 159 }}>3/29</h3>
          <List sx={{ position: 'absolute', left: 350, top: 160, paddingRight: 4 }}>
            <ListItem>
              <ListItemText primary="5pm - Check in"
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="6pm - Chat with Sam Ganzfried + Dinner" />
            </ListItem>
            <ListItem>
              <ListItemText primary="7pm - Opening Ceremony + Release Variant + T-Shirts" />
            </ListItem>
            <ListItem>
              <ListItemText primary="8pm - Form Teams" />
            </ListItem>
            <ListItem>
              <ListItemText primary="9:30pm - Off to work!" />
            </ListItem>
          </List>
          <h3 style={{ position: 'absolute', left: 300, top: 409 }}>3/30</h3>
          <List sx={{ position: 'absolute', left: 350, top: 410, paddingRight: 4 }}>
            <ListItem>
              <ListItemText primary="5pm - Chat Jump Trading + Dinner"
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="6pm - Chat with Tuomas Sandholm" />
            </ListItem>
            <ListItem>
              <ListItemText primary="7pm - Closing Ceremony + Prizes!!!" />
            </ListItem>
          </List>
        </Box>
      </Container>
    </>
  );
};

export default Schedule;
