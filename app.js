/*
 * This file is provided for custom JavaScript logic that your HTML files might need.
 * Maqetta includes this JavaScript file by default within HTML pages authored in Maqetta.
 */
require(["dojo/ready"], function(ready){
     ready(function(){
         // logic that requires that Dojo is fully initialized should go here

     });
});

function success(data) {
    document.getElementById("diceOutput").innerHTML = "Rolls: " + data['rolls'] + " = " + data['total'];
}

function getMethod(apiCall) {
$.ajax({
  type: 'GET',
  url: apiCall,
  async: false,
  dataType: 'json',
  success: success
});
}

function myFunction() {
    var text;
    var fullURL = "http://api.d20futurepath.com/tasks/roll/"
    var apiCall

    text = document.getElementById("diceInput").value;
    apiCall = fullURL + text;
    getMethod(apiCall)
}

function changeField(newStr) {
	currentText = document.getElementById("diceInput").value
	document.getElementById("diceInput").value = currentText + newStr
}

function clearField() {
	document.getElementById("diceInput").value = ""
}