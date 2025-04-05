# Package Logger

A TypeScript-based logging utility designed with clean architecture principles, providing flexible and extensible logging capabilities for Node.js applications.

## Features

- 📝 Type-safe logging interface
- 🔌 Pluggable logging adapters
- 💪 100% TypeScript

## Installation

```bash
npm install @jterrazz/logger
```

## Usage

```typescript
import { Logger } from '@jterrazz/logger';

// Initialize the logger with your preferred adapter
const logger = new Logger({
  // Configuration options
});

// Log messages
logger.info('Application started');
logger.error('An error occurred', { error: new Error('Something went wrong') });
```

## Architecture

This package follows the hexagonal (ports and adapters) architecture:

- `src/ports/`: Contains the core interfaces and types
- `src/adapters/`: Implements various logging adapters (console, file, etc.)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

- Jean-Baptiste Terrazzoni ([@jterrazz](https://github.com/jterrazz))
- Email: contact@jterrazz.com
