*Hey there – I’m Jean-Baptiste, just another developer doing weird things with code. All my projects live on [jterrazz.com](https://jterrazz.com) – complete with backstories and lessons learned. Feel free to poke around – you might just find something useful!*

# Package Logger

A TypeScript-based logging utility designed with clean architecture principles, providing flexible and extensible logging capabilities for Node.js and React Native applications.

## Features

- 📝 Type-safe logging interface
- 🔌 Pluggable logging adapters
- 💪 100% TypeScript
- 🚀 Production-ready with no-op adapter

## Installation

```bash
npm install @jterrazz/logger
```

## Usage

### Basic Usage

```typescript
import { Logger, PinoLoggerAdapter, NoopLoggerAdapter } from '@jterrazz/logger';

// Development environment with Pino
const logger = new Logger({
  adapter: new PinoLoggerAdapter({
    prettyPrint: true,
    level: 'debug',
  }),
});

// Production environment with No-op
const logger = new Logger({
  adapter: new NoopLoggerAdapter(),
});

// Log messages
logger.info('Application started');
logger.error('An error occurred', { error: new Error('Something went wrong') });
```

### Available Adapters

- **PinoLoggerAdapter**: Full-featured logging with Pino (recommended for development)

  ```typescript
  new PinoLoggerAdapter({
    prettyPrint: true, // Enable pretty printing
    level: 'debug', // Set minimum log level
  });
  ```

- **NoopLoggerAdapter**: Zero-overhead logging (recommended for client side production)
  ```typescript
  new NoopLoggerAdapter();
  ```

## Architecture

This package follows the hexagonal (ports and adapters) architecture:

- `src/ports/`: Contains the core interfaces and types
- `src/adapters/`: Implements various logging adapters
  - `pino.adapter.ts`: Pino-based logging
  - `noop.adapter.ts`: No-operation logging

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

- Jean-Baptiste Terrazzoni ([@jterrazz](https://github.com/jterrazz))
- Email: contact@jterrazz.com

### Metadata (`meta`) behaviour

The second argument to every logging method is a `meta` object containing contextual information (e.g. `userId`, `requestId`, etc.).

| Mode                                   | Shape in log output                                                                                                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pretty Print (`prettyPrint: true`)** | Keys of `meta` are **spread at the root level** of the log object for maximum readability.<br/>`logger.info('msg', { userId: 42 })` → `{ level: 'info', msg: 'msg', userId: 42 }`                    |
| **Structured (default)**               | `meta` is kept under its own key so downstream tools (e.g. Logstash, Datadog) can ingest it easily.<br/>`logger.info('msg', { userId: 42 })` → `{ level: 'info', msg: 'msg', meta: { userId: 42 } }` |

Error instances placed in `meta.error` are always formatted with `message` and `stack` properties for consistency.
