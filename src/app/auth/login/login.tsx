'use client';

import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import {useTheme} from "@mui/material/styles"
export default function SignupPage() {
const theme=useTheme()
const mode = theme.palette.mode
  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Paper elevation={3}>
        <Grid container columns={{ xs: 1, md: 2 }}>
          {/* Left side */}
          <Grid
            columnSpan={{ xs: 1, md: 1 }}
            sx={{
              backgroundColor: mode === 'light'? theme.palette.primary.contrastText:theme.palette.secondary.contrastText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: mode === 'light'? theme.palette.background.paper:theme.palette.background.default,
              p: 4,
              textAlign: 'center',
            }}
          >
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Welcome to Nestfinity
              </Typography>
              <Typography variant="body1">
                Sign up and start connecting with your world.
              </Typography>
            </Box>
          </Grid>
            
          {/* Right side */}
          <Grid columnSpan={{ xs: 1, md: 1 }} sx={{ p: 6 }}>
            <Typography variant="h4" gutterBottom >
              Create Account
            </Typography>

            <Stack spacing={3} mt={3}>
              <TextField label="Full Name"  fullWidth/>
              <TextField label="Email" fullWidth />
              <TextField label="Password" type="password" fullWidth />
              <TextField label="Confirm Password" type="password" fullWidth />
              <Button variant="contained" size="large" color="primary" fullWidth>
                Sign Up
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
