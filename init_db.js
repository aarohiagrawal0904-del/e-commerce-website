const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'aarohi09';
const dbName = process.env.DB_NAME || 'smart_ecommerce';
const dbPort = parseInt(process.env.DB_PORT || '3306');

async function initializeDatabase() {
  console.log('🚀 Initializing E-Commerce Database Setup...');
  
  let connection;
  try {
    // 1. Connect without a database first
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: dbPort
    });
    
    console.log(`Connected to MySQL server at ${dbHost}:${dbPort}`);
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Database "${dbName}" verified or created.`);
    
    await connection.query(`USE \`${dbName}\`;`);
    
    // 2. Read schema.sql from root
    const schemaPath = path.join(__dirname, '..', '..', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    const sqlStatements = schemaSql
      .replace(/--.*$/gm, '') 
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
      
    console.log('Building tables...');
    for (const statement of sqlStatements) {
      if (statement.toLowerCase().startsWith('create database') || statement.toLowerCase().startsWith('use')) {
        continue;
      }
      try {
        await connection.query(statement);
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          continue;
        }
        console.error(`⚠️ Statement failed: ${statement.substring(0, 50)}...`);
        console.error(`Error: ${err.message}`);
      }
    }
    console.log('✅ MySQL schema tables constructed successfully.');

    // 3. Seed Categories
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (categories[0].count === 0) {
      console.log('Seeding categories...');
      const initialCategories = [
        ['Electronics', 'Sleek premium gadgets, smart watches, mechanical keyboards, and audio peripherals'],
        ['Fashion', 'Contemporary clothing, apparel, distressed leather coats, and sports sneakers'],
        ['Home & Living', 'Ergonomic office furnishings, ambient smart lighting bars, and coffee equipment'],
        ['Books', 'Tech engineering guides, design patterns manuals, and engaging literature'],
        ['Sports & Outdoors', 'Trekking poles, heavy duty duffle bags, and outdoor activity equipment']
      ];
      
      const insertCategoryQuery = 'INSERT INTO categories (name, description) VALUES (?, ?)';
      for (const cat of initialCategories) {
        await connection.query(insertCategoryQuery, cat);
      }
      console.log('✅ Categories seeded.');
    }

    // 4. Seed Products in INR (Rupees) - Expanded Kaggle-style dataset of 14 items
    const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (products[0].count === 0) {
      console.log('Seeding expanded Kaggle e-commerce product dataset (Prices in INR ₹)...');
      
      const [cats] = await connection.query('SELECT id, name FROM categories');
      const catMap = {};
      cats.forEach(c => { catMap[c.name] = c.id; });

      const initialProducts = [
        // Category: Electronics (4 items)
        [
          catMap['Electronics'],
          'Vortex X1 Mechanical Keyboard',
          'Premium aluminum chassis, hot-swappable tactile linear switches, customized RGB backlighting, and dual Bluetooth/USB-C modes. Premium tactile feedback for developers.',
          15499.00,
          45,
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=1000'
        ],
        [
          catMap['Electronics'],
          'Aura 4 Pro ANC Headphones',
          'Industry-leading active noise cancellation, custom high-fidelity dynamic drivers, 40 hours of continuous playback, and plush memory foam earcups.',
          24950.00,
          24,
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000'
        ],
        [
          catMap['Electronics'],
          'Titan Smartwatch Pro 5',
          'AMOLED always-on touch display, extensive bio-tracking (ECG, blood oxygen, sleep phases), multi-sport GPS tracking, and a rugged titanium bezel.',
          19900.00,
          15,
          'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=1000'
        ],
        [
          catMap['Electronics'],
          'Apex Wireless Gaming Mouse',
          'Ultra-lightweight ergonomic gaming mouse with high-precision 26K DPI optical sensor, hyper-fast wireless response, and 80-hour rechargeable battery life.',
          6499.00,
          50,
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1000'
        ],

        // Category: Fashion (3 items)
        [
          catMap['Fashion'],
          'Horizon Distressed Leather Jacket',
          'Full-grain distressed brown leather, fitted tailored profile, durable dual YKK metallic zippers, and comfortable interior lining.',
          16500.00,
          12,
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=1000'
        ],
        [
          catMap['Fashion'],
          'Veloce Performance Running Shoes',
          'Extremely lightweight breathable mesh, carbon-fiber energy propulsion plate, and highly responsive foam cushioning for ultimate distance comfort.',
          9999.00,
          30,
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000'
        ],
        [
          catMap['Fashion'],
          'Explorer Active Canvas Backpack',
          'Durable water-resistant canvas, multi-compartment interior laptop sleeve, ergonomic padded shoulder straps, and premium leather accents.',
          4200.00,
          40,
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1000'
        ],

        // Category: Home & Living (3 items)
        [
          catMap['Home & Living'],
          'Solas Ergonomic Desk Chair',
          'Fully adjustable structural lumbar support, 3D custom armrests, breathable hyper-elastic mesh backrest, and smooth silent casters.',
          28999.00,
          8,
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=1000'
        ],
        [
          catMap['Home & Living'],
          'Nova Smart Ambient Light Bar',
          'App-controlled ambient light bar, 16 million colors, automated rhythm sync for desk setups, and fully compatible with smart assistant integrations.',
          5900.00,
          60,
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1000'
        ],
        [
          catMap['Home & Living'],
          'Ceramic Drip Coffee Brewer',
          'Elegant minimalist ceramic drip cone brewer set, includes a 600ml borosilicate glass decanter, heat-insulating silicone collar, and paper filters.',
          3200.00,
          25,
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1000'
        ],

        // Category: Books (2 items)
        [
          catMap['Books'],
          'Architects of Intelligence',
          'Engaging collection of interviews with 23 of the world\'s leading artificial intelligence researchers, detailing deep learning, neural networks, and robotics development.',
          1499.00,
          100,
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1000'
        ],
        [
          catMap['Books'],
          'System Design Interview Guide',
          'Comprehensive handbook detailing architectural concepts, database scaling, microservices decoupling, and load balancer setups. A must-read for tech interviews.',
          2199.00,
          80,
          'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1000'
        ],

        // Category: Sports & Outdoors (2 items)
        [
          catMap['Sports & Outdoors'],
          'Horizon Carbon Trekking Pole',
          'Ultra-lightweight carbon fiber trekking pole with shock-absorbing cork handle, secure flip locks, and interchangeable mud/snow baskets.',
          2800.00,
          35,
          'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80&w=1000'
        ],
        [
          catMap['Sports & Outdoors'],
          'Apex Active Sports Duffle Bag',
          'Heavy duty water-repellent nylon duffle bag with a separate ventilated shoe compartment, dry-wet separation pocket, and comfortable shoulder sling strap.',
          3500.00,
          50,
          'https://images.unsplash.com/photo-1546938576-6e6a6a934651?auto=format&fit=crop&q=80&w=1000'
        ]
      ];

      const insertProductQuery = 'INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)';
      for (const prod of initialProducts) {
        await connection.query(insertProductQuery, prod);
      }
      console.log('✅ Products seeded in INR ₹.');
    }

    // 5. Seed default users
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('Seeding default administrative and user accounts...');
      
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const userPasswordHash = await bcrypt.hash('user123', 10);
      
      const insertUserQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
      
      // Admin
      await connection.query(insertUserQuery, ['E-Commerce Administrator', 'admin@ecommerce.com', adminPasswordHash, 'admin']);
      // Test User
      await connection.query(insertUserQuery, ['Aarohi', 'user@ecommerce.com', userPasswordHash, 'user']);
      
      console.log('✅ Default users seeded.');
      console.log('   👉 Admin: admin@ecommerce.com / admin123');
      console.log('   👉 User:  user@ecommerce.com / user123');
    }

    console.log('🎉 E-Commerce Database initialization finished successfully!');
    
  } catch (error) {
    console.error('❌ Critical error during database initialization:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
