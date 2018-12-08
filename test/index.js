const path = require('path');

const diffDenpendencies = require('../index');

const oldFolder = path.join(__dirname, 'old');
const newFolder = path.join(__dirname, 'new');

console.log(diffDenpendencies(oldFolder, newFolder));
