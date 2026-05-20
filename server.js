const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ s: 'ok', message: 'FYERS Proxy v2 running' });
});

// FYERS Quotes Proxy
app.get('/quotes', async (req, res) => {
  const { symbols, appId, token } = req.query;
  if (!symbols || !appId || !token) {
    return res.status(400).json({ s: 'error', message: 'symbols, appId, token required' });
  }
  try {
    const response = await axios.get(
      `https://api-t1.fyers.in/data/quotes/?symbols=${encodeURIComponent(symbols)}`,
      { headers: { 'Authorization': `${appId}:${token}` }, timeout: 10000 }
    );
    res.json(response.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { s: 'error', message: e.message });
  }
});

// FYERS Historical Candle Data Proxy
// Usage: /history?symbol=NSE:SBIN-EQ&resolution=D&appId=XXX&token=eyJ...
app.get('/history', async (req, res) => {
  const { symbol, resolution, appId, token } = req.query;
  if (!symbol || !resolution || !appId || !token) {
    return res.status(400).json({ s: 'error', message: 'symbol, resolution, appId, token required' });
  }

  // Date range: last 100 days for daily, last 30 days for weekly
  const now   = Math.floor(Date.now() / 1000);
  const days  = resolution === 'W' ? 500 : 150; // enough candles for 20-period high
  const from  = now - (days * 24 * 60 * 60);

  try {
    const url = `https://api-t1.fyers.in/data/history/?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&date_format=0&range_from=${from}&range_to=${now}&cont_flag=1`;
    const response = await axios.get(url, {
      headers: { 'Authorization': `${appId}:${token}` },
      timeout: 15000
    });
    res.json(response.data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { s: 'error', message: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FYERS Proxy v2 running on port ${PORT}`));
