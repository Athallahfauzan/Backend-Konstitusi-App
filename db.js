const mysql = require('mysql');

// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '34.101.190.80',
  user: 'root',
  password: 'konstitusi',
  database: 'db_konstitusi',
});

// Wrap the query function to return a promise
const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Wrap the beginTransaction function to return a promise
const beginTransaction = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return reject(err);
        }
        resolve(connection);
      });
    });
  });
};

// Wrap the commit function to return a promise
const commit = (connection) => {
  return new Promise((resolve, reject) => {
    if (connection) {
      connection.commit((err) => {
        if (err) {
          return reject(err);
        }
        connection.release();
        resolve();
      });
    } else {
      resolve(); // Resolve if there is no connection (avoiding 'Cannot read properties of undefined' error)
    }
  });
};

// Wrap the rollback function to return a promise
const rollback = (connection) => {
  return new Promise((resolve) => {
    if (connection) {
      connection.rollback(() => {
        connection.release();
        resolve();
      });
    } else {
      resolve(); // Resolve if there is no connection (avoiding 'Cannot read properties of undefined' error)
    }
  });
};

module.exports = { query, beginTransaction, commit, rollback };

