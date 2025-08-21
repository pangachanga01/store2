const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

const pageRoutes = require('./routes/pages');
app.use('/api/pages', pageRoutes);

const carouselRoutes = require('./routes/carousel');
app.use('/api/carousel', carouselRoutes);

const enquiryRoutes = require('./routes/enquiries');
app.use('/api/enquiries', enquiryRoutes);

const uploadRoutes = require('./routes/uploads');
app.use('/api/uploads', uploadRoutes);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
