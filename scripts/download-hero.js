const fs = require('fs');
const path = require('path');
const https = require('https');

const url = 'https://www.allrecipes.com/thmb/m6YXFp58z7PofDxNbHx_QEsni0E=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/4580553-2998dabe4f724ab79011677bad29a5c7.jpg';
const destPath = path.resolve(__dirname, '../public/images/hero-plov.jpg');

const dir = path.dirname(destPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const file = fs.createWriteStream(destPath);

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
  if (response.statusCode === 301 || response.statusCode === 302) {
    https.get(response.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
      res2.pipe(file);
    });
  } else {
    response.pipe(file);
  }
  
  file.on('finish', () => {
    file.close();
    console.log('Successfully downloaded: hero-plov.jpg');
  });
}).on('error', (err) => {
  fs.unlink(destPath, () => {});
  console.error(`Failed to download: ${err.message}`);
});
