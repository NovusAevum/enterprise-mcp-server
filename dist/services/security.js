"use strict";
/**
 * Enterprise Security Manager
 *
 * Comprehensive security management with threat detection, vulnerability scanning,
 * access control, and security monitoring capabilities.
 *
 * @author Wan Mohamad Hanis bin Wan Hassan
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityManager = void 0;
const logger_js_1 = require("../utils/logger.js");
const crypto_1 = require("crypto");
class SecurityManager {
    logger;
    config;
    securityConfig;
    blockedIPs = new Set();
    suspiciousActivities = new Map();
    securityEvents = [];
    constructor(config) {
        this.config = config;
        this.logger = new logger_js_1.Logger();
        this.securityConfig = this.getDefaultSecurityConfig();
    }
    getDefaultSecurityConfig() {
        return {
            maxRequestSize: 10 * 1024 * 1024, // 10MB
            allowedFileTypes: ['.txt', '.md', '.json', '.yaml', '.yml', '.js', '.ts', '.py', '.java', '.go', '.rs', '.php'],
            blockedPatterns: [
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi,
                /eval\s*\(/gi,
                /document\./gi,
                /window\./gi,
                /alert\s*\(/gi,
                /confirm\s*\(/gi,
                /prompt\s*\(/gi
            ],
            rateLimitWindow: 60000, // 1 minute
            rateLimitMax: 100,
            encryptionAlgorithm: 'AES-256-GCM',
            jwtSecret: process.env.JWT_SECRET || (0, crypto_1.randomBytes)(32).toString('hex'),
            sessionTimeout: 3600000 // 1 hour
        };
    }
    async initialize() {
        try {
            this.logger.info('Initializing Security Manager');
            // Load security configuration
            const config = await this.config.get('security');
            if (config) {
                this.securityConfig = { ...this.securityConfig, ...config };
            }
            // Initialize security monitoring
            this.startSecurityMonitoring();
            this.logger.info('Security Manager initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Security Manager', error);
            throw error;
        }
    }
    async validateRequest(request) {
        try {
            const startTime = Date.now();
            // Check request size
            if (!this.validateRequestSize(request)) {
                this.logSecurityEvent('REQUEST_SIZE_EXCEEDED', 'high', 'Request size exceeds limit', request);
                return false;
            }
            // Check for malicious patterns
            if (!this.validateContent(request)) {
                this.logSecurityEvent('MALICIOUS_CONTENT_DETECTED', 'critical', 'Malicious content detected in request', request);
                return false;
            }
            // Validate authentication if required
            if (!await this.validateAuthentication(request)) {
                this.logSecurityEvent('AUTHENTICATION_FAILED', 'high', 'Authentication validation failed', request);
                return false;
            }
            // Check rate limiting
            if (!this.checkRateLimit(request)) {
                this.logSecurityEvent('RATE_LIMIT_EXCEEDED', 'medium', 'Rate limit exceeded', request);
                return false;
            }
            const duration = Date.now() - startTime;
            this.logger.performance('Request security validation completed', duration, { requestType: request.name });
            return true;
        }
        catch (error) {
            this.logger.error('Security validation failed', error);
            this.logSecurityEvent('SECURITY_VALIDATION_ERROR', 'high', 'Security validation error', { error: error.message });
            return false;
        }
    }
    validateRequestSize(request) {
        const requestSize = JSON.stringify(request).length;
        return requestSize <= this.securityConfig.maxRequestSize;
    }
    validateContent(request) {
        const content = JSON.stringify(request);
        for (const pattern of this.securityConfig.blockedPatterns) {
            if (pattern.test(content)) {
                return false;
            }
        }
        return true;
    }
    async validateAuthentication(request) {
        // Check for authentication token
        const token = request.headers?.authorization || request.token;
        if (!token) {
            // Allow unauthenticated requests for certain operations
            const allowedUnauthenticated = ['healthCheck', 'fileOperations'];
            return allowedUnauthenticated.includes(request.name);
        }
        try {
            // Validate JWT token
            return this.validateJWT(token);
        }
        catch (error) {
            this.logger.security('Invalid authentication token', { token: token?.substring(0, 10) + '...' });
            return false;
        }
    }
    validateJWT(token) {
        try {
            // Simple JWT validation (in production, use a proper JWT library)
            const parts = token.split('.');
            if (parts.length !== 3) {
                return false;
            }
            // Verify signature
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    checkRateLimit(request) {
        const clientId = this.getClientId(request);
        const now = Date.now();
        const windowStart = now - this.securityConfig.rateLimitWindow;
        // Clean old entries
        for (const [id, timestamp] of this.suspiciousActivities.entries()) {
            if (timestamp < windowStart) {
                this.suspiciousActivities.delete(id);
            }
        }
        // Check current rate
        const currentCount = this.suspiciousActivities.get(clientId) || 0;
        if (currentCount >= this.securityConfig.rateLimitMax) {
            return false;
        }
        this.suspiciousActivities.set(clientId, now);
        return true;
    }
    getClientId(request) {
        // Generate client ID based on request characteristics
        const identifier = request.headers?.['user-agent'] ||
            request.headers?.['x-forwarded-for'] ||
            request.source ||
            'unknown';
        return (0, crypto_1.createHash)('sha256').update(identifier).digest('hex');
    }
    async scanCode(path, language) {
        try {
            this.logger.info(`Starting code security scan for ${path}`, { language });
            const vulnerabilities = [];
            const fs = require('fs');
            const pathModule = require('path');
            if (!fs.existsSync(path)) {
                throw new Error(`Path does not exist: ${path}`);
            }
            const stats = fs.statSync(path);
            if (stats.isFile()) {
                vulnerabilities.push(...await this.scanFile(path, language));
            }
            else if (stats.isDirectory()) {
                vulnerabilities.push(...await this.scanDirectory(path, language));
            }
            this.logger.info(`Code security scan completed for ${path}`, {
                vulnerabilityCount: vulnerabilities.length,
                language
            });
            return vulnerabilities;
        }
        catch (error) {
            this.logger.error(`Code security scan failed for ${path}`, error);
            throw error;
        }
    }
    async scanFile(filePath, language) {
        const fs = require('fs');
        const vulnerabilities = [];
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // Language-specific security patterns
            const patterns = this.getSecurityPatterns(language);
            for (const pattern of patterns) {
                const matches = content.match(pattern.regex);
                if (matches) {
                    vulnerabilities.push({
                        type: pattern.type,
                        severity: pattern.severity,
                        description: pattern.description,
                        line: this.findLineNumber(content, matches[0]),
                        file: filePath,
                        language
                    });
                }
            }
            // Check for hardcoded secrets
            const secretPatterns = [
                /password\s*=\s*['"][^'"]+['"]/gi,
                /api_key\s*=\s*['"][^'"]+['"]/gi,
                /secret\s*=\s*['"][^'"]+['"]/gi,
                /token\s*=\s*['"][^'"]+['"]/gi
            ];
            for (const pattern of secretPatterns) {
                const matches = content.match(pattern);
                if (matches) {
                    vulnerabilities.push({
                        type: 'HARDCODED_SECRET',
                        severity: 'high',
                        description: 'Hardcoded secret detected',
                        line: this.findLineNumber(content, matches[0]),
                        file: filePath,
                        language
                    });
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to scan file: ${filePath}`, error);
        }
        return vulnerabilities;
    }
    async scanDirectory(dirPath, language) {
        const fs = require('fs');
        const path = require('path');
        const vulnerabilities = [];
        try {
            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                if (stats.isFile() && this.isCodeFile(file, language)) {
                    vulnerabilities.push(...await this.scanFile(filePath, language));
                }
                else if (stats.isDirectory()) {
                    vulnerabilities.push(...await this.scanDirectory(filePath, language));
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to scan directory: ${dirPath}`, error);
        }
        return vulnerabilities;
    }
    isCodeFile(filename, language) {
        const extensions = {
            javascript: ['.js', '.jsx'],
            typescript: ['.ts', '.tsx'],
            python: ['.py'],
            java: ['.java'],
            go: ['.go'],
            rust: ['.rs'],
            php: ['.php']
        };
        const ext = require('path').extname(filename);
        return extensions[language]?.includes(ext) || false;
    }
    getSecurityPatterns(language) {
        const patterns = {
            javascript: [
                {
                    type: 'XSS_VULNERABILITY',
                    severity: 'high',
                    description: 'Potential XSS vulnerability',
                    regex: /innerHTML\s*=|outerHTML\s*=/gi
                },
                {
                    type: 'SQL_INJECTION',
                    severity: 'critical',
                    description: 'Potential SQL injection',
                    regex: /query\s*\(\s*['"`][^'"`]*\$\{[^}]*\}[^'"`]*['"`]/gi
                }
            ],
            python: [
                {
                    type: 'COMMAND_INJECTION',
                    severity: 'critical',
                    description: 'Potential command injection',
                    regex: /os\.system\s*\(|subprocess\.call\s*\(|eval\s*\(/gi
                }
            ]
        };
        return patterns[language] || [];
    }
    findLineNumber(content, match) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(match)) {
                return i + 1;
            }
        }
        return 0;
    }
    logSecurityEvent(type, severity, message, details) {
        const event = {
            type,
            severity,
            message,
            timestamp: new Date().toISOString(),
            source: 'security-manager',
            details
        };
        this.securityEvents.push(event);
        this.logger.security(message, event);
        // Alert for critical events
        if (severity === 'critical') {
            this.sendSecurityAlert(event);
        }
    }
    sendSecurityAlert(event) {
        // Implementation for sending security alerts
        // This could integrate with email, Slack, or other notification systems
        this.logger.warn('SECURITY ALERT: Critical security event detected', event);
    }
    startSecurityMonitoring() {
        // Monitor for suspicious activities
        setInterval(() => {
            this.analyzeSecurityEvents();
        }, 300000); // Every 5 minutes
    }
    analyzeSecurityEvents() {
        const now = Date.now();
        const windowStart = now - (30 * 60 * 1000); // 30 minutes
        const recentEvents = this.securityEvents.filter(event => new Date(event.timestamp).getTime() > windowStart);
        const criticalEvents = recentEvents.filter(event => event.severity === 'critical');
        const highEvents = recentEvents.filter(event => event.severity === 'high');
        if (criticalEvents.length > 0) {
            this.logger.security('Multiple critical security events detected', { count: criticalEvents.length });
        }
        if (highEvents.length > 5) {
            this.logger.security('High volume of high-severity security events', { count: highEvents.length });
        }
    }
    encrypt(data, key) {
        const encryptionKey = key || this.securityConfig.jwtSecret;
        const iv = (0, crypto_1.randomBytes)(16);
        const cipher = require('crypto').createCipher(this.securityConfig.encryptionAlgorithm, encryptionKey);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    decrypt(encryptedData, key) {
        const encryptionKey = key || this.securityConfig.jwtSecret;
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = require('crypto').createDecipher(this.securityConfig.encryptionAlgorithm, encryptionKey);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    generateSecureToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    hashPassword(password) {
        return (0, crypto_1.createHash)('sha256').update(password + this.securityConfig.jwtSecret).digest('hex');
    }
    getSecurityReport() {
        return {
            timestamp: new Date().toISOString(),
            blockedIPs: Array.from(this.blockedIPs),
            suspiciousActivities: Array.from(this.suspiciousActivities.entries()),
            recentSecurityEvents: this.securityEvents.slice(-10),
            configuration: {
                maxRequestSize: this.securityConfig.maxRequestSize,
                rateLimitMax: this.securityConfig.rateLimitMax,
                encryptionAlgorithm: this.securityConfig.encryptionAlgorithm
            }
        };
    }
}
exports.SecurityManager = SecurityManager;
//# sourceMappingURL=security.js.map