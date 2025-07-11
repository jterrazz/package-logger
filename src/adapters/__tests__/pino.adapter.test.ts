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
            const meta = { userId: 123 };

            // When
            logger.debug(message, meta);
            await waitForLogs();

            // Then
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as {
                level: string;
                meta: { userId: number };
                msg: string;
            };
            expect(logOutput.level).toBe('debug');
            expect(logOutput.msg).toBe(message);
            expect(logOutput.meta).toEqual({ userId: 123 });
        });

        it('should format info logs correctly', async () => {
            // Given
            const message = 'Test info message';
            const meta = { action: 'create' };

            // When
            logger.info(message, meta);
            await waitForLogs();

            // Then
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as {
                level: string;
                meta: { action: string };
                msg: string;
            };
            expect(logOutput.level).toBe('info');
            expect(logOutput.msg).toBe(message);
            expect(logOutput.meta).toEqual({ action: 'create' });
        });

        it('should format warn logs correctly', async () => {
            // Given
            const message = 'Test warning message';
            const meta = { severity: 'high' };

            // When
            logger.warn(message, meta);
            await waitForLogs();

            // Then
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as {
                level: string;
                meta: { severity: string };
                msg: string;
            };
            expect(logOutput.level).toBe('warn');
            expect(logOutput.msg).toBe(message);
            expect(logOutput.meta).toEqual({ severity: 'high' });
        });

        it('should format error logs correctly', async () => {
            // Given
            const message = 'Test error message';
            const error = new Error('Test error');
            const meta = { error, userId: 456 };

            // When
            logger.error(message, meta);
            await waitForLogs();

            // Then
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as Record<string, unknown>;
            expect(logOutput.level).toBe('error');
            expect(logOutput.msg).toBe(message);
            expect(logOutput.error).toHaveProperty('message', 'Test error');
            expect(logOutput.error).toHaveProperty('stack');
            expect(logOutput.meta).toHaveProperty('userId', 456);
        });

        it('should include parent bindings in child logger output', async () => {
            // Given
            const childLogger = logger.child({ service: 'auth' });
            const message = 'Child logger message';
            const meta = { userId: 789 };

            // When
            childLogger.info(message, meta);
            await waitForLogs();

            // Then
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as {
                level: string;
                meta: { userId: number };
                msg: string;
                service: string;
            };
            expect(logOutput.level).toBe('info');
            expect(logOutput.msg).toBe(message);
            expect(logOutput.service).toBe('auth');
            expect(logOutput.meta).toEqual({ userId: 789 });
        });
    });
});
