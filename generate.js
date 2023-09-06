/**
 * Generate full JSON with all countries, continents and cities
 */

/** @link https://github.com/lutangar/cities.json/blob/master/cities.json */
const cities = require('./cities.json');
/** @link https://github.com/annexare/Countries/blob/main/packages/countries/src/data/countries.ts */
const countries = require('./countries.json');
const continents = require('./continents.json');

const index = {};
const items = [];

cities.forEach(city => {
  const code = city.country;
  if (!index[code]) {
    const data = countries[code];
    let continent = items.find(item => item.alias === data.continent);

    if (!continent) {
      continent = {
        alias: data.continent,
        value: continents[data.continent],
        children: [],
      };
      items.push(continent);
    }

    const country = {
      alias: code,
      value: data.name,
      children: [],
    };

    continent.children.push(country);
    index[code] = country;
  }

  index[code].children.push({
    value: city.name,
  });
});

console.log(JSON.stringify({ items }, null, 2));
