import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const frontendPath = path.join(__dirname, '../frontend');

import paginas from "./router/pages.routes.js";
import posts from "./router/auth.routes.js";

dotenv.config()
const app = express();

app.use(express.json());
app.use(cors({origin: process.env.CORS_ORIGIN,credentials: process.env.CORS_CREDENTIALS === 'true'}));
app.use(cookieParser());
app.use(express.static(path.join(frontendPath, '/public')));
app.set('trust proxy', 1);


app.use("/",paginas)
app.use('/api/auth', posts);

// console.log("HOLAs")
// console.log(frontendPath)

//console.log(process.env);






export default app;