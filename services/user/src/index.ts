import express, { RequestHandler } from 'express';
import cors from 'cors';
import morgan from 'morgan'
import dotenv from 'dotenv';
import { createUser, getUserById } from './controllers';

dotenv.config()

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP" })
})

// app.use((req, res, next) => {
// 	const allowedOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];
// 	const origin = req.headers.origin || '';

// 	if (allowedOrigins.includes(origin)) {
// 		res.setHeader('Access-Control-Allow-Origin', origin);
// 		next();
// 	} else {
// 		res.status(403).json({ message: 'Forbidden' });
// 	}
// });

// Endpoint to get inventory items
app.get("/users/:id", getUserById as RequestHandler)
app.post("/users", createUser as RequestHandler)


// 404 handler

app.use((_req, res, next) => {
    res.status(404).json({ message: "Not Found" });
});

// Error handler

app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something broke!" });
});

const port = process.env.PORT || 4004
const serviceName = process.env.SERVICE_NAME || "User-Service";

app.listen(port, () => {
    console.log(`${serviceName} is running on port ${port}`);
}); 