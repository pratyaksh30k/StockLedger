import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import path from 'path';

const app = express();

const _dirname = path.resolve();

app.use(express.json());

app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true,limit:'16kb'}));
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/invoices",invoiceRoutes);

app.use(express.static(path.join(_dirname, "/client/dist")));
app.get("/{*any}",(req,res)=>{
    res.sendFile(path.resolve(_dirname,"client","dist","index.html"));
})

export default app;