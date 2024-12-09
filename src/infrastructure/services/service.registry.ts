import { BaseService } from './base.service';
import { Logger } from '../../utils/logger';
import { ServiceType, ServiceHealth, ServiceMetrics, ServiceState } from '../../types/service.types';
import { AppError } from '../../presentation/middlewares/errorHandler';
import { HTTP_STATUS } from '../../constants';
import { EventEmitter } from 'events';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<ServiceType, BaseService>;
  private serviceStates: Map<string, ServiceState>;
  private serviceMetrics: Map<string, ServiceMetrics>;
  private logger: Logger;
  private eventEmitter: EventEmitter;

  private constructor() {
    this.services = new Map();
    this.serviceStates = new Map();
    this.serviceMetrics = new Map();
    this.logger = Logger.getInstance();
    this.eventEmitter = new EventEmitter();
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public registerService(name: ServiceType, service: BaseService): void {
    if (!(service instanceof BaseService)) {
      throw new AppError(400, 'Invalid service implementation');
    }
    if (this.services.has(name)) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `Service ${name} is already registered`
      );
    }

    this.services.set(name, service);
    this.initializeServiceState(name);
    this.initializeServiceMetrics(name);
    this.logger.info(`Service ${name} registered successfully`);
  }

  public getService<T extends BaseService>(name: ServiceType): T {
    const service = this.services.get(name) as T;
    if (!service) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        `Service ${name} not found`
      );
    }
    return service;
  }

  public getServiceHealth(name: string): ServiceHealth {
    const state = this.getServiceState(name);
    const metrics = this.getServiceMetrics(name);

    return {
      status: this.determineHealthStatus(state, metrics),
      uptime: this.calculateUptime(state),
      lastCheck: new Date(),
      metrics,
      state,
    };
  }

  public getAllServicesHealth(): Record<string, ServiceHealth> {
    const health: Record<string, ServiceHealth> = {};
    for (const [name] of this.services) {
      health[name] = this.getServiceHealth(name);
    }
    return health;
  }

  public updateServiceState(name: string, state: Partial<ServiceState>): void {
    const currentState = this.getServiceState(name);
    this.serviceStates.set(name, { ...currentState, ...state });
  }

  public updateServiceMetrics(name: string, metrics: Partial<ServiceMetrics>): void {
    const currentMetrics = this.getServiceMetrics(name);
    this.serviceMetrics.set(name, { ...currentMetrics, ...metrics });
  }

  private initializeServiceState(name: string): void {
    this.serviceStates.set(name, {
      isReady: false,
      isInitializing: false,
      lastSync: new Date()
    });
  }

  private initializeServiceMetrics(name: string): void {
    this.serviceMetrics.set(name, {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageResponseTime: 0,
      lastOperationTime: new Date()
    });
  }

  private getServiceState(name: string): ServiceState {
    const state = this.serviceStates.get(name);
    if (!state) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        `Service state for ${name} not found`
      );
    }
    return state;
  }

  private getServiceMetrics(name: string): ServiceMetrics {
    const metrics = this.serviceMetrics.get(name);
    if (!metrics) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        `Service metrics for ${name} not found`
      );
    }
    return metrics;
  }

  private determineHealthStatus(
    state: ServiceState,
    metrics: ServiceMetrics
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (!state.isReady) return 'unhealthy';
    if (state.lastError) return 'degraded';
    
    const errorRate = metrics.failedOperations / metrics.totalOperations;
    if (errorRate > 0.1) return 'degraded';
    
    return 'healthy';
  }

  private calculateUptime(state: ServiceState): number {
    if (!state.lastSync) return 0;
    return Date.now() - state.lastSync.getTime();
  }

  private notifyStateChange(name: ServiceType, state: ServiceState): void {
    this.eventEmitter.emit('serviceStateChange', { name, state });
  }
} 