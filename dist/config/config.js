"use strict";
/**
 * Configuration Manager
 *
 * Centralized configuration management with environment-specific settings,
 * validation, and secure credential handling.
 *
 * @author Wan Mohamad Hanis bin Wan Hassan
 * @version 1.0.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const logger_js_1 = require("../utils/logger.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ConfigManager {
    logger;
    config = {};
    configPath;
    constructor() {
        this.logger = new logger_js_1.Logger();
        this.configPath = path.join(process.cwd(), 'config');
    }
    async initialize() {
        try {
            this.logger.info('Initializing Configuration Manager');
            // Load environment variables
            this.loadEnvironmentVariables();
            // Load configuration files
            await this.loadConfigurationFiles();
            // Validate configuration
            this.validateConfiguration();
            this.logger.info('Configuration Manager initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Configuration Manager', error);
            throw error;
        }
    }
    loadEnvironmentVariables() {
        // Load from .env file if exists
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            require('dotenv').config({ path: envPath });
        }
        // Set default values
        this.config = {
            environment: process.env.NODE_ENV || 'development',
            port: parseInt(process.env.PORT || '3000'),
            logLevel: process.env.LOG_LEVEL || 'info',
            security: {
                jwtSecret: process.env.JWT_SECRET,
                encryptionKey: process.env.ENCRYPTION_KEY,
                sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000')
            },
            database: {
                url: process.env.DATABASE_URL,
                type: process.env.DATABASE_TYPE || 'postgres'
            },
            cloud: {
                aws: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    region: process.env.AWS_REGION || 'us-east-1'
                },
                gcp: {
                    projectId: process.env.GOOGLE_CLOUD_PROJECT,
                    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS
                },
                azure: {
                    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
                    tenantId: process.env.AZURE_TENANT_ID,
                    clientId: process.env.AZURE_CLIENT_ID,
                    clientSecret: process.env.AZURE_CLIENT_SECRET
                }
            }
        };
    }
    async loadConfigurationFiles() {
        const configFiles = ['config.json', 'config.yaml', 'config.yml'];
        for (const file of configFiles) {
            const filePath = path.join(this.configPath, file);
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const fileConfig = JSON.parse(content);
                    this.config = { ...this.config, ...fileConfig };
                    this.logger.info(`Loaded configuration from ${file}`);
                }
                catch (error) {
                    this.logger.warn(`Failed to load configuration from ${file}`, error);
                }
            }
        }
    }
    validateConfiguration() {
        const requiredFields = [
            'environment',
            'port',
            'logLevel'
        ];
        for (const field of requiredFields) {
            if (!this.config[field]) {
                throw new Error(`Missing required configuration field: ${field}`);
            }
        }
        this.logger.info('Configuration validation completed');
    }
    get(key) {
        return this.config[key];
    }
    set(key, value) {
        this.config[key] = value;
    }
    getAll() {
        return { ...this.config };
    }
    async save() {
        try {
            if (!fs.existsSync(this.configPath)) {
                fs.mkdirSync(this.configPath, { recursive: true });
            }
            const configFile = path.join(this.configPath, 'config.json');
            fs.writeFileSync(configFile, JSON.stringify(this.config, null, 2));
            this.logger.info('Configuration saved successfully');
        }
        catch (error) {
            this.logger.error('Failed to save configuration', error);
            throw error;
        }
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map