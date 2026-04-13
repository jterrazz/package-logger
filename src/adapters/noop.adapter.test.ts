import { describe, expect, test } from 'vitest';

import { NoopLoggerAdapter } from './noop.adapter.js';

describe('NoopLoggerAdapter', () => {
    test('does not throw on debug', () => {
        // Given — noop logger
        const logger = new NoopLoggerAdapter();

        // Then — no error thrown
        expect(() => logger.debug('test')).not.toThrow();
    });

    test('does not throw on info', () => {
        // Given — noop logger
        const logger = new NoopLoggerAdapter();

        // Then — no error thrown
        expect(() => logger.info('test')).not.toThrow();
    });

    test('does not throw on warn', () => {
        // Given — noop logger
        const logger = new NoopLoggerAdapter();

        // Then — no error thrown
        expect(() => logger.warn('test')).not.toThrow();
    });

    test('does not throw on error', () => {
        // Given — noop logger
        const logger = new NoopLoggerAdapter();

        // Then — no error thrown
        expect(() => logger.error('test')).not.toThrow();
    });

    test('does not throw with metadata', () => {
        // Given — noop logger with metadata
        const logger = new NoopLoggerAdapter();

        // Then — no error thrown with metadata
        expect(() => logger.info('test', { key: 'value' })).not.toThrow();
    });

    test('child returns a logger', () => {
        // Given — noop logger
        const logger = new NoopLoggerAdapter();

        // Then — child returns a working logger
        const child = logger.child({ service: 'test' });
        expect(() => child.info('test')).not.toThrow();
    });

    test('child returns the same instance', () => {
        // Given — noop logger
        const logger = new NoopLoggerAdapter();

        // Then — child is the same instance (optimization)
        const child = logger.child({ service: 'test' });
        expect(child).toBe(logger);
    });
});
