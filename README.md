# Official @wthek Extension – Express Middleware for `http-error-kit`

**Seamless Express Error Handling with @wthek**

_Built for applications powered by [http-error-kit][http-error-kit], this middleware ensures that all `http-error-kit` errors are properly formatted and returned with the correct HTTP status codes._

> 💡 What the HEK?! Need a hassle-free way to manage error responses for `http-error-kit` errors in Express? `@wthek/express-middleware` has got you covered!

## Features

-   **Official `http-error-kit` Extension** – The recommended middleware for Express.js apps.
-   **Auto-sets HTTP status codes** – Ensures the response status matches the error type.
-   **Plug-and-Play Middleware** – Just drop it before starting your server!
-   **Graceful Fallbacks** – Passes unrecognized errors to the next middleware.

## Table of Content

-   [Installation](#installation)
-   [Usage](#usage)
-   [How It Works](#how-it-works)
-   [Why Use @wthek/express-middleware?](#why-use-wthekexpress-middleware)
-   [Explore More WTHek Extensions](#explore-more-wthek-extensions)
-   [People](#people)
-   [Donations](#donations)
-   [License](#license)

## Installation

```console
npm install @wthek/express-middleware
```

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

## How It Works

-   Catches errors thrown in routes and middleware
-   Checks if the error is an instance of any `http-error-kit` Errors
-   Formats the error response and sets the correct HTTP status code
-   Passes other errors to the next middleware (_so they can be handled separately_)

## Why Use `@wthek/express-middleware`?

-   **No more manual error handling** – Status codes are automatically set.
-   **Consistent API responses** – Standardized errors improve debugging & logging.
-   **Works perfectly with `http-error-kit`** – Fully compatible with existing `http-error-kit` error structures.

## Explore More WTHek Extensions

The WTHek ecosystem continues to grow with new extensions to simplify error handling across various frameworks and libraries. Stay updated with the latest tools that integrate seamlessly with `http-error-kit`.

**Check out the official list of extensions**: [Official Extensions List](https://github.com/Skillnter/http-error-kit/wiki/Official-Extensions-List)

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

![BTC: qzqmpxux3m56qqhz465u8022q9z63w2sysq4u9ltwj](https://img.shields.io/badge/BTC-qzqmpxux3m56qqhz465u8022q9z63w2sysq4u9ltwj-brightgreen)

![ETH: 0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889](https://img.shields.io/badge/ETH-0x1D59a291391a3CE17C63D5dC50F258Dc0Ab62889-brightgreen)

## License

`@wthek/express-middleware` project is open-sourced software licensed under the [MIT license](LICENSE) by [Himanshu Bansal][skillnter].

[skillnter]: https://github.com/Skillnter/
[http-error-kit]: https://www.npmjs.com/package/http-error-kit
