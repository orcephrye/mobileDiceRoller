/* env: JavaScript
 * Author: Ryan Henrichson
 * Date: 7/21/2020
 * Description: This is the javascript web app code for the mRoller.html dynamic webpage. This is used to roll Pencil&Dice style dice such as the d20 using an RESTful API.
 * BlaH 
 */

// This is a HTML template for an entry in the dice history. This code will be injected into a bootstrap modal popup to show the history of past rolls.
var defaultDiceHistoryItem = `                    
    <div class="input-group-prepend">
        <button type="button" class="btn btn-sm btn-outline-success" onclick="modalHistoryRoll('%DIC', '%OPT')">
        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-clockwise" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.17 6.706a5 5 0 0 1 7.103-3.16.5.5 0 1 0 .454-.892A6 6 0 1 0 13.455 5.5a.5.5 0 0 0-.91.417 5 5 0 1 1-9.375.789z"/><path fill-rule="evenodd" d="M8.147.146a.5.5 0 0 1 .707 0l2.5 2.5a.5.5 0 0 1 0 .708l-2.5 2.5a.5.5 0 1 1-.707-.708L10.293 3 8.147.854a.5.5 0 0 1 0-.708z"/></svg>
        </button>
    </div>
    <input class="form-control" type="text" id="historyDiceResults-%NUM" placeholder="$VAL" readonly>
    <div class="input-group-append">
        <button type="button" class="btn btn-sm btn-outline-primary" onclick="newSaveRoll('%DIC', '%OPT')">
        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-file-earmark-arrow-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 1h5v1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6h1v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z"/>
            <path d="M9 4.5V1l5 5h-3.5A1.5 1.5 0 0 1 9 4.5z"/>
            <path fill-rule="evenodd" d="M5.646 9.146a.5.5 0 0 1 .708 0L8 10.793l1.646-1.647a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 0-.708z"/>
            <path fill-rule="evenodd" d="M8 6a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 6z"/>
        </svg>
        </button>
    </div>
`;

// This is a HTML template for an entry in favorite dice rolls. This code will be injected into a bootstrap modal popup to show favorite dice.
var defaultFavItem = `                    
    <div class="input-group-prepend">
        <button type="button" class="btn btn-sm btn-outline-success" onclick="favReRoll('%DIC', '%OPT')">
        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-clockwise" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.17 6.706a5 5 0 0 1 7.103-3.16.5.5 0 1 0 .454-.892A6 6 0 1 0 13.455 5.5a.5.5 0 0 0-.91.417 5 5 0 1 1-9.375.789z"/><path fill-rule="evenodd" d="M8.147.146a.5.5 0 0 1 .707 0l2.5 2.5a.5.5 0 0 1 0 .708l-2.5 2.5a.5.5 0 1 1-.707-.708L10.293 3 8.147.854a.5.5 0 0 1 0-.708z"/></svg>
        </button>
    </div>
    <input class="form-control" type="text" id="favDieDetails-%NUM" placeholder="$VAL" readonly>
    <div class="input-group-append">
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeMe('%IDN')">
        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-file-minus" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M4 1h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H4z"/>
        <path fill-rule="evenodd" d="M5.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z"/>
        </svg>
        </button>
    </div>
`;


//Used to control the flash of color for success or failure. 
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

// Used to count the number of children elements under a given HTML element id.
function getElementChildCount(parent, getChildrensChildren){
    var relevantChildren = 0;
    var children = parent.childNodes.length;
    for(var i=0; i < children; i++){
        if(parent.childNodes[i].nodeType != 3){
            if(getChildrensChildren)
                relevantChildren += getCount(parent.childNodes[i],true);
            relevantChildren++;
        }
    }
    return relevantChildren;
}

/*
 * <Below are the primary rolling methods that build the roll api call and then use ajax to do the call and finish with a success or failure method.>
 */
function favReRoll(text, dieOptions) {
    document.getElementById("DiceText").value = text
    $( "#favRolls").modal('hide');
    rollFunc(text, dieOptions)
}


function modalHistoryRoll(text, dieOptions) {
    document.getElementById("DiceText").value = text
    $( "#historyRolls").modal('hide');
    rollFunc(text, dieOptions)
}


