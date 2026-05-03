import { Box, Button, Container, Typography } from "@mui/material";

function Home() {
  return (
    <Container>
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
          Welcome to Scanova
        </Typography>

        <Typography variant="h6" sx={{ mb: 4 }}>
          Discover events, book tickets, and manage event attendance with QR-based check-in.
        </Typography>

        <Button variant="contained" size="large" href="/events">
          Browse Events
        </Button>
      </Box>
    </Container>
  );
}

export default Home;