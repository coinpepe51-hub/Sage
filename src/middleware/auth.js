const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {

    const header =
        req.headers.authorization;

    if (
        !header ||
        !header.startsWith("Bearer ")
    ) {

        return res.status(401).json({
            error: "Authentication required"
        });

    }


    const token =
        header.slice(7);


    try {

        const payload =
            jwt.verify(
                token,
                process.env.JWT_SECRET,
                {
                    algorithms: ["HS256"],
                    issuer: process.env.JWT_ISSUER,
                    audience: process.env.JWT_AUDIENCE
                }
            );


        req.user = {
            id: payload.sub
        };


        next();

    } catch (error) {

        return res.status(401).json({
            error: "Invalid or expired token"
        });

    }

}


module.exports = authenticate;