function rollFunc(text = null, dieOptions = null) {
    var fullURL = "http://api.d20futurepath.com/tasks/roll/"
    var apiCall
    if (text == null) {
        text = document.getElementById("DiceText").value;
    }
    if (dieOptions == null) {
        dieOptions = loadDieOptions();
    }
    var apiCall = fullURL + text + dieOptions;
    window.sessionStorage.setItem('currentRoll', text)
    window.sessionStorage.setItem('currentOptions', dieOptions)
    if (window.sessionStorage['numOfRolls'] == undefined) {
        window.sessionStorage.setItem('numOfRolls', 1);
    } else {
        window.sessionStorage.setItem('numOfRolls', parseInt(window.sessionStorage.getItem('numOfRolls'))+1);
    }
    getMethod(apiCall)
}

function getMethod(apiCall) {
$.ajax({
  type: 'GET',
  url: apiCall,
  async: true,
  dataType: 'json',
  success: rollSuccess,
  error: rollFailure
});
}


function rollSuccess(data) {
    document.getElementById("DiceResults").placeholder = "Rolls: " + data['Dice'] + " = Total:" + data['DiceTotal'];
    flash($('#DiceResults'), "0, 100, 0", "233, 236, 239");
    saveCurrentRoll(data)
    updateHistory()
}

function rollFailure(data) {
    document.getElementById("DiceResults").placeholder = "";
    flash($('#DiceResults'), "139, 0, 0", "233, 236, 239");
}
/*
 * </The end of the primary rolling methods. Below are helper methods and other such things.>
 */


//This function is called onload of the mRoller.html page. It two methods that build out the bootstrap modal for both history and favorite rolls using localStorage.
function preLoadSession() {
    updateHistory()
    preLoadFavs()
}


// Used to save the current roll too history. This is called by the 'rollSuccess' function
function saveCurrentRoll(data) {
    var tmpJson = '{"roll": "%ROL", "options": "%OPT", "results": "%RES", "total": "%TOT"}';
    tmpJson = tmpJson.replace('%ROL', window.sessionStorage.getItem('currentRoll'));
    tmpJson = tmpJson.replace('%OPT', window.sessionStorage.getItem('currentOptions'));
    tmpJson = tmpJson.replace('%RES', data['Dice']);
    tmpJson = tmpJson.replace('%TOT', data['DiceTotal']);
    if (window.localStorage['history'] == undefined) {
        window.localStorage.setItem('history', '[]');
    }
    var tmpHistory = JSON.parse(window.localStorage.getItem('history'));
    if (tmpHistory.length > 9) {
        tmpHistory.shift()
    }
    tmpHistory.push(JSON.parse(tmpJson))
    window.localStorage.setItem('history', JSON.stringify(tmpHistory));
}


// Used to update the history modal. This can be called from different places and tries to act differently based on the state of the modal.
function updateHistory() {
    var tmpHistory = JSON.parse(window.localStorage.getItem('history'));
    if (document.getElementById("historyMain").getElementsByClassName('input-group').length >= 10) {
        document.getElementById("historyMain").getElementsByClassName('input-group')[0].remove();
    } 
    if (document.getElementById("historyMain").getElementsByClassName('input-group').length == 0) {
        for (i = 0; i < tmpHistory.length; i++) {
            var latestHistory = tmpHistory[i];
            var newEntry = defaultDiceHistoryItem.replace('%NUM', i+1);
            newEntry = newEntry.replace('$VAL', "Dice: "+latestHistory['roll']+" // "+latestHistory['total']);
            newEntry = newEntry.replace('%DIC', latestHistory['roll']).replace('%DIC', latestHistory['roll']);
            newEntry = newEntry.replace('%OPT', latestHistory['options']).replace('%OPT', latestHistory['options']);
            appendModalHistory(newEntry, i+1)
        }
        window.sessionStorage.setItem('numOfRolls', i)
    } else {
        var latestHistory = tmpHistory[tmpHistory.length-1];
        var num = parseInt(window.sessionStorage.getItem('numOfRolls'));
        var newEntry = defaultDiceHistoryItem.replace('%NUM', num);
        newEntry = newEntry.replace('$VAL', "Dice: "+latestHistory['roll']+" // "+latestHistory['total']);
        newEntry = newEntry.replace('%DIC', latestHistory['roll']).replace('%DIC', latestHistory['roll']);
        newEntry = newEntry.replace('%OPT', latestHistory['options']).replace('%OPT', latestHistory['options']);
        appendModalHistory(newEntry, num)
    }
}


