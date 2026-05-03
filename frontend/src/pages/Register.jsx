import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";

function Register() {
  return (
    <Container maxWidth="sm">
      <Paper sx={{ mt: 8, p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          Register
        </Typography>

        <Box component="form">
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
          />

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

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
          />

          <Button fullWidth variant="contained" sx={{ mt: 3 }}>
            Create Account
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;