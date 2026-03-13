import express from "express";
import cors from "cors";
import { env } from "./config/env";
import {
  refreshToken,
  logout,
} from "./controllers/auth.controller";

// Import routes
import authRoutes from "./routes/auth.routes";
import organizationRoutes from "./routes/organization.routes";
import { RefreshTokenService } from "./service/refreshTokenService";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/organizations", organizationRoutes);
app.post("/refresh-token", refreshToken);
app.post("/logout", logout);

// 404 handler
app.use(async(_req, res) => {
  await RefreshTokenService.cleanupExpiredTokens();
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
  });
});



// Start server
const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
