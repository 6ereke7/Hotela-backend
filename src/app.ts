import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import roomsRouter from './module/rooms/rooms.routes.ts';
import authRouter from './module/auth/auth.routes.ts';
import { checkConnection } from './db/index.ts';
import { bookingsRouter } from './module/bookings/bookings.routes.ts';


const app: Application = express();
app.use(express.json());
app.use(cors());

app.get('/health', async (req: Request, res: Response) => {
    const dbStatus = await checkConnection(); 
    res.status(200).json({
        status: 'ok',
        dbStatus: dbStatus,
        timestamp: new Date().toISOString()
    })
})

app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/rooms', roomsRouter);
app.use('/api/v1/login', authRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('unhandled error', err.message)
    if (res.headersSent) {
        return next(err)
    }
    res.status(500).json({
        error: 'internal server error'
    })
})
 
export default app