import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { setupRoutes } from './presentation/routes';
import { errorHandler } from './presentation/middlewares/errorHandler';
import { swaggerDocument } from './config/swagger';

export class Server {
  private app: Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupDocs();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(express.raw({ type: 'application/json', limit: '50mb' }));
    this.app.use((req, res, next) => {
      if (req.body && Buffer.isBuffer(req.body)) {
        req.body = JSON.parse(req.body.toString());
      }
      next();
    });
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

  private setupDocs(): void {
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  private setupRoutes(): void {
    setupRoutes(this.app);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
      console.log(`API Documentation available at http://localhost:${this.port}/api-docs`);
    });
  }
} 