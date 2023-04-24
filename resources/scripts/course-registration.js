const API_DOMAIN = "https://api.umd.io/v1/";

// gets current date in YYYYMM format-- this is used for
// retrieving information for any present and future semester
const CURR_DATE = new Date().toISOString().slice(0, 7).replace('-', '');
const DEBUG = true;

// generalizes API calls
const retrieve_info = async (endpoint, params = {}) => {
    params = new URLSearchParams(params)

    // retrieve it all
    const response = await fetch(API_DOMAIN + endpoint + '?' + params);
    return await response.json();
}

// preload all available departments and classes from the jump
// wish there was a better way to go about this without hardcoding
// every department

let departments = {}; // determined while pulling for all class data
let courses = {}; // determined while pulling for all class data
let sections = {};
let course_ids = new Set(); // used for filtering later.

const retrieve_classes = async () => {
    departments = await fetch("resources/info/departments.json");
    departments = await departments.json();

    courses = await fetch("resources/info/courses.json");
    courses = await courses.json();

    sections = await fetch("resources/info/sections.json");
    sections = await sections.json();

    course_ids = await fetch("resources/info/course_ids.json");
    course_ids = await course_ids.json();
}

const create_list_elem = (id) => {
    const {name, description} = courses[id]
    return `
    <li class="class">
        <h1>${id}</h1>
        <h3>${name}</h3>
        <p>${description}</p>
    </li>
    <hr>
    `
}

const main = async() => {

    // load all classes
    await retrieve_classes();

    console.log(courses)

    // class_info and department_info are now available
    document.getElementById("unloaded").style.display = "none";
    document.getElementById("loaded").style.display = "block";

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

        // display as a unordered list
        search_results.innerHTML = 
            `<ul>${result.reduce((acc, item) => `${acc}${create_list_elem(item)}`, '')}</ul>`;
    });
}

document.addEventListener("DOMContentLoaded", main);
