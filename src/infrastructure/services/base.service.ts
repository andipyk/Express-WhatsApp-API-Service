import { Logger } from '../../utils/logger';
import { AppError } from '../../presentation/middlewares/errorHandler';
import { HTTP_STATUS } from '../../constants';

export abstract class BaseService {
  protected logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  protected async executeOperation<T>(
    operation: () => Promise<T>,
    {
      errorMessage,
      context,
      validateFn
    }: {
      errorMessage: string;
      context?: string;
      validateFn?: () => boolean | Promise<boolean>;
    }
  ): Promise<T> {
    try {
      if (validateFn) {
        const isValid = await validateFn();
        if (!isValid) {
          throw new AppError(HTTP_STATUS.BAD_REQUEST, errorMessage);
        }
      }

      return await operation();
    } catch (error) {
      this.logger.error(`Error in ${context || 'service operation'}: ${errorMessage}`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(HTTP_STATUS.INTERNAL_ERROR, errorMessage);
    }
  }

  protected validateState(
    condition: boolean,
    errorMessage: string,
    statusCode: number = HTTP_STATUS.BAD_REQUEST
  ): void {
    if (!condition) {
      throw new AppError(statusCode, errorMessage);
    }
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    {
      maxRetries = 3,
      delayMs = 1000,
      context = 'operation'
    }: {
      maxRetries?: number;
      delayMs?: number;
      context?: string;
    } = {}
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.error(
          `Attempt ${attempt}/${maxRetries} failed for ${context}:`,
          error
        );

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error(`Failed after ${maxRetries} attempts`);
  }

  protected async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    errorMessage: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new AppError(HTTP_STATUS.SERVICE_UNAVAILABLE, errorMessage));
      }, timeoutMs);
    });

    return Promise.race([operation(), timeoutPromise]);
  }
} 