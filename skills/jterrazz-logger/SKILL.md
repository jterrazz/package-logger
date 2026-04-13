---
name: jterrazz-logger
description: Use when adding or configuring logging. Covers structured JSON logging with pino, child loggers, log levels, and custom adapters via @jterrazz/logger.
---

# @jterrazz/logger

Part of the @jterrazz ecosystem. Defines how all projects log.

## Port interface

```typescript
import type { LoggerPort, LoggerLevel } from '@jterrazz/logger';

// LoggerLevel: "debug" | "info" | "warn" | "error" | "silent"

interface LoggerPort {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
    child(bindings: Record<string, unknown>): LoggerPort;
}
```

## Adapters

### PinoLoggerAdapter — production logging

```typescript
import { PinoLoggerAdapter } from '@jterrazz/logger';

const logger = new PinoLoggerAdapter({
    level: 'info',
    prettyPrint: true, // Human-readable for development
    destination: stream, // Optional custom destination
});

logger.info('Server started', { port: 3000 });
logger.error('Request failed', { error: new Error('timeout'), requestId: 'abc' });
```

### NoopLoggerAdapter — zero-overhead no-op

```typescript
import { NoopLoggerAdapter } from '@jterrazz/logger';

const logger = new NoopLoggerAdapter();
// All methods are no-ops, child() returns the same instance
```

## Child loggers

Create scoped loggers with persistent context:

```typescript
const requestLogger = logger.child({ requestId: 'abc-123' });
requestLogger.info('Processing'); // Includes requestId in every log

const dbLogger = requestLogger.child({ component: 'database' });
dbLogger.info('Query executed'); // Includes requestId + component
```

## Metadata behavior

| Mode                 | Meta placement          | Use case                          |
| -------------------- | ----------------------- | --------------------------------- |
| `prettyPrint: true`  | Spread at root level    | Development — readable            |
| `prettyPrint: false` | Nested under `meta` key | Production — structured ingestion |

Errors in `meta.error` are auto-serialized with `message` and `stack`.

## Dependency injection

Use `LoggerPort` as the interface in your application code:

```typescript
class UserService {
    constructor(private readonly logger: LoggerPort) {}

    createUser(name: string) {
        this.logger.info('Creating user', { name });
    }
}
```

## Validation

```typescript
import { LoggerLevelSchema } from '@jterrazz/logger';

const level = LoggerLevelSchema.parse(process.env.LOG_LEVEL); // Validates at runtime
```
