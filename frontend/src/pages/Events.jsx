import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

const events = [
  {
    id: 1,
    title: "Tech Networking Night",
    date: "May 15, 2026",
    location: "Sarajevo",
  },
  {
    id: 2,
    title: "Startup Meetup",
    date: "May 22, 2026",
    location: "Mostar",
  },
  {
    id: 3,
    title: "Business Innovation Conference",
    date: "June 5, 2026",
    location: "Sarajevo",
  },
];

function Events() {
  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Available Events
      </Typography>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} md={4} key={event.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {event.title}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  Date: {event.date}
                </Typography>

                <Typography sx={{ mb: 2 }}>
                  Location: {event.location}
                </Typography>

                <Button variant="outlined">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Events;