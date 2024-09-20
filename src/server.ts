import express, { Express } from "express";
import cors from "cors";
import { env } from "./env";

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

app.listen({ port: env.PORT }, () => {
  console.log(`🔥 Server running on port ${env.PORT}`);
});
