import { LoggerPort } from '../ports/logger.js';

/**
 * No-op logger adapter that implements LoggerPort but performs no operations.
 * This is useful for production environments where logging should be disabled
 * to minimize overhead.
 */
export class NoopLoggerAdapter implements LoggerPort {
    info(_message: string, _context?: Record<string, unknown>): void {
        // No operation
    }

    error(_message: string, _context?: Record<string, unknown>): void {
        // No operation
    }

    warn(_message: string, _context?: Record<string, unknown>): void {
        // No operation
    }

    debug(_message: string, _context?: Record<string, unknown>): void {
        // No operation
    }

    child(_bindings: Record<string, unknown>): LoggerPort {
        return this;
    }
}
