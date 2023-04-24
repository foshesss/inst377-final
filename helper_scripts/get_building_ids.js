// the api i used only includes **SOME** building ids.
// i had to find a website that included the website ids and then
// web scrape them and create a dict.

// this is what i did. it's ass but gets what i need

const URL = "https://www.campus-maps.com/umd/"

const cheerio = require("cheerio")
const fs = require("fs");

const write_to_file = (filename, data) => {
    fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}

const get_building_ids = async () => {

    const buildings = require("../resources/info/buildings.json");

    const response = await fetch(URL);
    const html = await response.text();

    const doc = cheerio.load(html);
    const td_elems = doc("td");

    const text = [];

    td_elems.each((_, td) => {
      const anchor_tags = doc(td).find('a');
      anchor_tags.each((_, a) => {
        text.push(doc(a).text());
      });
    });

    const building_lookup = {};

    text.forEach(str => {
        // get name
        const name_regex = /^[^(]+/;
        const name = str.match(name_regex)[0].trim();

        // get id
        let building_id = str.match(/\(([^)]+)\)$/);

        // if both appear, add to lookup dict
        if (name && building_id) {
            const building_info = buildings.find(e => e.name === name || e.name === name.replace("The ", ""));
            if (!building_info) return;

            building_id = building_id[1].trim();
            building_lookup[building_id] = building_info;
        }
    })

    write_to_file("buildings.json", building_lookup)
}

get_building_ids();
