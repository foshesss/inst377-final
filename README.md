# Testudo Website Redesign
This redesign involves the creation of two pages:
- https://foshesss.github.io/inst377-final/ (index page)
- https://foshesss.github.io/inst377-final/course-registration.html (classes page)

- Description of target browsers (iOS? Android? Which ones? Which versions?)
The goal is that every browser is supported with the design, so you should be able to load
the website on any device without a problem.

## Description of your project:

- What API did you use, link to the API

umd.io - Collecting class information

- What visualisations does your project drive?

Leaflet - Used for maps of sections on campus

- What visualisation or other JS libraries does your project use?

Leaflet was the only library that was used for visualizations. However, 'cheerio' was used to web-scrape building IDs. Building IDs were used to determine where sections are located on a map.

- What CSS frameworks did you use? What version of them?

No CSS frameworks were used in this project.

- What is your actual project trying to display and solve?

This project is attempting to recreate Testudo-- harnessing a more intuitive design. I wanted to make sure that the website was not confusing for first-time viewers.

- Additional comments

Using localStorage, it's possible to save search queries. If a user was to search up a class, once they return to the page (if they left), they'd have the same query loaded in-- the page would be identical to how it was when they left.
