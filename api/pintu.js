export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  try{
    const r = await fetch('https://api.pintu.pro/v1/public/get-book?depth=20&symbol=USDT-IDR');
    const j = await r.json();
    if(j.code!==0) throw new Error(j.message);
    const bids=j.data.bids; // [price, qty, orders] — lu JUAL ke bid
    const asks=j.data.asks; // lu BELI dari ask
    const bestBid=parseFloat(bids[0][0]);
    const bestAsk=parseFloat(asks[0][0]);
    res.status(200).json({
      source:'pintu.pro orderbook',
      symbol:'USDT-IDR',
      bestBid, bestAsk,
      spread: bestAsk-bestBid,
      bids: bids.slice(0,5).map(b=>({price:parseFloat(b[0]), qty:parseFloat(b[1])})),
      asks: asks.slice(0,5).map(a=>({price:parseFloat(a[0]), qty:parseFloat(a[1])})),
      note: 'bestBid = lu JUAL USDT ke Pintu (limit sell hit bid), bestAsk = lu BELI USDT dari Pintu'
    });
  }catch(e){ res.status(500).json({error:e.message}); }
}
