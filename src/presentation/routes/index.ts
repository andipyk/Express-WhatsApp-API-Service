import { Application, Router } from 'express';
import { healthRouter } from './health.routes';
import { whatsappRouter } from './whatsapp.routes';
import { scheduledMessageRouter } from './scheduled-message.routes';

export const setupRoutes = (app: Application): void => {
  const apiRouter = Router();
  
  // Health check route
  apiRouter.use('/health', healthRouter);
  
  // WhatsApp routes
  apiRouter.use('/whatsapp', whatsappRouter);

  // Scheduled message routes
  apiRouter.use('/scheduled-messages', scheduledMessageRouter);
  
  // Base API route
  app.use('/api/v1', apiRouter);
}; 