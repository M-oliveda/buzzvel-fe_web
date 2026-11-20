import winston from "winston";

import { getEnv } from "./env";

export type Logger = winston.Logger;

let root: Logger | undefined;

/**
 * Process-wide JSON logger on stdout (MASTERPLAN §11.5), created on first use so the environment
 * is validated first. Route handlers only; never log message bodies, emails or credentials.
 */
export function getLogger(): Logger {
    if (!root) {
        const { APP_ENV, LOG_LEVEL } = getEnv();
        root = winston.createLogger({
            level: LOG_LEVEL,
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            defaultMeta: { service: "buzzvel-fe", env: APP_ENV },
            transports: [new winston.transports.Console()],
        });
    }
    return root;
}

/** Child logger that stamps every line with the request's correlation id. */
export function getRequestLogger(correlationId: string): Logger {
    return getLogger().child({ correlationId });
}
