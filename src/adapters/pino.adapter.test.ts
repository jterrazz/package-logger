import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PinoLoggerAdapter } from './pino.adapter.js';

describe('PinoLoggerAdapter', () => {
    let logger: PinoLoggerAdapter;
    let output: string[];
    let originalStdoutWrite: typeof process.stdout.write;

    beforeEach(() => {
        output = [];
        originalStdoutWrite = process.stdout.write;
        process.stdout.write = vi.fn((chunk: string | Uint8Array) => {
            output.push(chunk.toString());
            return true;
        });
    });

    afterEach(() => {
        process.stdout.write = originalStdoutWrite;
        vi.useRealTimers();
    });

    describe('when initialized with pretty print disabled', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            logger = new PinoLoggerAdapter({
                level: 'debug',
                prettyPrint: false,
            });
        });

        const waitForLogs = async () => {
            vi.advanceTimersByTime(100);
            await Promise.resolve(); // Let any pending promises resolve
        };

        test('should format debug logs correctly', async () => {
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

        test('should format info logs correctly', async () => {
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

        test('should format warn logs correctly', async () => {
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

        test('should format error logs correctly', async () => {
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

        test('should include parent bindings in child logger output', async () => {
            // Given — child logger with service binding
            const childLogger = logger.child({ service: 'auth' });
            const message = 'Child logger message';
            const meta = { userId: 789 };

            // When
            childLogger.info(message, meta);
            await waitForLogs();

            // Then — output includes parent bindings
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

        test('should log without metadata', async () => {
            // Given — message with no meta
            const message = 'No metadata';

            // When
            logger.info(message);
            await waitForLogs();

            // Then — output has no meta key
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as Record<string, unknown>;
            expect(logOutput.msg).toBe(message);
            expect(logOutput.meta).toBeUndefined();
        });

        test('should log with empty metadata', async () => {
            // Given — message with empty meta object
            const message = 'Empty metadata';

            // When
            logger.info(message, {});
            await waitForLogs();

            // Then — output has empty meta
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as Record<string, unknown>;
            expect(logOutput.msg).toBe(message);
            expect(logOutput.meta).toEqual({});
        });

        test('should chain multiple child loggers', async () => {
            // Given — nested child loggers
            const child1 = logger.child({ service: 'api' });
            const child2 = child1.child({ requestId: 'abc-123' });

            // When
            child2.info('Nested child');
            await waitForLogs();

            // Then — output includes all parent bindings
            expect(output.length).toBeGreaterThan(0);
            const logOutput = JSON.parse(output[0]) as Record<string, unknown>;
            expect(logOutput.service).toBe('api');
            expect(logOutput.requestId).toBe('abc-123');
        });
    });
});
