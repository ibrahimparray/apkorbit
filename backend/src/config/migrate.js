// require('dotenv').config();
// const mysql = require('mysql2/promise');
// const fs = require('fs');
// const path = require('path');
// const bcrypt = require('bcryptjs');

// async function migrate() {
//   let connection;
//   try {
//     const dbName = process.env.DB_NAME || 'apk_store';

//     connection = await mysql.createConnection({
//       host: process.env.DB_HOST || 'localhost',
//       port: parseInt(process.env.DB_PORT) || 3306,
//       user: process.env.DB_USER || 'root',
//       password: process.env.DB_PASSWORD || '',
//       multipleStatements: true,
//       connectTimeout: 30000,
//       ...(process.env.DB_SSL === 'true' ? {
//         ssl: { rejectUnauthorized: false }
//       } : {})
//     });

//     console.log('Connected to MySQL.');

//     // Ensure database exists
//     await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
//     console.log(`Database '${dbName}' ensured.`);

//     const schemaPath = path.join(__dirname, '../../database/schema.sql');
//     if (!fs.existsSync(schemaPath)) {
//       console.error('Schema file not found:', schemaPath);
//       process.exit(1);
//     }

//     const schema = fs.readFileSync(schemaPath, 'utf8');

//     // Use the database
//     await connection.query(`USE \`${dbName}\``);

//     // Try to apply schema, skip if tables exist
//     try {
//       await connection.query(schema);
//       console.log('Database schema applied successfully.');
//     } catch (err) {
//       if (err.code === 'ER_TABLE_EXISTS_ERROR') {
//         console.log('Tables already exist, skipping schema creation.');
//       } else {
//         throw err;
//       }
//     }

//     const hashedPassword = await bcrypt.hash('admin123', 12);
//     await connection.query(
//       `UPDATE \`${dbName}\`.users SET password = ? WHERE email = ?`,
//       [hashedPassword, 'admin@apkstore.local']
//     );
//     console.log('Default admin password set (admin123).');
//     console.log('Migration complete!');
//     console.log(`Login: admin@apkstore.local / admin123`);

//   } catch (err) {
//     console.error('Migration failed:', err);
//     process.exit(1);
//   } finally {
//     if (connection) await connection.end();
//     process.exit(0);
//   }
// }

// migrate();
