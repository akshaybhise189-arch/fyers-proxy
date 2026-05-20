const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ s: 'ok', message: 'FYERS Proxy running' });
});

// FYERS API v3 Quotes Proxy
// Usage: /quotes?symbols=NSE:RELIANCE-EQ,NSE:SBIN-EQ&appId=XXX-100&token=eyJ...
app.get('/quotes', async (req, res) => {
  const { symbols, appId, token } = req.query;

  if (!symbols || !appId || !token) {
    return res.status(400).json({ s: 'error', message: 'symbols, appId, token required' });
  }

  try {
    const url = `https://api-t1.fyers.in/data/quotes/?symbols=${encodeURIComponent(symbols)}`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `${appId}:${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Return FYERS response as-is
    res.json(response.data);

  } catch (e) {
    const status = e.response?.status || 500;
    const data = e.response?.data || { s: 'error', message: e.message };
    res.status(status).json(data);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FYERS Proxy running on port ${PORT}`));
