// due to how long it takes to retrieve all classes,
// i made the decision to save them all locally inside of the repo.

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

const fs = require("fs");

const write_to_file = (filename, data) => {
    fs.writeFile(filename, JSON.stringify(data, null, 2), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}



const retrieve_classes = async () => {

    // fill buildings
    write_to_file("buildings.json", await(retrieve_info("map/buildings")))

    // fill courses
    // let i = 1;
    // while (true) {
    //     const response = await retrieve_info("courses", {
    //         semester: `${202308}`, // docs are incorrect-- cannot provide a |geq operator
    //         page: i,
    //         per_page: 100, // max per page
    //     });
    
    //     console.log(i)

    //     // breaks out once there are no more classes to search for
    //     if (response.length === 0) break;

    //     // set up lookup dictionaries later
    //     response.forEach(course => {
    //         const {dept_id, department, course_id} = course;
    //         departments[dept_id] = department;
    //         courses[course_id] = course;
    //         course_ids.add(course_id);
    //     })

    //     i += 1
    // }

    //     // convert to an array and sort
    // // this allows usage of array methods
    // course_ids = Array.from(course_ids)
    // course_ids.sort();

    // write_to_file("departments.json", departments)
    // write_to_file("courses.json", courses)
    // write_to_file("course_ids.json", course_ids)


    // fill sections
    // i = 1;
    // while (true) {
    //     const response = await retrieve_info("courses/sections", {
    //         semester: `${202308}`,
    //         page: i,
    //         per_page: 100, // max per page
    //     });
    
    //     console.log(i)

    //     // breaks out once there are no more classes to search for
    //     if (response.length === 0) break;

    //     // set up lookup dictionaries later
    //     response.forEach(section => {
    //         const {section_id} = section;
    //         sections[section_id] = section
    //     })

    //     i += 1
    // }

    // write_to_file("sections.json", sections)
}

retrieve_classes();