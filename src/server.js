require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const {
    testDatabase
} = require("./db");

const authRoutes =
    require("./routes/authRoutes");

const tradeRoutes =
    require("./routes/tradeRoutes");


const app =
    express();


/* =========================================================
   SECURITY
   ========================================================= */

app.use(
    helmet()
);


app.use(
    cors({
        origin: process.env.FRONTEND_URL || true,
        credentials: true
    })
);


/* =========================================================
   BODY PARSING
   ========================================================= */

app.use(
    express.json({
        limit: "1mb"
    })
);


/* =========================================================
   HEALTH
   ========================================================= */

app.get(
    "/api/health",
    async (req, res) => {

        try {

            const database =
                await testDatabase();


            res.json({

                status: "ok",

                service: "Sage Journal API",

                database: database.database

            });

        } catch (error) {

            console.error(
                "Health check error:",
                error
            );


            res.status(503).json({

                status: "error",

                service: "Sage Journal API",

                database: "unavailable"

            });

        }

    }
);


/* =========================================================
   ROUTES
   ========================================================= */

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/trades",
    tradeRoutes
);


/* =========================================================
   ROOT
   ========================================================= */

app.get(
    "/",
    (req, res) => {

        res.json({
            message: "Sage Journal API"
        });

    }
);


/* =========================================================
   404
   ========================================================= */

app.use(
    (req, res) => {

        res.status(404).json({
            error: "Route not found"
        });

    }
);


/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use(
    (error, req, res, next) => {

        console.error(
            "Unhandled error:",
            error
        );


        res.status(500).json({
            error: "Internal server error"
        });

    }
);


/* =========================================================
   START SERVER
   ========================================================= */

const PORT =
    Number(process.env.PORT) || 4000;


app.listen(
    PORT,
    async () => {

        console.log(
            `Sage Journal API running on port ${PORT}`
        );


        try {

            const database =
                await testDatabase();


            console.log(
                `Connected to PostgreSQL: ${database.database}`
            );

        } catch (error) {

            console.error(
                "Database connection failed:",
                error.message
            );

        }

    }
);
