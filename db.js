const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'DB_HOSTNAME',
  user: 'DB_USERNAME',
  password: 'DB_PASSWORD',
  database: 'DB_NAME',
});

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
      resolve();
    }
  });
};

const rollback = (connection) => {
  return new Promise((resolve) => {
    if (connection) {
      connection.rollback(() => {
        connection.release();
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = { query, beginTransaction, commit, rollback };

