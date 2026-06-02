# Project Context: [mobileDiceRoller]

This is a simple dice rolling app that utilizes a RESTful API to get dice rolling results back. It is menat to be used 
with TTRPGs like Dungeon and Dragons, Starfinder, and d20FuturePath. 

The frontend is meant to look like a calculator and behavior similar to one. 


## Tech Stack
* HTML with Bootstrap CSS and fontawesome
* Javascript with AJax, JQuery, and Bootstrap JS

## Testing/Self hosting
There is a file called SimpleHTTPServer.py that uses Python to host the mobile app locally for manual testing.

## Project Structure
* All the HTML is located in mRoller.html
* All the CSS is located in libs/style.css
* All the Javascript is located in libs/app.js

# Active Tasks
This app is extremely ad-hoc and doesn't have any style/linting or unit testing. It also hasn't been updated in a while.
We need to first look at making sure it is using the latest versions the different libs like Boostrap, fontawsome, jquery.
We should look at areas of improvment, make sure there is nothing that could make this code vulnerable when run in a deployed setting.
We should then add some amount of style/linting and testing. 