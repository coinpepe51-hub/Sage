const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { query } = require("../db");
const authenticate = require("../middleware/auth");

const router = express.Router();


function createToken(user) {

    return jwt.sign(
        {
            sub: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "7d",
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }
    );

}


/* =========================================================
   REGISTER
   ========================================================= */

router.post("/register", async (req, res) => {

    try {

        const {
            email,
            password,
            displayName
        } = req.body;


        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {

            return res.status(400).json({
                error: "Email and password are required"
            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        if (!normalizedEmail) {

            return res.status(400).json({
                error: "Email is required"
            });

        }


        if (password.length < 8) {

            return res.status(400).json({
                error:
                    "Password must be at least 8 characters"
            });

        }


        const existing =
            await query(
                `
                SELECT id
                FROM users
                WHERE email = $1
                `,
                [normalizedEmail]
            );


        if (existing.rowCount > 0) {

            return res.status(409).json({
                error: "An account with that email already exists"
            });

        }


        const passwordHash =
            await bcrypt.hash(password, 12);


        const result =
            await query(
                `
                INSERT INTO users
                (
                    email,
                    password_hash,
                    display_name
                )
                VALUES ($1, $2, $3)
                RETURNING
                    id,
                    email,
                    display_name,
                    created_at
                `,
                [
                    normalizedEmail,
                    passwordHash,
                    typeof displayName === "string"
                        ? displayName.trim()
                        : null
                ]
            );


        const user =
            result.rows[0];


        const token =
            createToken(user);


        return res.status(201).json({

            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                createdAt: user.created_at
            },

            token

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        return res.status(500).json({
            error: "Unable to create account"
        });

    }

});


/* =========================================================
   LOGIN
   ========================================================= */

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {

            return res.status(400).json({
                error: "Email and password are required"
            });

        }


        const normalizedEmail =
            email.trim().toLowerCase();


        const result =
            await query(
                `
                SELECT
                    id,
                    email,
                    password_hash,
                    display_name,
                    is_active,
                    created_at
                FROM users
                WHERE email = $1
                `,
                [normalizedEmail]
            );


        if (result.rowCount === 0) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }


        const user =
            result.rows[0];


        if (!user.is_active) {

            return res.status(403).json({
                error: "Account is inactive"
            });

        }


        const validPassword =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!validPassword) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }


        const token =
            createToken(user);


        return res.json({

            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                createdAt: user.created_at
            },

            token

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({
            error: "Unable to login"
        });

    }

});


/* =========================================================
   CURRENT USER
   ========================================================= */

router.get(
    "/me",
    authenticate,
    async (req, res) => {

        try {

            const result =
                await query(
                    `
                    SELECT
                        id,
                        email,
                        display_name,
                        created_at
                    FROM users
                    WHERE id = $1
                    AND is_active = TRUE
                    `,
                    [req.user.id]
                );


            if (result.rowCount === 0) {

                return res.status(404).json({
                    error: "User not found"
                });

            }


            const user =
                result.rows[0];


            return res.json({

                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.display_name,
                    createdAt: user.created_at
                }

            });


        } catch (error) {

            console.error(
                "Me error:",
                error
            );


            return res.status(500).json({
                error: "Unable to retrieve user"
            });

        }

    }
);


module.exports = router;