function appendModalHistory(newEntry, num) {
    var div = document.createElement('div');
    div.setAttribute('class', 'input-group mb-3');
    div.setAttribute('id', "history-"+num.toString());
    div.innerHTML = newEntry
    document.getElementById("historyMain").appendChild(div);
}


function newSaveRoll(dice, dieOptions) {
    var tmpJson = '{"id": "%ID", "roll": "%ROL", "options": "%OPT"}';
    var favId = document.getElementById("favMain").getElementsByClassName('input-group').length+1
    var favIdStr = "favID-"+favId.toString()+dice
    var newEntry = defaultFavItem.replace('%NUM', favId)
    newEntry = newEntry.replace('$VAL', "Dice To Roll: "+dice);
    newEntry = newEntry.replace('%DIC', dice);
    newEntry = newEntry.replace('%OPT', dieOptions);
    newEntry = newEntry.replace('%IDN', favIdStr)
    tmpJson = tmpJson.replace('%ROL', dice);
    tmpJson = tmpJson.replace('%OPT', dieOptions);
    tmpJson = tmpJson.replace('%ID', favIdStr)
    appendFavRoll(newEntry, favIdStr)
    if (window.localStorage['favRolls'] == undefined) {
        window.localStorage.setItem('favRolls', '[]');
    } else {
        var tmpFavs = JSON.parse(window.localStorage.getItem('favRolls'));
        tmpFavs.push(JSON.parse(tmpJson));
        window.localStorage.setItem('favRolls', JSON.stringify(tmpFavs));
    }
}


function preLoadFavs() {
    var newEntry = ""
    if (window.localStorage['favRolls'] == undefined) {
        window.localStorage.setItem('favRolls', '[]');
    }  
    var tmpFavs = JSON.parse(window.localStorage.getItem('favRolls'));
    if (tmpFavs.length > 0) {
        var tmpFavs = JSON.parse(window.localStorage.getItem('favRolls'));
        for (i = 0; i < tmpFavs.length; i++) {
            tmpFavs[i]
            newEntry = defaultFavItem.replace('%NUM', tmpFavs[i]['id'])
            newEntry = newEntry.replace('$VAL', "Dice To Roll: "+tmpFavs[i]['roll']);
            newEntry = newEntry.replace('%DIC', tmpFavs[i]['roll']);
            newEntry = newEntry.replace('%OPT', tmpFavs[i]['options']);
            newEntry = newEntry.replace('%IDN', tmpFavs[i]['id'])
            appendFavRoll(newEntry, tmpFavs[i]['id'])
        }
    }
}


function appendFavRoll(newEntry, favId) {
    var div = document.createElement('div');
    div.setAttribute('class', 'input-group mb-3');
    div.setAttribute('id', favId);
    div.innerHTML = newEntry;
    document.getElementById("favMain").appendChild(div);
}


//This removes the HTML element of the id provied. However it is designed in such a way to only work with favorite roll modal as it is tied to the 'removeFavArrayElement' function.
function removeMe(idStr) {
    document.getElementById(idStr).remove();
    removeFavArrayElement(idStr)
}


function removeFavArrayElement(favId) {
    var tmpFavs = JSON.parse(window.localStorage.getItem('favRolls'));
    var newFavs = []
    for (i = 0; i < tmpFavs.length; i++) {
        x = tmpFavs.shift()
        if (x['id'] != favId) {
            newFavs.push(x)
        }
    }
    window.localStorage.setItem('favRolls', JSON.stringify(tmpFavs));
}


function changeField(newStr) {
    currentText = document.getElementById("DiceText")
    if (currentText.value == "IE: d20+2d4+1" ) {
        currentText.value = "";
    }
    if (currentText.placeholder == "IE: d20+2d4+1" ) {
        currentText.placeholder = "";
    }
    document.getElementById("DiceText").value = currentText.value + newStr
}


function clearField() {
    document.getElementById("DiceText").value = "";
    document.getElementById("DiceText").placeholder = "";
    clearDieOptions()
}


// Unsets all the options in the Die Options modal
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


// Finds and returns all the values from the Die Options modal. 
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


// Helper function for the 'loadDieOptions' this sets up the options into a string to be added to the URL of the API call.
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

