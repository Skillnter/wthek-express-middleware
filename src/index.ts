import { KitHttpError, KitGeneralError } from "http-error-kit";
import { Request, Response, NextFunction } from "express";
import { INTERNAL_SERVER_ERROR } from "http-response-status-code";

/**
 * Configuration options for KitExpressMiddleware.
 *
 * @example
 * ```typescript
 * import { IKitExpressMiddlewareOptions } from "@wthek/express-middleware";
 *
 * const options: IKitExpressMiddlewareOptions = {
 *   log: true,
 *   handleUnknownErrors: true,
 * };
 * ```
 */
export interface IKitExpressMiddlewareOptions {
    /**
     * Optional logger callback or boolean flag.
     * When set to `true`, errors are logged via `console.error`.
     * When set to a function, the function receives the error and request
     * for custom logging (e.g. Winston, Pino, Bunyan).
     *
     * @default false
     */
    // eslint-disable-next-line no-unused-vars
    log?: boolean | ((error: unknown, req: Request) => void);

    /**
     * If true, catches non-Kit errors and returns a structured 500 response
     * instead of passing raw unformatted errors to the next handler.
     *
     * @default false
     */
    handleUnknownErrors?: boolean;
}

/**
 * KitExpressMiddleware is a middleware factory for Express.js to handle errors in a standard
 * and customizable way. Inspects errors and, if an instance of KitHttpError or KitGeneralError,
 * responds with structured error details and the appropriate HTTP status code.
 *
 * @param {IKitExpressMiddlewareOptions} [options] Optional configuration for the middleware.
 * @returns {Function} Express error-handling middleware function.
 *
 * @example
 * ```typescript
 * import express from "express";
 * import { KitExpressMiddleware } from "@wthek/express-middleware";
 * import { BadRequestError } from "http-error-kit";
 *
 * const app = express();
 *
 * app.get("/api/item", () => {
 *   throw new BadRequestError("Invalid item request");
 * });
 *
 * // Register as final error handler after all routes
 * app.use(KitExpressMiddleware({ log: true, handleUnknownErrors: true }));
 * ```
 */
export function KitExpressMiddleware(options?: IKitExpressMiddlewareOptions) {
    const { log = false, handleUnknownErrors = false } = options ?? {};

    return (
        error: unknown,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            // Log the error when logging is enabled
            if (log) {
                if (typeof log === "function") {
                    log(error, req);
                } else {
                    console.error(error);
                }
            }

            // Delegate to the default Express error handler when headers
            // have already been sent to the client to avoid
            // ERR_HTTP_HEADERS_SENT crashes.
            if (res.headersSent) {
                next(error);
                return;
            }

            if (
                error instanceof KitHttpError ||
                error instanceof KitGeneralError
            ) {
                // eslint-disable-next-line
                const statusCode = (error.getInputs()?.statusCode ??
                    INTERNAL_SERVER_ERROR) as number;
                res.status(statusCode).send(error);
            } else if (handleUnknownErrors) {
                res.status(INTERNAL_SERVER_ERROR as number).json({
                    statusCode: INTERNAL_SERVER_ERROR as number,
                    message: "Internal Server Error",
                });
            } else {
                next(error);
            }
        } catch (err) {
            next(err);
        }
    };
}
