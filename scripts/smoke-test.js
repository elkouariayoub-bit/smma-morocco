const http = require('http');
const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/composer',
  'http://localhost:3000/queue',
  'http://localhost:3000/drafts',
  'http://localhost:3000/analytics'
];

function check(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const { statusCode } = res;
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { if (body.length < 2000) body += chunk; });
      res.on('end', () => resolve({ url, statusCode, snippet: body.slice(0, 1200) }));
    });
    req.on('error', (err) => resolve({ url, error: String(err) }));
    req.setTimeout(5000, () => { req.abort(); resolve({ url, error: 'timeout' }); });
  });
}

(async () => {
  for (const u of urls) {
    const r = await check(u);
    console.log('---', u, '---');
    if (r.error) console.log('ERROR:', r.error);
    else console.log('status:', r.statusCode, '\n', r.snippet.slice(0,400).replace(/\n/g,'\n'));
  }
})();
