import { KitHttpError, KitGeneralError } from "http-error-kit";
import { Request, Response, NextFunction } from "express";
import { INTERNAL_SERVER_ERROR } from "http-response-status-code";

/**
 * Configuration options for KitExpressMiddleware.
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
 * KitExpressMiddleware is a middleware for Express.js to handle errors in a standard
 * and customizable way. The middleware will inspect the error and if it is an instance
 * of KitHttpError or KitGeneralError, it will use the error's details to construct a
 * response with the appropriate status code. If the error is not an instance of KitHttpError
 * or KitGeneralError, the middleware will call the next function to propagate the error
 * (or return a structured 500 when `handleUnknownErrors` is enabled).
 *
 * @param {IKitExpressMiddlewareOptions} [options] Optional configuration for the middleware.
 * @param {unknown} error The error to be handled.
 * @param {Request} req The Express.js request object.
 * @param {Response} res The Express.js response object.
 * @param {NextFunction} next The Express.js next function.
 */
export function KitExpressMiddleware(options?: IKitExpressMiddlewareOptions) {
    const { log = false, handleUnknownErrors = false } = options || {};

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
                return next(error);
            }

            if (
                error instanceof KitHttpError ||
                error instanceof KitGeneralError
            ) {
                // eslint-disable-next-line
                const statusCode = (error.getInputs()?.statusCode ||
                    INTERNAL_SERVER_ERROR) as number;
                res.status(statusCode).send(error);
            } else if (handleUnknownErrors) {
                res.status(INTERNAL_SERVER_ERROR as number).json({
                    statusCode: INTERNAL_SERVER_ERROR,
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
