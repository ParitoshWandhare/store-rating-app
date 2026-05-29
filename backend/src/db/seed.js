const bcrypt = require('bcryptjs');
const { pool } = require('./index');
require('dotenv').config();

async function seed() {
  const client = await pool.connect();
  try {
    console.log('⏳ Seeding database...');

    const salt = await bcrypt.genSalt(12);
    const adminHash  = await bcrypt.hash('Admin@123', salt);
    const userHash   = await bcrypt.hash('User@1234', salt);
    const ownerHash  = await bcrypt.hash('Owner@123', salt);

    // Admin user
    const adminRes = await client.query(`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES ($1, $2, $3, $4, 'admin')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'System Administrator User',
      'admin@storerating.com',
      adminHash,
      '123 Admin Street, Admin City, AC 00001'
    ]);
    const adminId = adminRes.rows[0].id;

    // Store owners
    const owner1Res = await client.query(`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES ($1, $2, $3, $4, 'owner')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'Green Valley Grocery Owner',
      'owner1@example.com',
      ownerHash,
      '456 Market Avenue, Commerce City, CC 10001'
    ]);
    const owner1Id = owner1Res.rows[0].id;

    const owner2Res = await client.query(`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES ($1, $2, $3, $4, 'owner')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'Blue Ocean Electronics Store',
      'owner2@blueocean.com',
      ownerHash,
      '789 Tech Boulevard, Innovation Park, IP 20002'
    ]);
    const owner2Id = owner2Res.rows[0].id;

    const owner3Res = await client.query(`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES ($1, $2, $3, $4, 'owner')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'Sunrise Bakery and Cafe Owner',
      'owner3@sunrisebakery.com',
      ownerHash,
      '321 Pastry Lane, Sweet Town, ST 30003'
    ]);
    const owner3Id = owner3Res.rows[0].id;

    // Normal users
    const user1Res = await client.query(`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES ($1, $2, $3, $4, 'user')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'Alice Johnson Regular Shopper',
      'alice@example.com',
      userHash,
      '111 Maple Street, Residential Area, RA 40001'
    ]);
    const user1Id = user1Res.rows[0].id;

    const user2Res = await client.query(`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES ($1, $2, $3, $4, 'user')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'Bob Martinez Frequent Buyer',
      'bob@example.com',
      userHash,
      '222 Oak Avenue, Downtown District, DD 40002'
    ]);
    const user2Id = user2Res.rows[0].id;

    const user3Res = await client.query(`
      INSERT INTO users (name, email, password_hash, address, role)
      VALUES ($1, $2, $3, $4, 'user')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'Carol White Loyal Customer',
      'carol@example.com',
      userHash,
      '333 Pine Boulevard, Suburban Heights, SH 40003'
    ]);
    const user3Id = user3Res.rows[0].id;

    // Stores
    const store1Res = await client.query(`
      INSERT INTO stores (name, email, address, owner_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'Green Valley Fresh Grocery Market',
      'info@greenvalley.com',
      '456 Market Avenue, Commerce City, CC 10001',
      owner1Id
    ]);
    const store1Id = store1Res.rows[0].id;

    const store2Res = await client.query(`
      INSERT INTO stores (name, email, address, owner_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'Blue Ocean Electronics and Gadgets',
      'info@blueocean.com',
      '789 Tech Boulevard, Innovation Park, IP 20002',
      owner2Id
    ]);
    const store2Id = store2Res.rows[0].id;

    const store3Res = await client.query(`
      INSERT INTO stores (name, email, address, owner_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'Sunrise Artisan Bakery and Coffee',
      'info@sunrisebakery.com',
      '321 Pastry Lane, Sweet Town, ST 30003',
      owner3Id
    ]);
    const store3Id = store3Res.rows[0].id;

    const store4Res = await client.query(`
      INSERT INTO stores (name, email, address, owner_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [
      'Urban Fashion Boutique and Accessories',
      'info@urbanfashion.com',
      '654 Style Street, Fashion District, FD 50004',
      null
    ]);
    const store4Id = store4Res.rows[0].id;

    // Ratings
    const ratingsData = [
      [user1Id, store1Id, 5],
      [user1Id, store2Id, 4],
      [user1Id, store3Id, 5],
      [user2Id, store1Id, 3],
      [user2Id, store2Id, 5],
      [user2Id, store4Id, 2],
      [user3Id, store1Id, 4],
      [user3Id, store3Id, 4],
      [user3Id, store4Id, 3],
    ];

    for (const [uid, sid, score] of ratingsData) {
      await client.query(`
        INSERT INTO ratings (user_id, store_id, score)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, store_id) DO UPDATE SET score = EXCLUDED.score
      `, [uid, sid, score]);
    }

    console.log('✅ Seed data inserted successfully.');
    console.log('\n📋 Demo Credentials:');
    console.log('  Admin:       admin@storerating.com    / Admin@123');
    console.log('  Store Owner: owner1@example.com   / Owner@123');
    console.log('  Normal User: alice@example.com        / User@1234');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
