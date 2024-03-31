import NavBar from '../layouts/NavBar';
import { Container, Box, List, ListItem, ListItemText, Link } from '@mui/material';

const TemplateCode = () => {
  return (
    <>
      <NavBar />
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <h1 style={{ position: 'absolute', left: 300, top: 40, paddingRight: 50, whiteSpace: 'nowrap' }}>Template Code Instructions</h1>
          <List sx={{ position: 'absolute', left: 285, top: 160, paddingRight: 4 }}>
            <ListItem>
              <ListItemText
                primary="1. Make sure you are using the same GitHub account as the GitHub username you used for your team (important!)."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <span>
                    2. Go to{' '}
                    <Link href="https://github.com/cmu-dsc/poker-engine-2024" target="_blank" rel="noopener">
                      https://github.com/cmu-dsc/poker-engine-2024
                    </Link>
                  </span>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="3. On the top right, click 'Use this template' and then 'Create a new repository'." />
            </ListItem>
            <ListItem>
              <ListItemText primary="4. Set the owner to the GitHub username you used for your team." />
            </ListItem>
            <ListItem>
              <ListItemText primary="5. Set the repository name to 'poker-engine-2024'." />
            </ListItem>
            <ListItem>
              <ListItemText primary="6. Make sure to set your repository to private." />
            </ListItem>
            <ListItem>
              <ListItemText primary="7. Click 'Create repository'." />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="8. After it's created, the GitHub Action to upload your bot will run automatically. If it fails or you want to run it manually, go to 'Actions', 'Build and push bot', and on the right, click 'Run workflow'."
              />
            </ListItem>
          </List>
        </Box>
      </Container>
    </>
  );
};

export default TemplateCode;
