import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser';
import cors from "cors";
import testRouter from './routes/test.routes.js'
import authRouter from './routes/user.routes.js'
import codeRouter from './routes/code.routes.js'
import adminRouter from './routes/admin.routes.js'
import contestRouter from './routes/contest.routes.js'
import problemRouter from './routes/problem.routes.js'
import userRouter from "./routes/user.routes.js";
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser());


app.use('/api/v1', testRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/code', codeRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/contest', contestRouter);
app.use('/api/v1/problem', problemRouter);
app.use("/api/v1/user", userRouter);


export { app };