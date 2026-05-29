const fs = require('fs');
const path = require('path');
const https = require('https');

const menuImages = {
  'somsa-london.jpg': 'https://thefoodhog.com/wp-content/uploads/2021/01/uzbek-samsa.jpg',
  'achichuk-london.jpg': 'https://uzbekparty.com/wp-content/uploads/2024/02/ACHICHUK-SALAD-1.jpg',
  'obi-non-london.jpg': 'https://tasteofartisan.com/wp-content/uploads/2021/06/Uzbek-bread-obi-non-lepeshka-in-the-oven-crispy.jpg',
  'borsch-london.jpg': 'https://media.houseandgarden.co.uk/photos/6189406cd9ae96d083cd0d7a/1:1/w_1500,h_1500,c_limit/20180621_saltandtime_day4_borsch_040.jpg',
  'lagman-london.jpg': 'https://www.allrecipes.com/thmb/kACQLfnolBRCJulZAdKOlRiJhpQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Lagman-Uzbek-Noodle-Soup-07-2000-0ee85d31c9824951a37340832d25dafe.jpg',
  'manti-london.jpg': 'https://cannedexperience.com/wp-content/uploads/2025/01/manti-served-in-a-black-bowl1-scaled-1920x1920.jpeg',
  'shashlik-lamb-london.jpg': 'https://petersfoodadventures.com/wp-content/uploads/2017/02/shashlik-recipes.jpg',
  'shashlik-chicken-london.jpg': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1200&q=80',
  'shashlik-platter-london.jpg': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
  'uzbek-tea-london.jpg': 'https://i.etsystatic.com/62796786/r/il/eddaca/7906206501/il_fullxfull.7906206501_2a5a.jpg',
  'chak-chak-london.jpg': 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=1200&q=80'
};

const outputDir = path.resolve(__dirname, '../public/images/menu');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy local high-res plov image first
try {
  const localPlovSrc = path.resolve(__dirname, '../public/og-image.png');
  const localPlovDest = path.join(outputDir, 'plov-london.jpg');
  if (fs.existsSync(localPlovSrc)) {
    fs.copyFileSync(localPlovSrc, localPlovDest);
    console.log('Successfully self-hosted plov-london.jpg from local premium OG asset.');
  }
} catch (err) {
  console.error('Could not copy local plov image:', err);
}

// Download external images
Object.entries(menuImages).forEach(([filename, url]) => {
  const destPath = path.join(outputDir, filename);
  
  const file = fs.createWriteStream(destPath);
  
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302) {
      // Handle simple redirect
      https.get(response.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
        res2.pipe(file);
      });
    } else {
      response.pipe(file);
    }
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded: ${filename}`);
    });
  }).on('error', (err) => {
    fs.unlink(destPath, () => {});
    console.error(`Failed to download ${filename}: ${err.message}`);
  });
});
