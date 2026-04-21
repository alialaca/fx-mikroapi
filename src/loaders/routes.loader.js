const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '..', 'modules');

const folderToPrefix = (folder) => '/' + folder.replace(/_/g, '-');

module.exports = (app) => {
    const modules = fs.readdirSync(MODULES_DIR, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

    for (const moduleName of modules) {
        const routeFile = path.join(MODULES_DIR, moduleName, `${moduleName}.route.js`);
        if (!fs.existsSync(routeFile)) continue;

        app.use(folderToPrefix(moduleName), require(routeFile));
    }
};
