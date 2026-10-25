const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("error", error => {
    console.error("Unexpected PostgreSQL error:", error);
});

async function query(text, params = []) {
    return pool.query(text, params);
}

async function testDatabase() {

    const result = await query(
        "SELECT current_database() AS database, version() AS version"
    );

    return result.rows[0];
}

module.exports = {
    pool,
    query,
    testDatabase
};
