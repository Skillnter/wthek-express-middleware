import { KitHttpError, KitGeneralError } from "http-error-kit";
import { Request, Response, NextFunction } from "express";
import { INTERNAL_SERVER_ERROR } from "http-response-status-code";

/**
 * KitExpressMiddleware is a middleware for Express.js to handle errors in a standard
 * and customizable way. The middleware will inspect the error and if it is an instance
 * of KitHttpError or KitGeneralError, it will use the error's details to construct a
 * response with the appropriate status code. If the error is not an instance of KitHttpError
 * or KitGeneralError, the middleware will call the next function to propagate the error.
 *
 * @param {KitHttpError | KitGeneralError | any} error The error to be handled.
 * @param {Request} req The Express.js request object.
 * @param {Response} res The Express.js response object.
 * @param {NextFunction} next The Express.js next function.
 */
export function KitExpressMiddleware() {
    return (
        error: KitHttpError | KitGeneralError | any,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (
                error instanceof KitHttpError ||
                error instanceof KitGeneralError
            ) {
                const statusCode =
                    error.getInputs()?.statusCode || INTERNAL_SERVER_ERROR;
                res.status(statusCode).send(error);
            } else {
                next(error);
            }
        } catch (err) {
            next(err);
        }
    };
}
