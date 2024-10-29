import express, { RequestHandler } from 'express';
import cors from 'cors';
import morgan from 'morgan'
import dotenv from 'dotenv';
import { createProduct, getProductDetails, getProducts, updateProducts } from './controllers';

dotenv.config()

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP" })
})

// Endpoint to get inventory items

app.get("/products/:id", getProductDetails as RequestHandler)
app.put("/products/:id", updateProducts as RequestHandler)
app.get("/products", getProducts as RequestHandler)
app.post("/products", createProduct as RequestHandler)


// 404 handler

app.use((_req, res, next) => {
    res.status(404).json({ message: "Not Found" });
});

// Error handler

app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something broke!" });
});

const port = process.env.PORT || 4001
const serviceName = process.env.SERVICE_NAME || "Product-Service";

app.listen(port, () => {
    console.log(`${serviceName} is running on port ${port}`);
}); 