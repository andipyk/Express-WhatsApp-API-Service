import { IScheduledMessageRepository } from '../../domain/entities/scheduled-message';
import { IWhatsAppService } from '../../domain/interfaces/whatsapp.service';
import { FileScheduledMessageRepository } from '../repositories/scheduled-message.repository';
import { WhatsAppService } from '../services/whatsapp.service';
import { ScheduleMessageUseCase } from '../../application/use-cases/schedule-message.use-case';
import { Logger } from '../../utils/logger';

export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerServices();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private registerServices(): void {
    // Register logger
    this.services.set('logger', Logger.getInstance());

    // Register repositories
    this.services.set(
      'scheduledMessageRepository',
      new FileScheduledMessageRepository()
    );

    // Register services
    this.services.set(
      'whatsappService',
      WhatsAppService.getInstance()
    );

    // Register use cases
    this.services.set(
      'scheduleMessageUseCase',
      new ScheduleMessageUseCase(
        this.get<IScheduledMessageRepository>('scheduledMessageRepository'),
        this.get<IWhatsAppService>('whatsappService')
      )
    );
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in container`);
    }
    return service as T;
  }
} 