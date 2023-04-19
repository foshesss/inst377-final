const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'temp.html');

const f = async () => {
    const dom = await JSDOM.fromURL(url);
    const links = [...dom.window.document.querySelectorAll('a')]
        .map(link => link.href);

    fs.writeFile(filePath, JSON.stringify(links), err => {
        if (err) throw err;
        console.log(`All links from ${url} have been saved in ${filePath}`);
    });
}


const create_buttons = (title, links_map) => {
    // convert links_map to an array
    const links = []


    Object.keys(links_map).forEach(key => {
        const value = links_map[key]
        value.unshift(key) // add key to array
        links.push(value)
    })

    // sort based on priority (smallest -> greatest)
    // smaller priority means closer to top of list
    links.sort(([,, prio0], [,, prio1]) => prio1 - prio0)

    return `<div>
        <button>
            <h1>${title}</h1>
            <p></p>
        </button>
        <div>
            <h1>Explore this section</h1>
            <ul>${
                    links.reduceRight((l, [name, link]) => 
                        l + `\n<li>\n<a href="${link}">${name}</a>\n</li>`, ""
                    )
                }
            </ul>
        </div>
    </div>`
}

let html = ""
const links = require("./links.json")
Object.keys(links).forEach(
    section => html += create_buttons(section, links[section])
)

fs.writeFile("derp.html", html, function (err) {
    if (err) throw err;
    console.log("File is saved successfully.");
});