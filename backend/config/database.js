const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const parseMysqlUrl = (rawUrl) => {
  if (!rawUrl) return null;

  try {
    const url = new URL(String(rawUrl));
    if (url.protocol !== 'mysql:') return null;

    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username || ''),
      password: decodeURIComponent(url.password || ''),
      database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
    };
  } catch {
    return null;
  }
};

const urlConfig =
  parseMysqlUrl(process.env.MYSQL_URL) ||
  parseMysqlUrl(process.env.DATABASE_URL) ||
  parseMysqlUrl(process.env.CLEARDB_DATABASE_URL);

const dbConfig = {
  host: urlConfig?.host || process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: urlConfig?.port || (process.env.DB_PORT ? Number(process.env.DB_PORT) : process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306),
  user: urlConfig?.user || process.env.DB_USER || process.env.MYSQLUSER || 'app_user',
  password: urlConfig?.password || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || 'app_password',
  database: urlConfig?.database || process.env.DB_NAME || process.env.MYSQLDATABASE || 'restaurant_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

const query = async (sql, params = []) => {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const initDatabase = async () => {
  try {
    const connection = await getConnection();

    const ensureColumn = async (tableName, columnName, columnDefinition) => {
      const [rows] = await connection.execute(
        `SELECT COUNT(*) as cnt
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tableName, columnName]
      );

      if (rows?.[0]?.cnt === 0) {
        await connection.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
      }
    };

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create menu_categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create menu_items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
      )
    `);

    // Add extra fields used by the frontend (safe, idempotent)
    await ensureColumn('menu_items', 'short_description', 'TEXT NULL');
    await ensureColumn('menu_items', 'full_description', 'TEXT NULL');
    await ensureColumn('menu_items', 'allergens', 'TEXT NULL');
    await ensureColumn('menu_items', 'ingredients', 'TEXT NULL');

    // Create reservations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        guests INT NOT NULL,
        special_requests TEXT,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create contact_messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create wines table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS wines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        region VARCHAR(255),
        description TEXT,
        full_description TEXT,
        price_glass DECIMAL(10,2),
        price_bottle DECIMAL(10,2),
        image_url VARCHAR(500),
        grape VARCHAR(255),
        pairing TEXT,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure all columns exist (safe for existing DBs)
    await ensureColumn('wines', 'region', 'VARCHAR(255) NULL');
    await ensureColumn('wines', 'description', 'TEXT NULL');
    await ensureColumn('wines', 'full_description', 'TEXT NULL');
    await ensureColumn('wines', 'price_glass', 'DECIMAL(10,2) NULL');
    await ensureColumn('wines', 'price_bottle', 'DECIMAL(10,2) NULL');
    await ensureColumn('wines', 'image_url', 'VARCHAR(500) NULL');
    await ensureColumn('wines', 'grape', 'VARCHAR(255) NULL');
    await ensureColumn('wines', 'pairing', 'TEXT NULL');
    await ensureColumn('wines', 'is_available', 'BOOLEAN DEFAULT TRUE');

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  getConnection,
  query,
  initDatabase
};