const { db_user, db_password, db_name } = require("./private");
const { Pool } = require('pg');

const pool = new Pool({
  host: "dpg-ckes4l7s0fgc73ca748g-a.oregon-postgres.render.com",
  user: db_user, 
  password: db_password, 
  database: db_name,
  allowExitOnIdle: true
});

module.exports = pool;

