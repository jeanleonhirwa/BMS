const express = require('express');
const cors = require('cors');
const { testDbConnection } = require('./config/db');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test DB Connection
testDbConnection();

// Define Routes
app.use('/api/summary', require('./routes/summary'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/goals', require('./routes/goals'));

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
