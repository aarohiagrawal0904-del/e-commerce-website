const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Load environment configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());

// API Status Monitor / Health Check
app.get('/', async (req, res) => {
  const dbConnected = await testConnection();
  res.status(200).json({
    status: 'online',
    message: 'Smart E-Commerce API is running smoothly',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    databaseConnection: dbConnected ? 'Healthy' : 'Unreachable',
    aiIntegration: process.env.GEMINI_API_KEY ? 'Active' : 'Fallback Mode (API Key Missing)'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Catch 404 Route Not Found
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Endpoint not found - ${req.originalUrl}`));
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

// Initialize Database connection test and launch Server
const startServer = async () => {
  console.log('🔌 Verifying Database link...');
  await testConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server successfully launched in ${process.env.NODE_ENV || 'development'} mode!`);
    console.log(`📡 Listening on http://localhost:${PORT}`);
  });
};

startServer();
