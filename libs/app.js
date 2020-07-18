var flash = function(elements, color, resetColor) {
  var opacity = 100;
  var interval = setInterval(function() {
    opacity -= 3;
    if (opacity <= 15) {
        clearInterval(interval);
        $(elements).css({background: "rgba("+resetColor+")"});
    } else {
        $(elements).css({background: "rgba("+color+", "+opacity/100+")"});
    }
  }, 20)
};


function success(data) {
    document.getElementById("DiceResults").placeholder = "Rolls: " + data['Dice'] + " = Total:" + data['DiceTotal'];
    flash($('#DiceResults'), "0, 100, 0", "233, 236, 239");
}

function failure(data) {
    document.getElementById("DiceResults").placeholder = "";
    flash($('#DiceResults'), "139, 0, 0", "233, 236, 239");
}

function getMethod(apiCall) {
$.ajax({
  type: 'GET',
  url: apiCall,
  async: true,
  dataType: 'json',
  success: success,
  error: failure
});
}

function rollFunc() {
    var text;
    var dieOptions;
    var fullURL = "http://api.d20futurepath.com/tasks/roll/"
    var apiCall

    text = document.getElementById("DiceText").value;
    dieOptions = loadDieOptions();
    apiCall = fullURL + text + dieOptions;
    getMethod(apiCall)
}

function changeField(newStr) {
	currentText = document.getElementById("DiceText").value
	if (currentText == "Example: d20+2d4+1" ) {
		currentText = "";
	}
	document.getElementById("DiceText").value = currentText + newStr
}

function clearField() {
	document.getElementById("DiceText").value = "";
	clearDieOptions()
}

function clearDieOptions() {
    document.getElementById("DieO-dropLowest-text").value = 0
    document.getElementById("DieO-rerollTotal-text").value = 0
    document.getElementById("DieO-rerollDie-text").value = 0
    document.getElementById("DieO-subAll-text").value = 0
    document.getElementById("DieO-addAll-text").value = 0
    $('#DieO-dropLowest').removeAttr("checked");
    $('#DieO-rerollTotal').removeAttr("checked");
    $('#DieO-rerollDie').removeAttr("checked");
    $('#DieO-subAll').removeAttr("checked");
    $('#DieO-addAll').removeAttr("checked");
    $("[class='DieO-CheckBox-0']").prop("checked", false)
    return true
}

function loadDieOptions() {

    var text = ""

    if($('#DieO-dropLowest').prop('checked')){
        text = appendGETOptions(text, "dropLowest=", document.getElementById("DieO-dropLowest-text").value)
    }
    if($('#DieO-rerollTotal').prop('checked')){
        text = appendGETOptions(text, "rerollTotal=", document.getElementById("DieO-rerollTotal-text").value)
    }
    if($('#DieO-rerollDie').prop('checked')){
        text = appendGETOptions(text, "rerollDie=", document.getElementById("DieO-rerollDie-text").value)
    }
    if($('#DieO-subAll').prop('checked')){
        text = appendGETOptions(text, "subAll=", document.getElementById("DieO-subAll-text").value)
    }
    if($('#DieO-addAll').prop('checked')){
        text = appendGETOptions(text, "addAll=", document.getElementById("DieO-addAll-text").value)
    }

    return text
}

function appendGETOptions(currentStr, newText, newValue) {
    if (typeof newValue == "number") {
        newValue = newValue.toString();
    }
    if (currentStr.length > 0) {
        currentStr += "&"
    } else {
        currentStr += "?"
    }
    currentStr += newText+newValue
    return currentStr
}

