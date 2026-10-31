# Official @wthek Extension – Express Middleware for `http-error-kit`

**Seamless Express Error Handling with @wthek**

_Built for applications powered by [http-error-kit][http-error-kit], this middleware ensures that all `http-error-kit` errors are properly formatted and returned with the correct HTTP status codes._

> 💡 What the HEK?! Need a hassle-free way to manage error responses for `http-error-kit` errors in Express? `@wthek/express-middleware` has got you covered!

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/skillnter/wthek-express-middleware/main.yml)
[![npm version](https://img.shields.io/npm/v/%40wthek%2Fexpress-middleware?color=brightgreen)](https://www.npmjs.com/package/@wthek/express-middleware)
[![GitHub license](https://img.shields.io/github/license/skillnter/wthek-express-middleware?color=brightgreen)](LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/Skillnter/wthek-express-middleware)](https://github.com/Skillnter/http-error-kit/issues)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/6a36f034f49c456dbdec8e52d7b55fdf)](https://app.codacy.com/gh/Skillnter/wthek-express-middleware/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/6a36f034f49c456dbdec8e52d7b55fdf)](https://app.codacy.com/gh/Skillnter/wthek-express-middleware/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/wthek-express-middleware)](https://bundlephobia.com/package/wthek-express-middleware)
![npms.io (final)](https://img.shields.io/npms-io/maintenance-score/%40wthek%2Fexpress-middleware?color=brightgreen)
![npm](https://img.shields.io/npm/dy/%40wthek%2Fexpress-middleware)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@wthek/express-middleware/1.0.0)](https://socket.dev/npm/package/@wthek/express-middleware/overview/1.0.0)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-121013?logo=github&logoColor=white)](https://skillnter.github.io/wthek-express-middleware/)
[![Github Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-30363D?&logo=GitHub-Sponsors&logoColor=EA4AAA)](https://github.com/sponsors/Skillnter)
[![Open Collective](https://img.shields.io/badge/Open%20Collective-3385FF?logo=open-collective&logoColor=white)](https://opencollective.com/skillnter)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/skillnter)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?logo=patreon&logoColor=white)](https://www.patreon.com/skillnter)
[![PayPal](https://img.shields.io/badge/PayPal-003087?logo=paypal&logoColor=fff)](https://www.paypal.me/skillnte)

## Features

-   **Official `http-error-kit` Extension** – The recommended middleware for Express.js apps.
-   **Auto-sets HTTP status codes** – Ensures the response status matches the error type.
-   **Production-Safe** – Guards against `ERR_HTTP_HEADERS_SENT` with built-in `headersSent` checks.
-   **Configurable Logging** – Plug in your own logger (Winston, Pino, Bunyan) or use `console.error` out of the box.
-   **Unknown Error Handling** – Optionally catch all unrecognized errors with a structured 500 JSON response.
-   **Plug-and-Play Middleware** – Just drop it before starting your server!
-   **Graceful Fallbacks** – Passes unrecognized errors to the next middleware.

## Table of Content

-   [Installation](#installation)
-   [Usage](#usage)
-   [Middleware Options](#middleware-options)
-   [How It Works](#how-it-works)
-   [Why Use @wthek/express-middleware?](#why-use-wthekexpress-middleware)
-   [Ecosystem](#ecosystem)
-   [People](#people)
-   [Donations](#donations)
-   [License](#license)

## Installation

```console
npm install @wthek/express-middleware
```

> **Peer Dependency:** This package requires `express` (v4 or v5) to be installed in your project.

## Usage

**Add Middleware Just Before Starting the Server**

To catch all errors correctly, place `KitExpressMiddleware()` after all routes but before starting your Express server.

```Javascript
import express from "express";
import { KitHttpError, BadRequestError } from "http-error-kit";
import { KitExpressMiddleware } from "@wthek/express-middleware";

const app = express();

// Routes
app.get("/", (req, res) => {
  throw new BadRequestError("Invalid request!");
});

// Error Handling Middleware (must be after routes)
app.use(KitExpressMiddleware());

// Start Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

**With Async Routes**

```Javascript
import express from "express";
import { NotFoundError } from "http-error-kit";
import { KitExpressMiddleware } from "@wthek/express-middleware";

const app = express();

app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) throw new NotFoundError("User not found");
    res.json(user);
  } catch (error) {
    next(error); // Forward to KitExpressMiddleware
  }
});

app.use(KitExpressMiddleware());
app.listen(3000);
```

## Middleware Options

`KitExpressMiddleware` accepts an optional configuration object:

```Javascript
import { KitExpressMiddleware } from "@wthek/express-middleware";

app.use(
  KitExpressMiddleware({
    // Log errors via console.error
    log: true,

    // Or use a custom logger (Winston, Pino, etc.)
    // log: (error, req) => logger.error({ err: error, url: req.url }),

    // Return structured 500 for non-Kit errors instead of passing to next()
    handleUnknownErrors: true,
  })
);
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `log` | `boolean \| (error, req) => void` | `false` | When `true`, logs errors via `console.error`. When a function, calls it with the error and request. |
| `handleUnknownErrors` | `boolean` | `false` | When `true`, returns a structured `{ statusCode: 500, message: "Internal Server Error" }` response for non-Kit errors instead of passing them to the next middleware. |

## How It Works

-   Catches errors thrown in routes and middleware
-   **Checks `res.headersSent`** – Delegates to the default Express error handler when headers have already been sent, preventing `ERR_HTTP_HEADERS_SENT` crashes
-   Checks if the error is an instance of any `http-error-kit` Errors
-   Formats the error response and sets the correct HTTP status code
-   Passes other errors to the next middleware (_so they can be handled separately_)

## Why Use `@wthek/express-middleware`?

### The Problem

Without `@wthek/express-middleware`, every route needs manual error handling:

```Javascript
// ❌ Without @wthek/express-middleware
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
        // hope every endpoint formats errors the same way...
      });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});
```

Duplicate `try/catch` in every route. Inconsistent error shapes across endpoints. No single source of truth.

### The Solution

```Javascript
// ✅ With @wthek/express-middleware
app.get("/api/users/:id", async (req, res, next) => {
  const user = await findUser(req.params.id);
  if (!user) throw new NotFoundError("User not found");
  res.json(user);
});

app.use(KitExpressMiddleware({ log: true }));
```

-   **No more manual error handling** – Status codes are automatically set from the error class.
-   **Consistent API responses** – Every error follows the same structured format, improving debugging & logging.
-   **Production-ready** – `headersSent` guard prevents response crashes mid-stream.
-   **Works perfectly with `http-error-kit`** – Fully compatible with existing `http-error-kit` error structures and custom formatters via `KitHttpErrorConfig`.
-   **Express 4 & Express 5** – Tested across both major Express versions.

## Ecosystem

`@wthek/express-middleware` is part of the **WTHek** family — official extensions for [`http-error-kit`][http-error-kit]:

| Package | Framework | Description |
| --- | --- | --- |
| **@wthek/express-middleware** | Express 4 / 5 | _You are here_ |
| [@wthek/fastify-middleware](https://www.npmjs.com/package/@wthek/fastify-middleware) | Fastify 4 / 5 | Error handler plugin for Fastify |
| [@wthek/restify-middleware](https://www.npmjs.com/package/@wthek/restify-middleware) | Restify 8 – 11 | Error handler middleware for Restify |
| [@wthek/nestjs-middleware](https://www.npmjs.com/package/@wthek/nestjs-middleware) | NestJS 8 – 11 | Exception filter for NestJS (Express & Fastify) |
| [@wthek/zod-transformer](https://www.npmjs.com/package/@wthek/zod-transformer) | Zod 3 | Transforms Zod validation errors into KitHttpError |

### Core Libraries

| Package | Description |
| --- | --- |
| [http-error-kit](https://www.npmjs.com/package/http-error-kit) | Structured HTTP error classes with built-in formatting |
| [http-response-status-code](https://www.npmjs.com/package/http-response-status-code) | TypeScript constants for all HTTP status codes |

**Full list of extensions**: [Official Extensions List](https://github.com/Skillnter/http-error-kit/wiki/Official-Extensions-List)

## People

The original author of the project is [Himanshu Bansal][skillnter]

## Donations

**This is all voluntary work**, so if you want to support my efforts you can

-   [Buy Me A Coffee](https://www.buymeacoffee.com/skillnter)
-   [Paypal](https://www.paypal.me/skillnte)
-   [GitHub Sponsor](https://github.com/sponsors/Skillnter)
-   [Patreon](https://www.patreon.com/skillnter)
-   [Open Collective](https://opencollective.com/skillnter)

You can also use the following:

![BTC: bc1p22h4nsad5d8ketyhuvf0vyva6unttxwzzqvkty5r839as0mlclgs72d3mf](https://img.shields.io/badge/BTC-bc1p22h4nsad5d8ketyhuvf0vyva6unttxwzzqvkty5r839as0mlclgs72d3mf-brightgreen)

![ETH: 0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889](https://img.shields.io/badge/ETH-0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889-brightgreen)

![BNB: 0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889](https://img.shields.io/badge/BNB-0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889-brightgreen)

## License

`@wthek/express-middleware` project is open-sourced software licensed under the [MIT license](LICENSE) by [Himanshu Bansal][skillnter].

[skillnter]: https://github.com/Skillnter/
[http-error-kit]: https://www.npmjs.com/package/http-error-kit
