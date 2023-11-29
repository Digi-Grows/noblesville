const session = require('express-session');
const MySQLStore = require('express-mysql-session') (session);

const sessionStore = new MySQLStore({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port : process.env.PORT,
});

module.exports = sessionStore;
