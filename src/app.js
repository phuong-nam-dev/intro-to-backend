import express from "express";

import cors from "cors";

import userRouter from "./routes/user.route.js";

const app = express();

const whitelist = ["http://localhost:3000", "https://your-frontend-domain.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin)) callback(null, true);
      else callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/users", userRouter);

export default app;
