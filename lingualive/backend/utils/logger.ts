/**
 * Structured logging utility for LinguaLive backend
 * Provides consistent log formatting with levels, timestamps, and context
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

/**
 * Formats a log entry as JSON string for structured logging
 * @param entry - The log entry to format
 * @returns Formatted JSON string
 */
function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Checks if a log level should be output based on current configuration
 * @param level - The level to check
 * @returns True if the level should be logged
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * Creates a log entry and outputs it if the level is enabled
 * @param level - Log level
 * @param message - Log message
 * @param context - Optional context object with additional data
 */
function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && { context }),
  };

  const output = formatLog(entry);

  switch (level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

/**
 * Logger instance with methods for each log level
 */
export const logger = {
  /**
   * Debug level logging - for development details
   * @param message - Log message
   * @param context - Optional context
   */
  debug: (message: string, context?: LogContext) => log('debug', message, context),

  /**
   * Info level logging - for general operational messages
   * @param message - Log message
   * @param context - Optional context
   */
  info: (message: string, context?: LogContext) => log('info', message, context),

  /**
   * Warn level logging - for potential issues
   * @param message - Log message
   * @param context - Optional context
   */
  warn: (message: string, context?: LogContext) => log('warn', message, context),

  /**
   * Error level logging - for errors and exceptions
   * @param message - Log message
   * @param context - Optional context
   */
  error: (message: string, context?: LogContext) => log('error', message, context),

  /**
   * Creates a child logger with preset context
   * @param baseContext - Context to include in all logs from this child
   * @returns Logger with preset context
   */
  child: (baseContext: LogContext) => ({
    debug: (message: string, context?: LogContext) =>
      log('debug', message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log('info', message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      log('warn', message, { ...baseContext, ...context }),
    error: (message: string, context?: LogContext) =>
      log('error', message, { ...baseContext, ...context }),
  }),
};

export default logger;
