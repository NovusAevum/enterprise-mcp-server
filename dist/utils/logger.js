"use strict";
/**
 * Enterprise-grade logging service with structured logging, rotation, and security features
 *
 * @author Wan Mohamad Hanis bin Wan Hassan
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const crypto_1 = require("crypto");
class Logger {
    sensitiveFields = ['password', 'token', 'key', 'secret', 'credential'];
    constructor() {
        // Initialize logging directory
        this.ensureLogDirectory();
    }
    ensureLogDirectory() {
        const fs = require('fs');
        const path = require('path');
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }
    sanitizeSensitiveData(data) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }
        const sanitized = { ...data };
        for (const key in sanitized) {
            if (this.sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                sanitized[key] = '[REDACTED]';
            }
            else if (typeof sanitized[key] === 'object') {
                sanitized[key] = this.sanitizeSensitiveData(sanitized[key]);
            }
        }
        return sanitized;
    }
    generateRequestId() {
        return (0, crypto_1.createHash)('sha256')
            .update(Date.now().toString() + Math.random().toString())
            .digest('hex')
            .substring(0, 16);
    }
    writeLog(level, message, meta) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: 'enterprise-mcp-server',
            requestId: meta?.requestId || this.generateRequestId(),
            ...this.sanitizeSensitiveData(meta)
        };
        // Console output
        const consoleMessage = `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`;
        if (level === 'error') {
            console.error(consoleMessage);
        }
        else if (level === 'warn') {
            console.warn(consoleMessage);
        }
        else {
            console.log(consoleMessage);
        }
        // File output
        this.writeToFile(level, logEntry);
    }
    writeToFile(level, logEntry) {
        const fs = require('fs');
        const path = require('path');
        const logDir = path.join(process.cwd(), 'logs');
        const today = new Date().toISOString().split('T')[0];
        let filename;
        switch (level) {
            case 'error':
                filename = `error-${today}.log`;
                break;
            case 'warn':
                filename = `security-${today}.log`;
                break;
            default:
                filename = `application-${today}.log`;
        }
        const logPath = path.join(logDir, filename);
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(logPath, logLine);
    }
    info(message, meta) {
        this.writeLog('info', message, meta);
    }
    warn(message, meta) {
        this.writeLog('warn', message, meta);
    }
    error(message, error) {
        const meta = {
            error: error?.message || error,
            stack: error?.stack
        };
        this.writeLog('error', message, meta);
    }
    debug(message, meta) {
        this.writeLog('debug', message, meta);
    }
    security(message, meta) {
        this.writeLog('warn', `[SECURITY] ${message}`, meta);
    }
    audit(message, meta) {
        this.writeLog('info', `[AUDIT] ${message}`, meta);
    }
    performance(message, duration, meta) {
        this.writeLog('info', `[PERFORMANCE] ${message}`, { duration, ...meta });
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map