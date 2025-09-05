import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import path from 'path';

const app = express();
const __dirname = path.resolve();

app.use(express.json());

app.use(cors({origin:"*",credentials:true}));
app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:true,limit:'16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/invoices",invoiceRoutes);

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,'client/build', 'index.html'));
    })
}

export default app;