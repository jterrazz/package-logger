import pino from 'pino';

import { LoggerPort } from '../ports/logger.js';

export class PinoLoggerAdapter implements LoggerPort {
    private logger: pino.Logger;

    constructor(
        private readonly config: {
            level: string;
            prettyPrint: boolean;
        },
    ) {
        const transport = this.config.prettyPrint
            ? {
                  options: {
                      colorize: true,
                      colorizeObjects: false,
                      ignore: 'pid,hostname',
                      levelFirst: true,
                      messageFormat: false,
                      singleLine: true,
                      translateTime: 'HH:MM:ss',
                  },
                  target: 'pino-pretty',
              }
            : undefined;

        this.logger = pino({
            formatters: {
                level: (label) => ({ level: label }),
            },
            level: this.config.level,
            transport,
        });
    }

    child(bindings: Record<string, unknown>): LoggerPort {
        const childLogger = new PinoLoggerAdapter(this.config);
        childLogger.logger = this.logger.child(bindings);
        return childLogger;
    }

    debug(message: string, context?: Record<string, unknown>): void {
        this.logger.debug(this.formatContext(context), message);
    }

    error(message: string, context?: Record<string, unknown>): void {
        this.logger.error(this.formatContext(context), message);
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.logger.info(this.formatContext(context), message);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.logger.warn(this.formatContext(context), message);
    }

    private formatContext(context?: Record<string, unknown>): Record<string, unknown> {
        if (!context) return {};

        // Format error objects specially
        if (context.error instanceof Error) {
            const { error, ...contextRest } = context;
            return {
                context: contextRest,
                error: {
                    ...error,
                    message: error.message,
                    stack: error.stack,
                },
            };
        }

        return {
            context,
        };
    }
}
