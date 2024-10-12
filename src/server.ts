// src/server.ts
import express, { Express } from "express";
import cors from "cors";
import { env } from "./env";
import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";
import { updateTrip } from "./routes/update-trip";
import { getTripDetails } from "./routes/get-trip-details";
import { createActivity } from "./routes/create-activity";
import { createLink } from "./routes/create-link";
import { getActivities } from "./routes/get-activities";
import { getLinks } from "./routes/get-links";
import { getParticipant } from "./routes/get-participant";
import { confirmParticipant } from "./routes/confirm-participant";
import { getTripsParticipants } from "./routes/get-trip-participants";
import { login } from "./routes/login";
import { authenticate } from "./middleware/auth";

const app: Express = express();

app.use(
  cors({
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    origin: (origin, cb) => {
      const allowedOrigins = [env.FRONTEND_URL, "http://localhost:3000"];
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"), false);
      }
    },
    maxAge: 86400,
  })
);
app.use(express.json());

// Public Routes
app.post("/login", login);

// Protected Routes
app.post("/trips", authenticate, createTrip);
app.post("/trips/:tripId/activities", authenticate, createActivity);
app.post("/trips/:tripId/links", authenticate, createLink);

// GET Routes
app.get("/trips/:tripId/confirm", confirmTrip);
app.get("/trips/:tripId", authenticate, getTripDetails);
app.get("/trips/:tripId/participants", authenticate, getTripsParticipants);
app.get("/trips/:tripId/activities", authenticate, getActivities);
app.get("/trips/:tripId/links", authenticate, getLinks);
app.get("/participants/:participantId/confirm", confirmParticipant);
app.get("/participants/:participantId", getParticipant);

// PUT Routes
app.put("/trips/:tripId", authenticate, updateTrip);

app.listen({ port: env.PORT }, () => {
  console.log(`🔥 Server running on port ${env.PORT}`);
});
