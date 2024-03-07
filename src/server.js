// server
const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/fortnite.otf': htmlHandler.getFont,
    '/lastSeen': jsonHandler.getCosmetics,
    '/itemShop': jsonHandler.getCosmetics,
    notFound: jsonHandler.notFound,
  },
  HEAD: {
    notFound: jsonHandler.notFoundMeta,
  },
  POST: {
    '/addCosmetic': jsonHandler.addCosmetics,
  },
};

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    handler(request, response, bodyParams);
  });
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addCosmetic') {
    parseBody(request, response, jsonHandler.addCosmetics);
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  if (request.method === 'POST') {
    return handlePost(request, response, parsedUrl);
  }

  if (!urlStruct[request.method]) {
    return urlStruct.HEAD.notFound(request, response);
  }

  if (urlStruct[request.method][parsedUrl.pathname]) {
    return urlStruct[request.method][parsedUrl.pathname](request, response);
  }

  return urlStruct[request.method].notFound(request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});
