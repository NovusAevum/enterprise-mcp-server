/**
 * Configuration Manager
 *
 * Centralized configuration management with environment-specific settings,
 * validation, and secure credential handling.
 *
 * @author Wan Mohamad Hanis bin Wan Hassan
 * @version 1.0.0
 */
interface ConfigData {
    [key: string]: any;
}
export declare class ConfigManager {
    private logger;
    private config;
    private configPath;
    constructor();
    initialize(): Promise<void>;
    private loadEnvironmentVariables;
    private loadConfigurationFiles;
    private validateConfiguration;
    get(key: string): any;
    set(key: string, value: any): void;
    getAll(): ConfigData;
    save(): Promise<void>;
}
export {};
//# sourceMappingURL=config.d.ts.map