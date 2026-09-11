export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const tradeType = (req.query.tradeType || 'SELL').toUpperCase(); // SELL = orang jual USDT (lu beli)
  const asset = req.query.asset || 'USDT';
  const fiat = req.query.fiat || 'IDR';
  const rows = Math.min(parseInt(req.query.rows || '10'), 20);
  const payTypes = req.query.payTypes ? req.query.payTypes.split(',') : [];
  try {
    const r = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset, fiat, merchantCheck: false, page: 1, rows, payTypes, publisherType: null, tradeType
      })
    });
    const j = await r.json();
    if (j.code !== '000000') return res.status(500).json(j);
    const data = (j.data || []).map(d => ({
      price: parseFloat(d.adv.price),
      priceStr: d.adv.price,
      min: d.adv.minSingleTransAmount,
      max: d.adv.maxSingleTransAmount,
      tradable: d.adv.tradableQuantity,
      payMethods: (d.adv.tradeMethods || []).map(m => m.tradeMethodName || m.identifier).join(', '),
      merchant: d.advertiser?.nickName || '—',
      orders: d.advertiser?.monthOrderCount,
      completion: d.advertiser?.monthFinishRate ? (d.advertiser.monthFinishRate*100).toFixed(1)+'%' : '—'
    })).sort((a,b)=>a.price-b.price);
    res.status(200).json({ tradeType, asset, fiat, count: data.length, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
