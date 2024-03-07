const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const font = fs.readFileSync(`${__dirname}/../client/Fortnite/fortnite/fortnite.otf`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

const getFont = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'font/otf' });
  response.write(font);
  response.end();
};

module.exports = {
  getIndex,
  getCSS,
  getFont,
};
