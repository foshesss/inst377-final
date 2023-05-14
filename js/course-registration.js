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
    departments = await fetch("data/departments.json");
    departments = await departments.json();

    courses = await fetch("data/courses.json");
    courses = await courses.json();

    sections = await fetch("data/sections.json");
    sections = await sections.json();

    course_ids = await fetch("data/course_ids.json");
    course_ids = await course_ids.json();

    buildings = await fetch("data/buildings.json");
    buildings = await buildings.json();    
}

// used to contruct the 'sections' html
const get_course_sections_html = course_id => {
    const course_sections = courses[course_id].sections;
    if (course_sections === undefined) return "";

    let html = ""

    course_sections.sort()
    course_sections.forEach(section_id => {
        const section_info = sections[section_id];
        const instructor = section_info.instructors[0] || "TBA";

        html += `
            <div>
                <div class="course-section-number">
                    <p class="actual-section-number">${section_info.number}</p>
                    <p>(Open seats: ${section_info.open_seats})</p>
                </div>

                ${
                    section_info.meetings.reduce((prev, section_info) => {
                        return prev + `
                            <div class="course-section">
                                <p>${section_info.classtype === "" ? "Lecture" : section_info.classtype}</p>
                                <div>
                                    <p>${section_info.days} ${section_info.start_time}-${section_info.end_time}</p>
                                    <p>${section_info.building} ${section_info.room}</p>
                                </div>
                            </div>
                      `
                    }, "")

                }
                <div>
                    <p>Instructor: ${instructor}</p>
                </div>
            </div>
        `
    })

    return html
}

const create_list_elem = id => {
    const info = courses[id]
    const {name, description, credits} = courses[id]
    
    return `
    <li class="class" id="class${id}">
        <input type="checkbox" id="${id}-label" class="class-toggle">
        <label class="class-label" for="${id}-label">
            <div>
                <span class="class-label-id">${id}</span>
                <br>
                <span class="class-label-name">${name}</span>
            </div>
            <img src="images/arrow.png" alt="">
        </label>

        <div hidden>
            <div class="course-profile">
                <div>
                    <h1 class="course-profile-header">Course Profile</h1>
                    <p class="course-description">${description}</p>
                </div>

                <div class="course-sections">
                    ${get_course_sections_html(id)}
                </div>
                <p class="course-credits">Credits: ${credits}</p>
            </div>
        </div>
        <hr>
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
    const class_code = class_div.id.split("-")[0];

    const class_container = document.getElementById("class" + class_code);
    const method = class_container .classList.contains("class-toggled") ? "remove" : "add";
    class_container .classList[method]("class-toggled");

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

    map_elem.classList.add("map");
    L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
}

const main = async() => {

    // load all classes
    await retrieve_classes();

    // class_info and department_info are now available
    document.getElementById("unloaded").style.display = "none";

    const loaded_elem = document.getElementById("loaded")
    loaded_elem.style.display = "block";

    document.getElementById("filter-departments").innerHTML = create_departments_checkboxes()

    const filter_form = document.getElementById("filter-menu")
    const inputs = Array.from(filter_form.getElementsByTagName("input"));
    const selects = Array.from(filter_form.getElementsByTagName("select"));
    // const clear_filter_button = document.getElementById("clear-filter-button")

    // clear_filter_button.addEventListener("click", () => {
    //     // clear inputs
    //     inputs.forEach(input => {
    //         if (input.classList.contains("toggle") || input == clear_filter_button) return
            
    //         input.value = "";
    //         input.checked = false;
    //     })

    //     // clear selects
    //     selects.forEach(select => {
    //         select.selectedIndex = 0;
    //     })
    // })

    const search_results = document.getElementById("results")

    // dynamic search bar
    const search_bar = document.getElementById("search-bar");
    const make_search = (result) => {
        if (result.length === 0) {
            // hide results. nothing to filter here
            localStorage.clear()
            // search_results.innerHTML = ""
            // return;
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
    }

    search_bar.addEventListener("input", () => {
        let result = search_bar.value.toLowerCase();
        localStorage.setItem("last-query", result);
        make_search(result);
    });

    const last_query = localStorage.getItem("last-query")

    if (last_query) {
        search_bar.value = last_query
        make_search(last_query)
    }

    make_search("")

    const toggle_filter_form = (turn_on) => {
        if (turn_on) {
            loaded_elem.style.overflow = "hidden";
            loaded_elem.style.height = "100vh";
        } else {
            filter_form.style.display = "none";
            loaded_elem.style.overflow = "auto";
            loaded_elem.style.height = "none";
        }
    }

    // mobile form menu stuff
    filter_form.style.display = "none";
    
    document.addEventListener("click", function(event) {
        if (!filter_form.contains(event.target) && filter_form.style.display != "none") {
            event.preventDefault()
            toggle_filter_form(false);
        }
    });
}

document.addEventListener("DOMContentLoaded", main);
