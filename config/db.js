
const { db_user, db_password, db_name, db_hostmy } = require("./private");
const { Pool } = require('pg');

const pool = new Pool({
  host: db_hostmy,
  user: db_user, 
  password: db_password, 
  database: db_name,
  allowExitOnIdle: true,
  ssl: true
});

module.exports = pool;
/*
const { db_user, db_password, db_name } = require("./private");
const { Pool } = require('pg');

const pool = new Pool({
  host: "localhost",
  user: db_user, 
  password: db_password, 
  database: db_name,
  allowExitOnIdle: true,
});

module.exports = pool;
*/
