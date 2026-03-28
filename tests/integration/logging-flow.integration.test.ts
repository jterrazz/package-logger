import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerLevelSchema, NoopLoggerAdapter, PinoLoggerAdapter } from "../../src/index.js";

describe("logging flow integration", () => {
  let stdoutWrite: ReturnType<typeof vi.fn>;
  let originalWrite: typeof process.stdout.write;
  let capturedOutput: string[];

  beforeEach(() => {
    vi.useFakeTimers();
    capturedOutput = [];
    originalWrite = process.stdout.write;
    stdoutWrite = vi.fn((chunk: unknown) => {
      capturedOutput.push(String(chunk));
      return true;
    });
    process.stdout.write = stdoutWrite as unknown as typeof process.stdout.write;
  });

  afterEach(() => {
    process.stdout.write = originalWrite;
    vi.useRealTimers();
  });

  const flushPino = async () => {
    vi.advanceTimersByTime(100);
    await Promise.resolve();
  };

  it("logs at all levels with correct format", async () => {
    // Given — a PinoLoggerAdapter with JSON output at debug level
    const logger = new PinoLoggerAdapter({ level: "debug", prettyPrint: false });

    // When — logging at all four levels
    logger.debug("debug message");
    logger.info("info message");
    logger.warn("warn message");
    logger.error("error message");
    await flushPino();

    // Then — each log line is valid JSON with correct level and message
    const lines = capturedOutput.map((line) => JSON.parse(line.trim()));
    expect(lines).toHaveLength(4);

    expect(lines[0]).toMatchObject({ level: "debug", msg: "debug message" });
    expect(lines[1]).toMatchObject({ level: "info", msg: "info message" });
    expect(lines[2]).toMatchObject({ level: "warn", msg: "warn message" });
    expect(lines[3]).toMatchObject({ level: "error", msg: "error message" });
  });

  it("propagates child logger bindings through chain", async () => {
    // Given — a logger with a child and grandchild carrying distinct bindings
    const logger = new PinoLoggerAdapter({ level: "debug", prettyPrint: false });
    const childLogger = logger.child({ service: "api" });
    const grandchildLogger = childLogger.child({ requestId: "abc" });

    // When — logging from the grandchild
    grandchildLogger.info("request handled");
    await flushPino();

    // Then — the output contains both parent and grandparent bindings
    const parsed = JSON.parse(capturedOutput[0].trim());
    expect(parsed).toMatchObject({
      level: "info",
      msg: "request handled",
      requestId: "abc",
      service: "api",
    });
  });

  it("serializes error objects with message and stack", async () => {
    // Given — a logger in structured JSON mode
    const logger = new PinoLoggerAdapter({ level: "debug", prettyPrint: false });
    const testError = new Error("test");

    // When — logging with an error in meta
    logger.error("something failed", { error: testError });
    await flushPino();

    // Then — the output contains error.message and error.stack
    const parsed = JSON.parse(capturedOutput[0].trim());
    expect(parsed.error).toBeDefined();
    expect(parsed.error.message).toBe("test");
    expect(parsed.error.stack).toContain("Error: test");
  });

  it("noop adapter produces no output", async () => {
    // Given — a NoopLoggerAdapter
    const logger = new NoopLoggerAdapter();

    // When — logging at all levels
    logger.debug("debug message");
    logger.info("info message");
    logger.warn("warn message");
    logger.error("error message");
    await flushPino();

    // Then — no output was written to stdout
    expect(stdoutWrite).not.toHaveBeenCalled();
  });

  it("validates logger level with schema", () => {
    // Given — the LoggerLevelSchema from the public API
    const validLevels = ["debug", "info", "warn", "error", "silent"];
    const invalidLevels = ["trace", "verbose", "critical", ""];

    // Then — valid levels parse successfully
    for (const level of validLevels) {
      expect(LoggerLevelSchema.parse(level)).toBe(level);
    }

    // Then — invalid levels throw validation errors
    for (const level of invalidLevels) {
      expect(() => LoggerLevelSchema.parse(level)).toThrow();
    }
  });
});
