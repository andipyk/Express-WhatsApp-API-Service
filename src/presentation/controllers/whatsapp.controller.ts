import { Request, Response } from 'express';
import { Container } from '../../infrastructure/di/container';
import { IWhatsAppService } from '../../domain/interfaces/whatsapp.service';
import { AppError } from '../middlewares/errorHandler';
import { BaseController } from './base.controller';
import { API_RESPONSES, HTTP_STATUS } from '../../constants';

export class WhatsAppController extends BaseController {
  private whatsappService: IWhatsAppService;

  constructor() {
    super();
    const container = Container.getInstance();
    this.whatsappService = container.get<IWhatsAppService>('whatsappService');
  }

  public sendMessage = async (req: Request, res: Response): Promise<void> => {
    await this.handleRequest(
      res,
      async () => {
        const { to, message } = req.body;

        if (!this.whatsappService.isReady()) {
          throw new AppError(
            HTTP_STATUS.SERVICE_UNAVAILABLE,
            API_RESPONSES.ERROR.NOT_READY
          );
        }

        await this.whatsappService.sendMessage({ to, message });
        return null;
      },
      {
        successMessage: API_RESPONSES.SUCCESS.MESSAGE_SENT,
        errorMessage: 'Failed to send WhatsApp message'
      }
    );
  };
} 