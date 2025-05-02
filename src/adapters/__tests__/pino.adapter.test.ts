import { afterEach, beforeEach, describe, expect, it, vitest } from '@jterrazz/test';

import { PinoLoggerAdapter } from '../pino.adapter.js';

describe('PinoLoggerAdapter', () => {
    let logger: PinoLoggerAdapter;
    let output: string[];
    let originalStdoutWrite: typeof process.stdout.write;

    beforeEach(() => {
        output = [];
        originalStdoutWrite = process.stdout.write;
        process.stdout.write = vitest.fn((chunk: string | Uint8Array) => {
            output.push(chunk.toString());
            return true;
        });
    });

    afterEach(() => {
        process.stdout.write = originalStdoutWrite;
        vitest.useRealTimers();
    });

    describe('when initialized with pretty print disabled', () => {
        beforeEach(() => {
            vitest.useFakeTimers();
            logger = new PinoLoggerAdapter({
                level: 'debug',
                prettyPrint: false,
            });
        });

        const waitForLogs = async () => {
            vitest.advanceTimersByTime(100);
            await Promise.resolve(); // Let any pending promises resolve
        };

        it('should format debug logs correctly', async () => {
            // Given
            const message = 'Test debug message';
            const context = { userId: 123 };

            // When
            logger.debug(message, context);
            await waitForLogs();

            // Then
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as {
                context: { userId: number };
                level: string;
                msg: string;
            };
            expect(logOutput.level).toBe('debug');
            expect(logOutput.msg).toBe(message);
            expect(logOutput.context).toEqual({ userId: 123 });
        });

        it('should format info logs correctly', async () => {
            // Given
            const message = 'Test info message';
            const context = { action: 'create' };

            // When
            logger.info(message, context);
            await waitForLogs();

            // Then
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as {
                context: { action: string };
                level: string;
                msg: string;
            };
            expect(logOutput.level).toBe('info');
            expect(logOutput.msg).toBe(message);
            expect(logOutput.context).toEqual({ action: 'create' });
        });

        it('should format warn logs correctly', async () => {
            // Given
            const message = 'Test warning message';
            const context = { severity: 'high' };

            // When
            logger.warn(message, context);
            await waitForLogs();

            // Then
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as {
                context: { severity: string };
                level: string;
                msg: string;
            };
            expect(logOutput.level).toBe('warn');
            expect(logOutput.msg).toBe(message);
            expect(logOutput.context).toEqual({ severity: 'high' });
        });

        it('should format error logs correctly', async () => {
            // Given
            const message = 'Test error message';
            const error = new Error('Test error');
            const context = { error, userId: 456 };

            // When
            logger.error(message, context);
            await waitForLogs();

            // Then
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as Record<string, unknown>;
            expect(logOutput.level).toBe('error');
            expect(logOutput.msg).toBe(message);
            expect(logOutput.error).toHaveProperty('message', 'Test error');
            expect(logOutput.error).toHaveProperty('stack');
            expect(logOutput.context).toHaveProperty('userId', 456);
        });

        it('should include parent bindings in child logger output', async () => {
            // Given
            const childLogger = logger.child({ service: 'auth' });
            const message = 'Child logger message';
            const context = { userId: 789 };

            // When
            childLogger.info(message, context);
            await waitForLogs();

            // Then
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as {
                context: { userId: number };
                level: string;
                msg: string;
                service: string;
            };
            expect(logOutput.level).toBe('info');
            expect(logOutput.msg).toBe(message);
            expect(logOutput.service).toBe('auth');
            expect(logOutput.context).toEqual({ userId: 789 });
        });
    });
});
