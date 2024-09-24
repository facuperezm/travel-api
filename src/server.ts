import express, { Express } from "express";
import cors from "cors";
import { env } from "./env";
import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";
import { updateTrip } from "./routes/update-trip";
import { getTripDetails } from "./routes/get-trip-details";

const app: Express = express();

app.use(
  cors({
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    origin: (origin, cb) => {
      const allowedOrigins = [env.FRONTEND_URL, "http://localhost:3000"]; // Añade los orígenes permitidos
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"), false);
      }
    },
    maxAge: 86400, // 1 day
  })
);
app.use(express.json());

app.post("/trips", createTrip);
app.get("/trips/:tripId/confirm", confirmTrip);
app.put("/trips/:tripId", updateTrip);
app.get("/trips/:tripId", getTripDetails);

app.listen({ port: env.PORT }, () => {
  console.log(`🔥 Server running on port ${env.PORT}`);
});
