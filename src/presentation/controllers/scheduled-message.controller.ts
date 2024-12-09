import { Request, Response } from 'express';
import { Container } from '../../infrastructure/di/container';
import { 
  IScheduleMessageUseCase, 
  CreateScheduledMessageDto, 
  BulkScheduleMessageDto 
} from '../../domain/entities/scheduled-message';
import { AppError } from '../middlewares/errorHandler';
import { BaseController } from './base.controller';
import { API_RESPONSES, HTTP_STATUS } from '../../constants';

export class ScheduledMessageController extends BaseController {
  private useCase: IScheduleMessageUseCase;

  constructor() {
    super();
    const container = Container.getInstance();
    this.useCase = container.get<IScheduleMessageUseCase>('scheduleMessageUseCase');
  }

  public scheduleMessage = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(
      res,
      async () => {
        const message = await this.useCase.schedule(req.body);
        return message;
      },
      {
        successStatus: HTTP_STATUS.CREATED,
        successMessage: API_RESPONSES.SUCCESS.MESSAGE_SCHEDULED,
        errorMessage: 'Failed to schedule message'
      }
    );
  };

  public scheduleBulkMessages = async (
    req: Request<unknown, unknown, BulkScheduleMessageDto>,
    res: Response
  ): Promise<void> => {
    await this.handleRequest(
      res,
      async () => {
        const { messages } = req.body;
        return await Promise.all(
          messages.map((msg: CreateScheduledMessageDto) => this.useCase.schedule(msg))
        );
      },
      {
        successStatus: HTTP_STATUS.CREATED,
        successMessage: API_RESPONSES.SUCCESS.MESSAGE_SCHEDULED,
        errorMessage: 'Failed to schedule bulk messages'
      }
    );
  };

  public cancelScheduledMessage = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(
      res,
      async () => {
        const { id } = req.params;
        const cancelled = await this.useCase.cancel(id);
        
        if (!cancelled) {
          throw new AppError(
            HTTP_STATUS.NOT_FOUND,
            API_RESPONSES.ERROR.MESSAGE_NOT_FOUND
          );
        }
        return null;
      },
      {
        successMessage: API_RESPONSES.SUCCESS.MESSAGE_CANCELLED,
        errorMessage: 'Failed to cancel scheduled message'
      }
    );
  };

  public getScheduledMessage = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(
      res,
      async () => {
        const { id } = req.params;
        const message = await this.useCase.get(id);
        
        if (!message) {
          throw new AppError(
            HTTP_STATUS.NOT_FOUND,
            API_RESPONSES.ERROR.MESSAGE_NOT_FOUND
          );
        }
        return message;
      },
      {
        errorMessage: 'Failed to get scheduled message'
      }
    );
  };

  public getAllScheduledMessages = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(
      res,
      () => this.useCase.getAll(),
      {
        errorMessage: 'Failed to get scheduled messages'
      }
    );
  };
} 