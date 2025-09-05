/**
 * Service Stubs for Enterprise MCP Server
 *
 * Placeholder implementations for all required services.
 * These will be expanded with full functionality in subsequent iterations.
 *
 * @author Wan Mohamad Hanis bin Wan Hassan
 * @version 1.0.0
 */
export declare class HealthChecker {
    private logger;
    initialize(): Promise<void>;
    performHealthCheck(args: any): Promise<any>;
    private getDiskUsage;
    private getNetworkStatus;
}
export declare class MetricsCollector {
    private logger;
    private metrics;
    initialize(): Promise<void>;
    recordToolCall(toolName: string, status: string): void;
    getMetrics(): any;
}
export declare class ToolRegistry {
    private logger;
    initialize(): Promise<void>;
}
export declare class AuditLogger {
    private logger;
    initialize(): Promise<void>;
    log(event: string, data: any): void;
}
export declare class RateLimiter {
    private logger;
    private limits;
    initialize(): Promise<void>;
    checkLimit(key: string): Promise<void>;
}
export declare class EncryptionService {
    private logger;
    initialize(): Promise<void>;
}
export declare class CloudManager {
    private logger;
    initialize(): Promise<void>;
    performDeployment(args: any): Promise<any>;
}
export declare class AIModelManager {
    private logger;
    initialize(): Promise<void>;
    performOperation(args: any): Promise<any>;
}
export declare class DatabaseManager {
    private logger;
    initialize(): Promise<void>;
    extractData(source: string): Promise<any>;
    transformData(source: string, transformation: string): Promise<any>;
    loadData(source: string, destination: string): Promise<any>;
    validateData(source: string): Promise<any>;
}
export declare class FileManager {
    private logger;
    initialize(): Promise<void>;
    performOperation(args: any): Promise<any>;
}
export declare class GitManager {
    private logger;
    initialize(): Promise<void>;
    performOperation(args: any): Promise<any>;
}
export declare class DockerManager {
    private logger;
    initialize(): Promise<void>;
    performOperation(args: any): Promise<any>;
}
export declare class KubernetesManager {
    private logger;
    initialize(): Promise<void>;
    performOperation(args: any): Promise<any>;
}
export declare class MonitoringService {
    private logger;
    initialize(): Promise<void>;
    start(): void;
    performOperation(args: any): Promise<any>;
    getPipelineMetrics(source: string): Promise<any>;
}
export declare class NotificationService {
    private logger;
    initialize(): Promise<void>;
    sendNotification(type: string, data: any): void;
}
//# sourceMappingURL=index.d.ts.map