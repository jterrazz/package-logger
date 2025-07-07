import { afterEach, beforeEach, describe, expect, it } from '@jterrazz/test';
import { vi } from 'vitest';

// Create spies that we can inspect after adapter calls
const loggerSpies = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
};

// Mock the `pino` module so we can capture the structured log object the adapter sends to it
vi.mock('pino', () => {
    return {
        default: vi.fn(() => ({
            ...loggerSpies,
            child: () => ({ ...loggerSpies }),
        })),
    };
});

import { PinoLoggerAdapter } from '../pino.adapter.js';

/**
 * Tests specifically for pretty-print mode.
 * We verify that metadata is SPREAD at the root level (no `meta` key).
 */
describe('PinoLoggerAdapter (prettyPrint enabled)', () => {
    beforeEach(() => {
        // Reset call history between tests
        Object.values(loggerSpies).forEach((spy) => spy.mockReset());
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const createAdapter = () =>
        new PinoLoggerAdapter({
            level: 'debug',
            prettyPrint: true,
        });

    it('should spread simple metadata at the root level', () => {
        // Given
        const adapter = createAdapter();
        const meta = { feature: 'test', userId: 123 };
        const message = 'Pretty info';

        // When
        adapter.info(message, meta);

        // Then
        expect(loggerSpies.info).toHaveBeenCalledTimes(1);
        const [payload, msg] = loggerSpies.info.mock.calls[0] as [Record<string, unknown>, string];
        expect(msg).toBe(message);
        expect(payload).toMatchObject(meta);
        // No nested `meta` key
        expect(payload.meta).toBeUndefined();
    });

    it('should spread metadata and still format error objects', () => {
        // Given
        const adapter = createAdapter();
        const error = new Error('Pretty error');
        const meta = { error, userId: 456 };
        const message = 'Pretty error info';

        // When
        adapter.error(message, meta);

        // Then
        expect(loggerSpies.error).toHaveBeenCalledTimes(1);
        const [payload, msg] = loggerSpies.error.mock.calls[0] as [Record<string, unknown>, string];
        expect(msg).toBe(message);

        // Error should be formatted at root level
        expect(payload.error).toHaveProperty('message', 'Pretty error');
        expect(payload.error).toHaveProperty('stack');

        // Additional meta should also be at root level
        expect(payload.userId).toBe(456);
        expect(payload.meta).toBeUndefined();
    });
});
