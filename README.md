*Hey there – I’m Jean-Baptiste, just another developer doing weird things with code. All my projects live on [jterrazz.com](https://jterrazz.com) – complete with backstories and lessons learned. Feel free to poke around – you might just find something useful!*

# @jterrazz/logger

Structured, type-safe logging for Node.js with pluggable adapters.

## Installation

```bash
npm install @jterrazz/logger
```

## Usage

```typescript
import { PinoLoggerAdapter } from '@jterrazz/logger';

const logger = new PinoLoggerAdapter({
    level: 'debug',
    prettyPrint: true,
});

logger.info('Server started', { port: 3000 });
logger.error('Request failed', { error: new Error('Connection timeout') });
```

### Child Loggers

Create scoped loggers with persistent context:

```typescript
const requestLogger = logger.child({ requestId: 'abc-123' });
requestLogger.info('Processing request'); // Includes requestId in every log
```

## Adapters

### PinoLoggerAdapter

Production-ready logging powered by [Pino](https://github.com/pinojs/pino).

```typescript
import { PinoLoggerAdapter } from '@jterrazz/logger';

const logger = new PinoLoggerAdapter({
    level: 'info',        // 'debug' | 'info' | 'warn' | 'error' | 'silent'
    prettyPrint: true,    // Human-readable output for development
    destination: stream,  // Optional custom destination stream
});
```

### NoopLoggerAdapter

Zero-overhead adapter for environments where logging should be disabled.

```typescript
import { NoopLoggerAdapter } from '@jterrazz/logger';

const logger = new NoopLoggerAdapter();
```

## Metadata Behavior

The optional `meta` object provides contextual information:

| Mode | Output |
|------|--------|
| `prettyPrint: true` | Keys spread at root level for readability |
| `prettyPrint: false` | Nested under `meta` key for structured ingestion |

```typescript
logger.info('User login', { userId: 42 });

// prettyPrint: true  → { level: 'info', msg: 'User login', userId: 42 }
// prettyPrint: false → { level: 'info', msg: 'User login', meta: { userId: 42 } }
```

Errors in `meta.error` are automatically serialized with `message` and `stack` properties.

## Port Interface

Use `LoggerPort` for dependency injection:

```typescript
import type { LoggerPort } from '@jterrazz/logger';

class UserService {
    constructor(private readonly logger: LoggerPort) {}

    createUser(name: string) {
        this.logger.info('Creating user', { name });
    }
}
```

## License

MIT
