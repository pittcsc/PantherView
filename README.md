# PantherView
Pitt Computer Science Club spring semester (16-17) project with the Western Pennsylvania Regional Data Center (@wprdc) Open Data.

![Logo; credit: @alexandrabush](./logo.png)

Thanks to @alexandrabush for the logo!

---

## Installing and running:
Since our project is just an HTML file, you can simply load the file into your browser.  
Once you make edits, commit the changes, and push, your changes will be updated on GitHub.

## Including in an external Site:
In order to include this project in an existing HTML page you will need to first download the `main.css`, `ui.js`, `map.js`, and `data.js` files (we don't yet have them on a CDN). Then, you will need to add
```
<!-- necessary style -->
<link rel="stylesheet" href="./main.css">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.2/dist/leaflet.css" />
<script src="https://use.fontawesome.com/07694042f8.js"></script>
<script src="https://unpkg.com/leaflet@1.0.2/dist/leaflet.js"></script>
<!-- end necessary style -->
```
to the `head` tag, as well as
```
<!-- necessary HTML -->
<div id="ui"></div>
<div id="mapid"></div>
<script src="./ui.js"></script>
<script src="./map.js"></script>
<script src="./data.js"></script>
<!-- end necessary HTML -->
```
somewhere in the `body`.

In order to turn on or off default checkboxes, open up `map.js`, CTRL+F 'DEFAULT_CHECKS', and change a value to `false` to turn it off by default and `true` to turn it on by default.

## Getting started:
1. Fork the project
2. Add your name to `contributors.md`
3. Submit a pull request
4. Take a look at the Issues for more things to do

## Helpful links:

### Git and Github links:
- [Git tutorials](https://www.atlassian.com/git/tutorials/)
- [Guide to using GitHub](https://guides.github.com/)
- [Git documentation](https://git-scm.com/doc)
- [GitHub repository for the project](https://github.com/Pitt-CSC/club_project_2017)
- [Guide to writing markdown (for documentation)](https://guides.github.com/features/mastering-markdown/)
- [CSC Git Wiki](https://github.com/Pitt-CSC/learn-git/wiki)

### HTML, CSS, and JavaScript links:
- [MDN Introduction to HTML](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Introduction)
- [MDN HTML reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference)
- [MDN Introduction to CSS](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started)
- [MDN CSS reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference)
- [Codecademy course on HTML and CSS](https://www.codecademy.com/learn/web)
- [MDN Introduction to JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction)
- [MDN _re-introduction_ to JS](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)
- [Codecademy course on JavaScript](https://www.codecademy.com/learn/javascript)

### Open Data links:
- [What is Open Data, and why you should care](http://www.govtech.com/data/Got-Data-Make-it-Open-Data-with-These-Tips.html)
- [The West Pennsylvania Regional Data Center](http://www.wprdc.org/)

### Map Links:
- [Leaflet](http://leafletjs.com/)
- [OpenStreetMap](http://osm.org/)
