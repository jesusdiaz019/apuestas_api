const dotenv = require( "dotenv" );

dotenv.config();

const { DB_SERVER,
    DB_NAME,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
} = process.env;

module.exports = {
    user: DB_USER,
    password: DB_PASSWORD,
    server: DB_SERVER,
    database: DB_NAME,
    port: parseInt(DB_PORT),
    options: {
        encrypt: true
    }
};