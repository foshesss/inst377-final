let departments = {}; // determined while pulling for all class data
let courses = {}; // determined while pulling for all class data
let sections = {};
let course_ids = new Set(); // used for filtering later.
let buildings = [];


// unfortunately, API calls had to be done beforehand. all information
// for constant information, like class name and code have already
// been pulled

// this pulls the json information that was retrieved from the API
const retrieve_classes = async () => {
    departments = await fetch("resources/info/departments.json");
    departments = await departments.json();

    courses = await fetch("resources/info/courses.json");
    courses = await courses.json();

    sections = await fetch("resources/info/sections.json");
    sections = await sections.json();

    course_ids = await fetch("resources/info/course_ids.json");
    course_ids = await course_ids.json();

    buildings = await fetch("resources/info/buildings.json");
    buildings = await buildings.json();
}

const create_list_elem = (id) => {
    const {name, description} = courses[id]
    return `
    <li class="class" id="class${id}">
        <input type="checkbox" id="${id}-label" class="class-toggle">
        <label class="class-label" for="${id}-label">
            <div>
                <span class="class-label-id">${id}</span>
                <br>
                <span class="class-label-name">${name}</span>
            </div>
            <img src="resources/images/downarrow.png" alt="">
        </label>

        <div hidden>
            <hr>
            <p>${description}</p>
            <div id="map${id}"></div>
        </div>
    </li>
    `
}

// least reusable code of all time
const create_departments_checkboxes = () => {
    return Object.entries(departments).reduce((acc, [key, value]) => 
        acc + `
        <div>
            <input type="checkbox" id=${key} name=${key} value=${key}>
            <label for=${key}>${key}</label>
        </div>
        `
    , "")
}

const toggle_sections = (class_div) => {

    // assume we find this
    const class_code = class_div.id.split("-")[0];;
    const map_elem = document.getElementById("map" + class_code);

    // map already initialized
    if (map_elem.classList.contains("map")) return;
    
    // place map on top of college park
    const map = L.map(map_elem, {
        center: [38.9875, -76.9424],
        minZoom: 14.25,
        // maxZoom: 14.25,
        zoom: 14.25
    });

    // add tile layer herp derp
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // add in sections for class
    const class_info = courses[class_code];
    const class_sections = class_info.sections.map(e => sections[e])

    class_sections.forEach(s => {
        s?.meetings.forEach(({building}) => {
            const building_info = buildings[building];
            if (!building_info) return;
    
            L.marker([building_info.lat, building_info.long]).addTo(map);
        })
    })

    map_elem.classList.add("map")

    L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
}

const main = async() => {

    // load all classes
    await retrieve_classes();

    // class_info and department_info are now available
    document.getElementById("unloaded").style.display = "none";
    document.getElementById("loaded").style.display = "block";

    document.getElementById("departments").innerHTML = create_departments_checkboxes()

    const filter_form = document.getElementById("filter-form")
    const inputs = Array.from(filter_form.getElementsByTagName("input"));
    const selects = Array.from(filter_form.getElementsByTagName("select"));
    const clear_filter_button = document.getElementById("clear-filter-button")

    clear_filter_button.addEventListener("click", () => {
        // clear inputs
        inputs.forEach(input => {
            if (input.classList.contains("toggle") || input == clear_filter_button) return
            
            input.value = "";
            input.checked = false;
        })

        // clear selects
        selects.forEach(select => {
            select.selectedIndex = 0;
        })
    })

    const search_results = document.getElementById("results")

    // dynamic search bar
    const search_bar = document.getElementById("searchbar");
    search_bar.addEventListener("input", () => {
        let result = search_bar.value.toLowerCase();
        if (result.length === 0) {
            // hide results. nothing to filter here
            search_results.innerHTML = ""
            return;
        }

        // only do starts with when it's one letter (or else we'd get)
        // pretty much everything in the array
        const method = result.length === 1 ? "startsWith" : "includes";

        // filter this mofo
        result = course_ids.filter(id => {
            let {name} = courses[id];
            name = name.toLowerCase();
            id = id.toLowerCase();
            return id[method](result) || name[method](result)
        })

        result = result.slice(0, 100);

        // display as a unordered list
        search_results.innerHTML = 
            `<ul>${result.reduce((acc, item) => `${acc}${create_list_elem(item)}`, '')}</ul>`;
        
        Array.from(search_results.getElementsByClassName("class-toggle"))
            .forEach(toggle => {
                toggle.addEventListener("click", () => {
                    toggle_sections(toggle)
                })
            }
        )
    });
}

document.addEventListener("DOMContentLoaded", main);
