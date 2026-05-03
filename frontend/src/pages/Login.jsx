import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";

function Login() {
  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 8, p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          Login
        </Typography>

        <Box component="form">
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
          />

          <Button fullWidth variant="contained" sx={{ mt: 3 }}>
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;