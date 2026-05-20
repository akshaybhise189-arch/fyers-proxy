const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// FYERS API v3 Quotes Proxy
app.get('/quotes', async (req, res) => {
  const { symbols, appId, token } = req.query;
  if (!symbols || !appId || !token) {
    return res.status(400).json({ s: 'error', message: 'symbols, appId, token required' });
  }
  try {
    const response = await axios.get(
      `https://api-t1.fyers.in/data/quotes/?symbols=${symbols}`,
      { headers: { 'Authorization': `${appId}:${token}` } }
    );
    res.json(response.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { s: 'error', message: e.message });
  }
});

app.get('/health', (req, res) => res.json({ s: 'ok', message: 'FYERS Proxy running' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FYERS Proxy running on port ${PORT}`));
