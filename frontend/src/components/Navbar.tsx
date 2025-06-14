import { Link, type LinkProps } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, type ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const GlassAppBar = styled(AppBar)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '0px', // No border-radius for app bar
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  color: 'white',
}));

const StyledNavLink = styled(Button)<ButtonProps & LinkProps>(() => ({
  background: 'transparent',
  backdropFilter: 'blur(5px)',
  borderRadius: '10px',
  padding: '8px 15px',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
  },
}));

const StyledLogoutButton = styled(Button)<ButtonProps>(() => ({
  background: 'transparent',
  backdropFilter: 'blur(5px)',
  borderRadius: '10px',
  padding: '8px 15px',
  color: 'white',
  border: '1px solid #f44336',
  backgroundColor: '#f44336',
  '&:hover': {
    backgroundColor: '#d32f2f',
  },
}));

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <GlassAppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white', fontWeight: 'bold' }}>
          AutoTaskAI
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          {user ? (
            <>
              <StyledNavLink component={Link} to="/dashboard">
                Dashboard
              </StyledNavLink>
              <StyledNavLink component={Link} to="/tasks">
                Tasks
              </StyledNavLink>
              <StyledLogoutButton onClick={logout}>
                Logout
              </StyledLogoutButton>
            </>
          ) : (
            <>
              <StyledNavLink component={Link} to="/login">
                Login
              </StyledNavLink>
              <StyledNavLink component={Link} to="/register">
                Register
              </StyledNavLink>
            </>
          )}
        </Box>
      </Toolbar>
    </GlassAppBar>
  );
} 