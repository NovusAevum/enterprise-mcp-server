/**
 * Enterprise Security Manager
 *
 * Comprehensive security management with threat detection, vulnerability scanning,
 * access control, and security monitoring capabilities.
 *
 * @author Wan Mohamad Hanis bin Wan Hassan
 * @version 1.0.0
 */
import { ConfigManager } from '../config/config.js';
export declare class SecurityManager {
    private logger;
    private config;
    private securityConfig;
    private blockedIPs;
    private suspiciousActivities;
    private securityEvents;
    constructor(config: ConfigManager);
    private getDefaultSecurityConfig;
    initialize(): Promise<void>;
    validateRequest(request: any): Promise<boolean>;
    private validateRequestSize;
    private validateContent;
    private validateAuthentication;
    private validateJWT;
    private checkRateLimit;
    private getClientId;
    scanCode(path: string, language: string): Promise<any[]>;
    private scanFile;
    private scanDirectory;
    private isCodeFile;
    private getSecurityPatterns;
    private findLineNumber;
    private logSecurityEvent;
    private sendSecurityAlert;
    private startSecurityMonitoring;
    private analyzeSecurityEvents;
    encrypt(data: string, key?: string): string;
    decrypt(encryptedData: string, key?: string): string;
    generateSecureToken(): string;
    hashPassword(password: string): string;
    getSecurityReport(): any;
}
//# sourceMappingURL=security.d.ts.map