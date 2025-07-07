import type { Colorette } from 'colorette';
import pino from 'pino';

import { type LoggerLevel, type LoggerPort } from '../ports/logger.js';

export class PinoLoggerAdapter implements LoggerPort {
    private logger: pino.Logger;

    constructor(
        private readonly config: {
            destination?: pino.DestinationStream;
            level: LoggerLevel;
            prettyPrint: boolean;
        },
    ) {
        const transport = this.config.prettyPrint
            ? {
                  options: {
                      colorize: true,
                      customPrettifiers: {
                          human: (
                              human: unknown,
                              _key: string,
                              _log: Record<string, unknown>,
                              { colors }: { colors: Colorette },
                          ): string => {
                              return colors.blue(String(human));
                          },
                          level: (
                              _logLevel: unknown,
                              _key: string,
                              _log: Record<string, unknown>,
                              { label, labelColorized }: { label: string; labelColorized: string },
                          ): string => {
                              const paddedLabel = label.padEnd(5);
                              return labelColorized.replace(label, paddedLabel);
                          },
                      },
                      ignore: 'pid,hostname',
                      levelFirst: true,
                      translateTime: 'HH:MM:ss',
                  },
                  target: 'pino-pretty',
              }
            : undefined;

        this.logger = pino(
            {
                formatters: {
                    level: (label) => ({ level: label }),
                },
                level: this.config.level,
                transport,
            },
            this.config.destination,
        );
    }

    child(bindings: Record<string, unknown>): LoggerPort {
        const childLogger = new PinoLoggerAdapter(this.config);
        childLogger.logger = this.logger.child(bindings);
        return childLogger;
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        this.logger.debug(this.formatMeta(meta), message);
    }

    error(message: string, meta?: Record<string, unknown>): void {
        this.logger.error(this.formatMeta(meta), message);
    }

    info(message: string, meta?: Record<string, unknown>): void {
        this.logger.info(this.formatMeta(meta), message);
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        this.logger.warn(this.formatMeta(meta), message);
    }

    private formatMeta(meta?: Record<string, unknown>): Record<string, unknown> {
        if (!meta) return {};

        const pretty = this.config.prettyPrint;

        // Error handling remains the same but placement differs based on pretty mode
        if (meta.error instanceof Error) {
            const { error, ...metaRest } = meta;

            if (pretty) {
                // In pretty mode, spread the rest of meta at the root
                return {
                    ...metaRest,
                    error: {
                        ...error,
                        message: error.message,
                        stack: error.stack,
                    },
                };
            }

            // Structured mode (non-pretty): keep meta nested
            return {
                error: {
                    ...error,
                    message: error.message,
                    stack: error.stack,
                },
                meta: metaRest,
            };
        }

        // No error field present
        if (pretty) {
            return meta;
        }

        return { meta };
    }
}
