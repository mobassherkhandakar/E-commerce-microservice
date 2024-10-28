import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config()

const app = express();

// Middleware

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes

app.get('/health', (req, res) => {
    res.status(200).json({ status: "UP" })
});
//404 Not Found

app.use((req, res) => {
    res.status(404).json({ message: "404 Not Found" })
})

// Error Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
const port = process.env.PORT || 5002
const serviceName = process.env.SERVICE_NAME || "inventory";

app.listen(port, () => {
    console.log(`${serviceName} service is running on port ${port}`);
});