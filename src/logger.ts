import * as winston from "winston";

const logger = winston.createLogger({ exitOnError: true });

function setupLoggers() {
  logger.add(
    new winston.transports.Console({
      level: "info",
      format: winston.format.printf((info) => info.message),
    })
  );
}

export { logger, setupLoggers };
