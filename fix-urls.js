const fs = require('fs');
const path = require('path');

const replacementURL = "window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://m1p13mean-marcello-fitahiana-backen.vercel.app'";

function replaceUrlsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace inside template literals, e.g. `http://localhost:3000/api/v1/...`
    // We'll replace `http://localhost:3000` with `${window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://m1p13mean-marcello-fitahiana-backen.vercel.app'}`
    content = content.replace(/`http:\/\/localhost:3000(\/.*?)`/g, function (match, path) {
        return "`${" + replacementURL + "}" + path + "`";
    });

    // Replace inside normal string literals, e.g. 'http://localhost:3000/api/v1/...'
    // We'll replace 'http://localhost:3000/...' with (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://m1p13mean-marcello-fitahiana-backen.vercel.app') + '/...'
    content = content.replace(/'http:\/\/localhost:3000(\/.*?)'/g, function (match, path) {
        return "(" + replacementURL + ") + '" + path + "'";
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            replaceUrlsInFile(fullPath);
        }
    }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Done replacing URLs');
