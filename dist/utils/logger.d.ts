/**
 * Enterprise-grade logging service with structured logging, rotation, and security features
 *
 * @author Wan Mohamad Hanis bin Wan Hassan
 * @version 1.0.0
 */
export declare class Logger {
    private sensitiveFields;
    constructor();
    private ensureLogDirectory;
    private sanitizeSensitiveData;
    private generateRequestId;
    private writeLog;
    private writeToFile;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, error?: any): void;
    debug(message: string, meta?: any): void;
    security(message: string, meta?: any): void;
    audit(message: string, meta?: any): void;
    performance(message: string, duration: number, meta?: any): void;
}
//# sourceMappingURL=logger.d.ts.map