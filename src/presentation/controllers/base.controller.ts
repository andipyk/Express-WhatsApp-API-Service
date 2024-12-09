import { Response } from 'express';
import { Logger } from '../../utils/logger';
import { AppError } from '../middlewares/errorHandler';
import { 
  createSuccessResponse, 
  createErrorResponse,
  SuccessResponse,
  ErrorResponse 
} from '../../types/api.types';
import { HTTP_STATUS } from '../../constants';

export abstract class BaseController {
  protected logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  protected sendSuccess<T>(
    res: Response,
    data?: T,
    message?: string,
    status: number = HTTP_STATUS.OK
  ): void {
    const response: SuccessResponse<T> = createSuccessResponse(data, message);
    res.status(status).json(response);
  }

  protected sendError(
    res: Response,
    error: unknown,
    defaultMessage: string = 'Internal server error'
  ): void {
    if (error instanceof AppError) {
      const response: ErrorResponse = createErrorResponse(error.message, error.statusCode);
      this.logger.error(`Application error: ${error.message}`, error);
      res.status(error.statusCode).json(response);
      return;
    }

    this.logger.error('Unexpected error:', error);
    const response: ErrorResponse = createErrorResponse(defaultMessage, HTTP_STATUS.INTERNAL_ERROR);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json(response);
  }

  protected async handleRequest<T>(
    res: Response,
    operation: () => Promise<T>,
    options: {
      successStatus?: number;
      successMessage?: string;
      errorMessage?: string;
      validation?: () => Promise<boolean>;
    } = {}
  ): Promise<void> {
    try {
      if (options.validation) {
        const isValid = await options.validation();
        if (!isValid) {
          throw new AppError(400, 'Validation failed');
        }
      }

      const result = await operation();
      this.sendSuccess(res, result, options.successMessage, options.successStatus);
    } catch (error) {
      this.logger.error(`${options.errorMessage}: `, error);
      this.sendError(res, error, options.errorMessage);
    }
  }
} 