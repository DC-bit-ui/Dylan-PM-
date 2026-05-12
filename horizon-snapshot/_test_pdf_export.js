// End-to-end PDF export test — full 12 pages with realistic display:none state.
// Mimics what the frontend actually sends after navigating to a single page.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const inlineCSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{margin:0;padding:0;background:#fff;font-family:Inter,sans-serif}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;background:#fff;page-break-after:always;box-shadow:none!important}
.page-tpl{background-size:100% 100%;background-repeat:no-repeat;background-position:center}
.page-wrapper{width:210mm;margin:0;display:block!important}
.cover-name-overlay{position:absolute;top:55.5%;left:51.8%;width:28%;height:5.7%;background:#F1F5F6;color:#002E34;font-weight:700;font-size:13px;display:flex;align-items:center;text-transform:uppercase}
.p2-summary-overlay{position:absolute;top:70.7%;left:7.33%;width:85.34%;height:23%;background:#FFF;color:#0F2424;font-size:12px;line-height:1.55;overflow:hidden}
.p4-name-overlay{position:absolute;top:42%;left:4%;width:55%;height:4%;background:#002E34;color:#95C795;font-weight:800;font-size:18px;display:flex;align-items:center;text-transform:uppercase}
.p6-price-overlay{position:absolute;background:#FFF;color:#1F3A2D;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center}
.p6-price-1{top:28.5%;left:75%;width:18%;height:4%}
.p6-price-2{top:60%;left:75%;width:18%;height:5%}
`;

// Simulate showPage() output: 11 of 12 pages have inline display:none.
// The fix should override these with display:block !important so all pages render.
function pageWrapper(n, visible, body = '') {
  const display = visible ? '' : 'style="display: none;"';
  return `<div class="page-wrapper" data-page="${n}" ${display}><div class="page page-tpl" style="background-image:url('/templates/template_page_${String(n).padStart(2,'0')}.png')">${body}</div></div>`;
}

let pages = '';
for (let i = 1; i <= 12; i++) {
  let body = '';
  if (i === 1) body = '<div class="cover-name-overlay">DAWLISH ROAD</div>';
  else if (i === 2) body = '<div class="p2-summary-overlay"><strong>HORIZON Summary:</strong> Test narrative for full export.</div>';
  else if (i === 4) body = '<div class="p4-name-overlay">DAWLISH ROAD</div>';
  else if (i === 6) body = '<div class="p6-price-overlay p6-price-1">$5,000</div><div class="p6-price-overlay p6-price-2">416 ACCUs</div>';
  pages += pageWrapper(i, i === 5, body); // page 5 visible, others hidden
}

const fullHtml = `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>${inlineCSS}</style>
</head><body>${pages}</body></html>`;

const body = JSON.stringify({ html: fullHtml, filename: 'pdf_test_full12.pdf' });

const req = http.request({
  hostname: '127.0.0.1', port: PORT, path: '/api/export-pdf', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, (res) => {
  console.log('HTTP status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  const chunks = [];
  res.on('data', c => chunks.push(c));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    if (res.statusCode !== 200) { console.error('FAIL:', buf.toString().slice(0, 500)); process.exit(1); }
    const magic = buf.slice(0, 4).toString();
    if (magic !== '%PDF') { console.error('FAIL — not a PDF, got:', magic); process.exit(1); }
    console.log('PDF size:', (buf.length / 1024).toFixed(1), 'KB');
    const outPath = path.join(__dirname, 'output', 'pdf_test_full12.pdf');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    const pageMatches = buf.toString('binary').match(/\/Type\s*\/Page[^s]/g);
    const pageCount = pageMatches ? pageMatches.length : 0;
    console.log('PDF page count:', pageCount);
    if (pageCount !== 12) { console.error('FAIL — expected 12 pages, got ' + pageCount); process.exit(1); }
    console.log('PASS — 12-page PDF generated despite 11 inline display:none divs in input');
    console.log('Output:', outPath);
  });
});
req.on('error', (e) => { console.error('Request error:', e.message); process.exit(1); });
req.write(body);
req.end();
