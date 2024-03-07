const COSMETIC_URL = 'https://fortnite-api.com/v2/cosmetics/br/search';
const SHOP_URL = 'https://fortnite-api.com/v2/shop/br';
// const API_KEY = '96539bc8-c74b-4be1-a6c1-49dc1ece65fb';

const cosmetics = {};

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.end();
};

const getCosmetics = (request, response) => fetch(SHOP_URL).then((shopResponse) => shopResponse.json().then((shopObj) => {
  for (const key in cosmetics) {
    const cosmetic = cosmetics[key];
    let found = false;
    shopObj.data.featured.entries.forEach((bundle) => {
      bundle.items.forEach((item) => {
        if (item.name === cosmetic.name) {
          found = true;
        }
      });
    });
    cosmetics[key].inShop = found;
  }

  const responseJSON = {
    cosmetics,
  };

  return respondJSON(request, response, 200, responseJSON);
}));

const getCosmeticsMeta = (request, response) => respondJSONMeta(request, response, 200);

const addCosmetics = (request, response, body) => {
  const responseJSON = {
    message: 'Cosmetic name is required.',
  };

  if (!body.name) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // https://www.geeksforgeeks.org/how-to-use-the-javascript-fetch-api-to-get-data/
  // Check against the search and return if the cosmetic isn't found.
  // name to check = "Gohan's Cape"
  return fetch(`${COSMETIC_URL}/?name=${body.name}`).then((apiResponse) => fetch(SHOP_URL).then((shopResponse) => {
    if (apiResponse.status !== 200) {
      responseJSON.message = 'Cosmetic not found';
      responseJSON.id = 'missingParams';
      return respondJSON(request, response, 400, responseJSON);
    }

    let responseCode = 204;

    // here's what to do now: make responseJSON a message to the jsObj and handle the data.
    return apiResponse.json().then((jsObj) => shopResponse.json().then((shopObj) => {
      if (!cosmetics[body.name]) {
        responseCode = 201;
        cosmetics[body.name] = {};
      }
      const lsString = jsObj.data.shopHistory[jsObj.data.shopHistory.length - 1].substring(0, 10);
      cosmetics[body.name].name = body.name;
      cosmetics[body.name].data = jsObj;
      cosmetics[body.name].image = jsObj.data.images.icon;
      cosmetics[body.name].lastSeen = lsString;

      shopObj.data.featured.entries.forEach((bundle) => {
        bundle.items.forEach((item) => {
          if (item.name === body.name) {
            cosmetics[body.name].inShop = true;
          } else {
            cosmetics[body.name].inShop = false;
          }
        });
      });

      if (responseCode === 201) {
        cosmetics[body.name].message = `${body.name} added to Wishlist`;
        return respondJSON(request, response, responseCode, cosmetics[body.name]);
      }

      return respondJSONMeta(request, response, responseCode);
    }));
  }));
};

const updateCosmetics = (request, response) => {
  const newUser = {
    createdAt: Date.now(),
  };

  cosmetics[newUser] = newUser;

  return respondJSON(request, response, 201, newUser);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => {
  respondJSONMeta(request, response, 404);
};

module.exports = {
  getCosmetics,
  getCosmeticsMeta,
  updateCosmetics,
  addCosmetics,
  notFound,
  notFoundMeta,
};
