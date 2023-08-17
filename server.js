/**
 * Runs on port 2345 and serves `/labels` endpoint to return continents, countries and cities.
 * Requested level of data is determined by `path` array query string parameter.
 * `/labels` will return all continents
 * `/labels?path=EU` will return all European countries
 * `/labels?path=EU&path=DE` will return all German cities
 * Format of labels: { alias?: string, value: string, isLeaf?: boolean }
 */

const http = require('http');
/** @link https://github.com/lutangar/cities.json/blob/master/cities.json */
const cities = require('./cities.json');
/** @link https://github.com/annexare/Countries/blob/main/packages/countries/src/data/countries.ts */
const countries = require('./countries.json');
const continents = require('./continents.json');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  const url = req.url.split('?')[0]

  switch (url) {
    case '/countries': {
      const allCountries = Object.entries(countries).map(([code, data]) => ({
        alias: code,
        value: data.name,
        isLeaf: false,
      }));

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(allCountries));

      break;
    }
    case '/labels': {
      // get country code from query string
      const query = new URLSearchParams(req.url.split('?')[1]);
      const path = query.getAll('path');
      let responseData;

      if (!path?.length) {
        // just list of all continents
        responseData = Object.entries(continents)
          .map(([alias, value]) => ({ alias, value, isLeaf: false }));
      } else if (path.length === 1) {
        // list of countries in continent, search by continent code or name
        responseData = Object.entries(countries)
          .filter(([code, data]) => data.continent === path[0] || continents[data.continent] === path[0])
          .map(([code, data]) => ({ alias: code, value: data.name, isLeaf: false }));
      } else {
        const countryNameOrCode = path[1];
        const country = Object.entries(countries)
          .find(([code, data]) => code === countryNameOrCode || data.name === countryNameOrCode)
          ?.[0];

        if (!country) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(404);
          res.end('Not Found ' + JSON.stringify({ search: req.url.split('?')[1], query, countryNameOrCode, country }));
          return;
        }

        const citiesInCountry = cities
          .filter(city => city.country === country)
          // remove duplicates, because there are some in the list
          .filter((city, index, cities) => cities.findIndex(c => c.name === city.name) === index)
          .map(city => ({ value: city.name }));

        responseData = citiesInCountry;
      }

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(responseData));

      break;
    }
    default:
      res.writeHead(404);
      res.end('Not Found, check /labels');
  }
});

const port = 2345;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
