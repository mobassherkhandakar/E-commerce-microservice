import express, { RequestHandler } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { addToCart, getMyCart } from './controllers';
import "./events/onKeyExpires"
dotenv.config();

const app = express();

// security middleware
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (_req, res) => {
        res
            .status(429)
            .json({ message: 'Too many requests, please try again later.' });
    },
});
app.use('/api', limiter);
// request logger
app.use(morgan('dev'));
app.use(express.json());

// TODO: Auth middleware

app.get('/health', (_req, res) => {
    res.json({ message: 'Cart Service is running' });
});

// routes
app.post("/cart/add-to-cart", addToCart as RequestHandler)
app.get("/cart/me", getMyCart as RequestHandler)

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// error handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

const port = process.env.PORT || 4002
const serviceName = process.env.SERVICE_NAME || "Cart-Service";

app.listen(port, () => {
    console.log(`${serviceName} is running on port ${port}`);
}); 