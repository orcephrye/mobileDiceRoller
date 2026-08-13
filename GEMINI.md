# Project Context: [mobileDiceRoller]

This is a simple dice rolling app that utilizes a RESTful API to get dice rolling results back. It is menat to be used 
with TTRPGs like Dungeon and Dragons, Starfinder, and d20FuturePath. 

The frontend is meant to look like a calculator and behavior similar to one. 


## Tech Stack
* HTML with Bootstrap CSS and fontawesome
* Javascript with AJax, JQuery, and Bootstrap JS

## Testing/Self hosting
There is a file called SimpleHTTPServer.py that uses Python to host the mobile app locally for manual testing.
* When editing HTML use: > npx htmlhint filename.html
* When editing CSS use: > npx stylelint --fix filename.css
* When editing JavaScript use: > node jslint.mjs filename.js

## Project Structure
* All the HTML is located in mRoller.html
* All the CSS is located in libs/style.css
* All the Javascript is located in libs/app.js

# Active Tasks
* We need to look into fixing issues with styling/linting. 
* I would like to move some of the layout around.
* Support more themes imported from the FuturePathAPI project