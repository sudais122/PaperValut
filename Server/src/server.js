const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.json({ message: 'PaperVault API running — file storage mode' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});