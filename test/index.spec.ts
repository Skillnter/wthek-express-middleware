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
            json: jest.fn(),
            headersSent: false,
        } as unknown as Response;
        next = jest.fn();
    });

    it("should handle KitHttpError instance without formatted error", () => {
        const error = new KitHttpError(BAD_REQUEST, "Bad Request");
        const middleware = KitExpressMiddleware();
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

describe("KitExpressMiddleware - getInputs edge cases", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
            headersSent: false,
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
                return undefined as any;
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

describe("KitExpressMiddleware - headersSent guard", () => {
    let req: Request;
    let res: Response;
    let next: jest.Mock;

    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
            headersSent: false,
        } as unknown as Response;
        next = jest.fn();
    });

    it("should delegate to next when headers have already been sent", () => {
        (res as any).headersSent = true;
        const error = new KitHttpError(BAD_REQUEST, "Bad Request");
        const middleware = KitExpressMiddleware();
        middleware(error, req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.send).not.toHaveBeenCalled();
    });

    it("should delegate to next for non-Kit errors when headers have already been sent", () => {
        (res as any).headersSent = true;
        const error = new Error("Unknown Error");
        const middleware = KitExpressMiddleware();
        middleware(error, req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe("KitExpressMiddleware - logging option", () => {
    let req: Request;
    let res: Response;
    let next: jest.Mock;

    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
            headersSent: false,
        } as unknown as Response;
        next = jest.fn();
    });

    it("should log errors via console.error when log is true", () => {
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        const error = new KitHttpError(BAD_REQUEST, "Bad Request");
        const middleware = KitExpressMiddleware({ log: true });
        middleware(error, req, res, next);
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(error);
        expect(res.status).toHaveBeenCalledWith(BAD_REQUEST);
        consoleSpy.mockRestore();
    });

    it("should log errors via custom logger function", () => {
        const customLogger = jest.fn();
        const error = new KitHttpError(BAD_REQUEST, "Bad Request");
        const middleware = KitExpressMiddleware({ log: customLogger });
        middleware(error, req, res, next);
        expect(customLogger).toHaveBeenCalledTimes(1);
        expect(customLogger).toHaveBeenCalledWith(error, req);
        expect(res.status).toHaveBeenCalledWith(BAD_REQUEST);
    });

    it("should not log errors when log is false (default)", () => {
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        const error = new KitHttpError(BAD_REQUEST, "Bad Request");
        const middleware = KitExpressMiddleware();
        middleware(error, req, res, next);
        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});

describe("KitExpressMiddleware - handleUnknownErrors option", () => {
    let req: Request;
    let res: Response;
    let next: jest.Mock;

    beforeEach(() => {
        req = {} as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
            headersSent: false,
        } as unknown as Response;
        next = jest.fn();
    });

    it("should return structured 500 response for non-Kit errors when handleUnknownErrors is true", () => {
        const error = new Error("Something broke");
        const middleware = KitExpressMiddleware({
            handleUnknownErrors: true,
        });
        middleware(error, req, res, next);
        expect(res.status).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({
            statusCode: INTERNAL_SERVER_ERROR,
            message: "Internal Server Error",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should still pass to next when handleUnknownErrors is false (default)", () => {
        const error = new Error("Something broke");
        const middleware = KitExpressMiddleware();
        middleware(error, req, res, next);
        expect(next).toHaveBeenCalledWith(error);
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should still handle KitHttpError normally when handleUnknownErrors is true", () => {
        const error = new KitHttpError(BAD_REQUEST, "Bad Request");
        const middleware = KitExpressMiddleware({
            handleUnknownErrors: true,
        });
        middleware(error, req, res, next);
        expect(res.status).toHaveBeenCalledWith(BAD_REQUEST);
        expect(res.send).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });
});
