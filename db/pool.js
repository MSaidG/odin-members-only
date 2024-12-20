const { Pool } = require('pg');

const pool = new Pool({

  connectionString: process.env.MEMBERS_DB_URI
})

module.exports = pool;