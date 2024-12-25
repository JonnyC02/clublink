import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
})

export default pool;