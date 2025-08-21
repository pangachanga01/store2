const { pool } = require('./pool');
const bcrypt = require('bcryptjs');

const CREATE_TABLES_SQL = `
  DROP TABLE IF EXISTS "User", "Category", "Product", "Page", "CarouselSlide", "Enquiry", "NavLink" CASCADE;
  DROP TYPE IF EXISTS "Role", "LinkType", "CarouselEffect", "EnquiryStatus";

  CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'USER');
  CREATE TYPE "LinkType" AS ENUM ('PRODUCT', 'PAGE', 'EXTERNAL');
  CREATE TYPE "CarouselEffect" AS ENUM ('SLIDE', 'FADE');
  CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'RESPONDED', 'RESOLVED');

  CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description_html" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "main_image_url" TEXT,
    "images" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "category_id" INTEGER NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content_html" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "CarouselSlide" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image_url" TEXT NOT NULL,
    "link_type" "LinkType" NOT NULL,
    "link_target" TEXT NOT NULL,
    "button_text" TEXT,
    "order" INTEGER NOT NULL,
    "effect" "CarouselEffect" NOT NULL DEFAULT 'SLIDE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CarouselSlide_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "Enquiry" (
    "id" SERIAL NOT NULL,
    "user_info" JSONB NOT NULL,
    "items" JSONB NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "NavLink" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "type" "LinkType" NOT NULL,
    "target" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "NavLink_pkey" PRIMARY KEY ("id")
  );

  CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
  CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
  CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
  CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
  CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
  ALTER TABLE "Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
`;

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Beginning database seeding...');

    // --- Create Tables ---
    console.log('Dropping and recreating tables...');
    await client.query(CREATE_TABLES_SQL);
    console.log('Tables created successfully.');

    // --- Seed Data ---
    console.log('Inserting seed data...');
    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash('admin123', 12);
    await client.query(
      `INSERT INTO "User" (name, email, password_hash, role, updated_at) VALUES ($1, $2, $3, 'ADMIN', NOW())`,
      ['Admin User', 'admin@example.com', hashedPassword]
    );

    const categoryResult = await client.query(
      `INSERT INTO "Category" (name, slug, sort_order) VALUES ('Featured Gadgets', 'featured-gadgets', 1), ('Electronics', 'electronics', 2) RETURNING id`
    );
    const categoryIds = categoryResult.rows.map(row => row.id);

    const products = [
      { name: 'Smart-Home Hub', slug: 'smart-home-hub', sku: 'SHH-001', description_html: '<p>Control your entire home from one device.</p>', price_cents: 12999, main_image_url: 'https://i.imgur.com/8p3hF7G.jpeg', category_id: categoryIds[0] },
      { name: 'Wireless Noise-Cancelling Headphones', slug: 'wireless-headphones', sku: 'WHP-002', description_html: '<p>Immerse yourself in sound.</p>', price_cents: 24999, main_image_url: 'https://i.imgur.com/8p3hF7G.jpeg', category_id: categoryIds[1] },
    ];
    for (const p of products) {
      await client.query(
        `INSERT INTO "Product" (sku, name, slug, description_html, price_cents, main_image_url, category_id, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [p.sku, p.name, p.slug, p.description_html, p.price_cents, p.main_image_url, p.category_id]
      );
    }

    const pages = [
        { title: 'About Us', slug: 'about-us', content_html: '<h1>About Our Company</h1><p>We are dedicated to bringing you the best products.</p>', published: true },
        { title: 'Contact', slug: 'contact', content_html: '<h1>Contact Us</h1><p>Get in touch via our contact form.</p>', published: true },
    ];
    for (const p of pages) {
        await client.query(
            `INSERT INTO "Page" (title, slug, content_html, published, updated_at) VALUES ($1, $2, $3, $4, NOW())`,
            [p.title, p.slug, p.content_html, p.published]
        );
    }

    const carouselSlides = [
        { title: 'Latest Tech Deals', subtitle: 'Up to 30% off', image_url: 'https://i.imgur.com/LBDf94e.jpeg', link_type: 'PRODUCT', link_target: 'wireless-headphones', button_text: 'Shop Now', order: 1, effect: 'SLIDE' },
        { title: 'Discover Our Story', subtitle: 'Learn our mission', image_url: 'https://i.imgur.com/LBDf94e.jpeg', link_type: 'PAGE', link_target: 'about-us', button_text: 'Read More', order: 2, effect: 'FADE' },
    ];
    for (const s of carouselSlides) {
        await client.query(
            `INSERT INTO "CarouselSlide" (title, subtitle, image_url, link_type, link_target, button_text, "order", effect, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [s.title, s.subtitle, s.image_url, s.link_type, s.link_target, s.button_text, s.order, s.effect]
        );
    }

    const navLinks = [
      { text: 'Home', type: 'PAGE', target: '/', order: 1 },
      { text: 'All Products', type: 'PAGE', target: '/products', order: 2 },
      { text: 'About', type: 'PAGE', target: '/about-us', order: 3 },
      { text: 'Contact', type: 'PAGE', target: '/contact', order: 4 },
    ];
    for (const l of navLinks) {
        await client.query(
            `INSERT INTO "NavLink" (text, type, target, "order") VALUES ($1, $2, $3, $4)`,
            [l.text, l.type, l.target, l.order]
        );
    }

    await client.query('COMMIT');
    console.log('Database seeding committed successfully.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log('Seeding finished and client released.');
  }
}

seed();
