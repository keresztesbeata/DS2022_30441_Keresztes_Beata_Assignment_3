const config = {
    host    : 'mysql',
    user    : 'root',
    password: 'root',
    database: 'energy-db',
    port    : '3306',
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
};

module.exports = config;