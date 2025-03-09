import { KitExpressMiddleware } from "../src"; // Adjust path as needed
import { KitHttpError, KitHttpErrorConfig } from "http-error-kit";
import { KitGeneralError } from "http-error-kit/generic";
import { Request, Response, NextFunction } from "express";
import { INTERNAL_SERVER_ERROR, BAD_REQUEST } from "http-response-status-code";

describe("KitExpressMiddleware", () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as unknown as Response;
        next = jest.fn();
    });

    it("should handle KitHttpError instance without formatted error", () => {
        const error = new KitHttpError(BAD_REQUEST, "Bad Request");
        const middleware = KitExpressMiddleware();
        console.log(error);
        middleware(error, req, res, next);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(BAD_REQUEST);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(error);
    });

    it("should handle KitGeneralError instance without formatted error", () => {
        const error = new KitGeneralError(BAD_REQUEST, "Internal Server Error");
        const middleware = KitExpressMiddleware();
        middleware(error, req, res, next);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(BAD_REQUEST);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(error);
    });

    it("should handle KitHttpError instance with formatted error", () => {
        const error = new KitHttpError(BAD_REQUEST, "Bad Request");
        KitHttpErrorConfig.configureFormatter(() => ({
            statusCode: BAD_REQUEST,
        }));
        const middleware = KitExpressMiddleware();
        middleware(error, req, res, next);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(BAD_REQUEST);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(error);
    });

    it("should handle non-KitHttpError/KitGeneralError instance", () => {
        const error = new Error("Unknown Error");
        const middleware = KitExpressMiddleware();
        middleware(error, req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(error);
    });

    it("should handle error with next function", () => {
        const error = new Error("Unknown Error");
        const middleware = KitExpressMiddleware();
        middleware(error, req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(error);
    });

    it("should handle error with catch block", () => {
        const error = new Error("Unknown Error");
        const middleware = KitExpressMiddleware();
        middleware(error, req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(error);
    });

    it("should handle KitGeneralError instance with formatted error", () => {
        KitHttpErrorConfig.configureFormatter(() => ({
            statusCode: INTERNAL_SERVER_ERROR,
        }));
        const error = new KitGeneralError(
            INTERNAL_SERVER_ERROR,
            "Internal Server Error"
        );
        const middleware = KitExpressMiddleware();
        middleware(error, req, res, next);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith(error);
    });
});

describe("KitExpressMiddleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        } as unknown as Response;
        next = jest.fn();
    });

    it("should handle KitHttpError instance with formatted error", () => {
        KitHttpErrorConfig.configureFormatter(() => ({
            statusCode: INTERNAL_SERVER_ERROR,
        }));
        const error = new KitHttpError(BAD_REQUEST, "Bad Request");
        const mockConfig = jest
            .spyOn(error, "getInputs")
            .mockImplementation(() => {
                return undefined;
            });
        const middleware = KitExpressMiddleware();

        middleware(
            error,
            req as Request,
            res as Response,
            next as NextFunction
        );

        expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
    });

    it("should handle KitHttpError instance with formatted error", () => {
        const demoError = new Error("Mocked Error");

        const error = new KitHttpError(BAD_REQUEST, "Bad Request");
        const mockConfig = jest
            .spyOn(error, "getInputs")
            .mockImplementation(() => {
                throw demoError;
            });
        const middleware = KitExpressMiddleware();

        middleware(
            error,
            req as Request,
            res as Response,
            next as NextFunction
        );

        expect(res.status).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(demoError);
    });
});
