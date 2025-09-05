import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import path from 'path';
import { fileURLToPath } from "url";

const app = express();

app.use(express.json());

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true,limit:'16kb'}));
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/invoices",invoiceRoutes);

if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

export default app;