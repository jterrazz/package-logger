import { describe, expect, test } from "vitest";

import { LoggerLevelSchema } from "../logger.js";

describe("LoggerLevelSchema", () => {
  test("accepts debug level", () => {
    // Given — debug level string
    const result = LoggerLevelSchema.safeParse("debug");

    // Then — valid
    expect(result.success).toBe(true);
  });

  test("accepts info level", () => {
    // Given — info level string
    const result = LoggerLevelSchema.safeParse("info");

    // Then — valid
    expect(result.success).toBe(true);
  });

  test("accepts warn level", () => {
    // Given — warn level string
    const result = LoggerLevelSchema.safeParse("warn");

    // Then — valid
    expect(result.success).toBe(true);
  });

  test("accepts error level", () => {
    // Given — error level string
    const result = LoggerLevelSchema.safeParse("error");

    // Then — valid
    expect(result.success).toBe(true);
  });

  test("accepts silent level", () => {
    // Given — silent level string
    const result = LoggerLevelSchema.safeParse("silent");

    // Then — valid
    expect(result.success).toBe(true);
  });

  test("rejects invalid level", () => {
    // Given — invalid level string
    const result = LoggerLevelSchema.safeParse("verbose");

    // Then — invalid
    expect(result.success).toBe(false);
  });

  test("rejects non-string input", () => {
    // Given — number input
    const result = LoggerLevelSchema.safeParse(42);

    // Then — invalid
    expect(result.success).toBe(false);
  });
});
