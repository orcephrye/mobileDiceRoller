/* env: JavaScript
 * Author: Ryan Henrichson
 * Date: 7/21/2020
 * Description: This is the javascript web app code for the mRoller.html dynamic webpage. This is used to roll Pencil&Dice style dice such as the d20 using an RESTful API.
 * BlaH 
 */

// This is an HTML template for an entry in the dice history. This code will be injected into a bootstrap modal popup to show the history of past rolls.
const defaultDiceHistoryItem = `                 
    <div class="input-group-prepend">
        <span class="input-group-text">   
            <button type="button" class="btn btn-sm btn-outline-success" onclick="modalHistoryRoll('%ROLLID')">
            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-clockwise" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.17 6.706a5 5 0 0 1 7.103-3.16.5.5 0 1 0 .454-.892A6 6 0 1 0 13.455 5.5a.5.5 0 0 0-.91.417 5 5 0 1 1-9.375.789z"/><path fill-rule="evenodd" d="M8.147.146a.5.5 0 0 1 .707 0l2.5 2.5a.5.5 0 0 1 0 .708l-2.5 2.5a.5.5 0 1 1-.707-.708L10.293 3 8.147.854a.5.5 0 0 1 0-.708z"/></svg>
            </button>
        </span>   
    </div>
    <input class="form-control" type="text" id="historyDiceResults-%NUM" placeholder="$VAL" readonly>
    <div class="input-group-append">
        <span class="input-group-text">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick="newSaveRoll('%ROLLID')">
            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-file-earmark-arrow-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 1h5v1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6h1v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z"/>
                <path d="M9 4.5V1l5 5h-3.5A1.5 1.5 0 0 1 9 4.5z"/>
                <path fill-rule="evenodd" d="M5.646 9.146a.5.5 0 0 1 .708 0L8 10.793l1.646-1.647a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 0-.708z"/>
                <path fill-rule="evenodd" d="M8 6a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4A.5.5 0 0 1 8 6z"/>
            </svg>
            </button>
        </span>
    </div>
`;

// This is an HTML template for an entry in favorite dice rolls. This code will be injected into a bootstrap modal popup to show favorite dice.
const defaultFavItem = `                    
    <div class="input-group-prepend">
        <span class="input-group-text">
            <button type="button" class="btn btn-sm btn-outline-success" onclick="favReRoll('%ROLLID')">
            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-clockwise" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.17 6.706a5 5 0 0 1 7.103-3.16.5.5 0 1 0 .454-.892A6 6 0 1 0 13.455 5.5a.5.5 0 0 0-.91.417 5 5 0 1 1-9.375.789z"/><path fill-rule="evenodd" d="M8.147.146a.5.5 0 0 1 .707 0l2.5 2.5a.5.5 0 0 1 0 .708l-2.5 2.5a.5.5 0 1 1-.707-.708L10.293 3 8.147.854a.5.5 0 0 1 0-.708z"/></svg>
            </button>
        </span>
    </div>
    <input class="form-control" type="text" id="favDieDetails-%NUM" placeholder="$VAL" readonly>
    <div class="input-group-append">
        <span class="input-group-text">
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeMe('%ROLLID')">
            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-file-minus" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M4 1h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H4z"/>
            <path fill-rule="evenodd" d="M5.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z"/>
            </svg>
            </button>
        </span>
    </div>
`;

const diceListFromDString = `<button class="dropdown-item" href="#" id="dropDown-%MAPVAL" value="%MAPVAL" onclick="setActiveDropDown('%MAPVAL')">%DSTRING</button>`

// Support for UUID even when not in HTTPs
const getUUID = () =>
    (String(1e7) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            Number(c) ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
        ).toString(16)
    );

// Copy to Clipboard code taking from online example
function copyToClipBoard(target) {
    if (target === undefined) {
        target = 'rollDetailsJSONResponse'
    }
    navigator.clipboard.writeText(document.getElementById(target).innerText);
}


// history of DiceText input element
let DiceTextHistory = []

// history of die button presses
let DieButtonHistory = []

// last change
let changeHistory = [];

// Roll Hashmap
let rollMap = new Map();

// DieOptionsMap
let DieOptionsMap = new Map();

//Temp Roll to be saved
let tmpRoll;

class DieOptions {
    constructor(dropLowest, rerollTotal, rerollDie, subAll, addAll) {
        this.dropLowest = dropLowest
        this.rerollTotal = rerollTotal
        this.rerollDie = rerollDie
        this.subAll = subAll
        this.addAll = addAll
    }
}

class DiceOptions {
    constructor(dropLowest, repeatRoll, subAll, addAll) {
        this.dropLowest = dropLowest
        this.repeatRoll = repeatRoll
        this.subAll = subAll
        this.addAll = addAll
    }
}

class Die {
    constructor(id, dString, modifier, connectorString, dieOptions) {
        this.id = id
        this.dString = dString
        this.modifier = modifier
        this.connectorString = connectorString
        this.dieOptions = dieOptions
    }
}

class Message {
    constructor(name, dString, dice, diceOptions, diceRoll, rollText, rollID) {
        this.name = name
        this.dString = dString
        this.dice = dice
        this.diceOptions = diceOptions
        this.diceRoll = diceRoll
        this.rollText = rollText
        this.rollID = (rollID) ? rollID : getUUID()
    }
}

let splitDStr = new RegExp("(\[\+|-])", "gi");
let determineDie = new RegExp("d\\d{1,3}", "ig");
let getDies = new RegExp("(\\d{0,2}d\\d{1,3})", "ig");
// let determineMultiplier = new RegExp('^(\\d){1,3}', "gi");

function buildDiceOptions(diceOptions = null) {
    if (diceOptions !== null) {
        return diceOptions
    }

    let diceOpt = new DiceOptions()

    if($('#Dice-dropLowest').prop('checked')){
        diceOpt.dropLowest = document.getElementById("Dice-dropLowest-text").value
    }
    if($('#Dice-repeatRoll').prop('checked')){
        diceOpt.repeatRoll = document.getElementById("Dice-repeatRoll-text").value
    }
    if($('#Dice-subAll').prop('checked')){
        diceOpt.subAll = document.getElementById("Dice-subAll-text").value
    }
    if($('#Dice-addAll').prop('checked')){
        diceOpt.addAll = document.getElementById("Dice-addAll-text").value
    }

    return diceOpt
}

function buildDieOptions(dieOptions = null) {

    if (dieOptions !== null) {
        return dieOptions
    }

    let dieOpt = new DieOptions()

    if($('#DieO-dropLowest').prop('checked')){
        dieOpt.dropLowest = document.getElementById("DieO-dropLowest-text").value
    }
    if($('#DieO-rerollTotal').prop('checked')){
        dieOpt.rerollTotal = document.getElementById("DieO-rerollTotal-text").value
    }
    if($('#DieO-rerollDie').prop('checked')){
        dieOpt.rerollDie = document.getElementById("DieO-rerollDie-text").value
    }
    if($('#DieO-subAll').prop('checked')){
        dieOpt.subAll = document.getElementById("DieO-subAll-text").value
    }
    if($('#DieO-addAll').prop('checked')){
        dieOpt.addAll = document.getElementById("DieO-addAll-text").value
    }

    return dieOpt
}

function buildDiceArray(text = null, dieOptions = null) {
    let DiceText;
    let Dice = [];
    if (text == null) {
        DiceText = document.getElementById("DiceText").value;
    } else {
        DiceText = text
    }
    let die_count = (DiceText.match(determineDie) || []).length
    if (die_count < 1) {
        return Dice
    }
    let dice_text_arr = DiceText.split(splitDStr);
    let die_text;
    let modifier = [];
    let connectorStr;
    for (let i = dice_text_arr.length-1; i >= 0; i--) {
        tmpText = dice_text_arr[i];
        if (tmpText.match(determineDie)) {
            die_text = tmpText;
            Dice.push(new Die(i, die_text, parseModifierArr(modifier), connectorStr, DieOptionsMap.get(i+'-'+die_text)))
            die_text = undefined
            modifier = []
            connectorStr = undefined
        } else if (tmpText === '+' || tmpText === '-') {
            if (modifier.length === 0) {
                connectorStr = tmpText
            } else {
                modifier.push(tmpText)
            }
        } else {
            modifier.push(tmpText)
        }
    }
    return Dice
}

function parseModifierArr(modArr) {
    let outputNum = 0;
    let plussOrMinus = '+';
    let val = '';
    for (let i = modArr.length-1; i >= 0; i--) {
        val = modArr[i];
        if (val === '+' || val === '-') {
            plussOrMinus = val;
        } else {
            if (plussOrMinus === '+') {
                outputNum = outputNum + parseInt(val);
            } else {
                outputNum = outputNum - parseInt(val);
            }
        }
    }
    let outputStr = outputNum.toString();
    if (outputStr.length < 1 || outputStr === '0') {
        return undefined
    } else if (! outputStr.startsWith('-') ) {
        return '+'+outputStr
    }
    return outputStr
}

function buildMessage(text, dieOptions, diceOptions) {
    return new Message(undefined, text, buildDiceArray(text, dieOptions), buildDiceOptions(diceOptions), undefined, undefined, undefined)
}

//Used to control the flash of color for success or failure. 
let flash = function(elements, color, resetColor) {
  let opacity = 100;
  let interval = setInterval(function() {
    opacity -= 3;
    if (opacity <= 15) {
        clearInterval(interval);
        $(elements).css({background: "rgba("+resetColor+")"});
    } else {
        $(elements).css({background: "rgba("+color+", "+opacity/100+")"});
    }
  }, 20)
};


function dStringHashMap(dString = null) {
    let text = (dString === null) ? document.getElementById("DiceText").value : dString
    let dStringHash = new Map();
    let dice_text_arr = DiceText.split(splitDStr);

}

/*
 * <Below are the primary rolling methods that build the roll api call and then use ajax to do the call and finish with a success or failure method.>
 */
function rollFuncPost(messageJSON = null) {
    let mesg;
    if (messageJSON !== null) {
        if ( typeof(messageJSON) !== 'object'){
            mesg = JSON.parse(messageJSON)
        } else {
            mesg = messageJSON
        }
    } else {
        mesg = buildMessage()
    }

    let host = window.location.origin;
    if (host.includes('0.0.0.0')) {
        host = 'http://0.0.0.0:8000'
    }
    let fullURL = host+"/v1/tasks/roll"

    mesg.dString = document.getElementById("DiceText").value

    rollMap.set(mesg.rollID, mesg);

    postMethod(fullURL, JSON.stringify(mesg))
}

function modalHistoryRoll(rollID) {
    let histRoll = getHistoryByID(rollID)
    document.getElementById("DiceText").value = histRoll.dString
    $( "#historyRolls").modal('hide');
    rollFuncPost(histRoll)
}

function favReRoll(rollID) {
    let favRoll = getFavByID(rollID)
    document.getElementById("DiceText").value = favRoll.dString
    $( "#favRolls").modal('hide');
    rollFuncPost(favRoll)
}

function postMethod(url, data) {
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        contentType: 'application/json',
        async: true,
        dataType: 'JSON',
        success: rollSuccess,
        error: rollFailure
    });
}

function rollCharacter(characterLevel = null) {
    let host = window.location.origin;
    if (host.includes('0.0.0.0')) {
        host = 'http://0.0.0.0:8000'
    }
    let fullURL = host+"/v1/tasks/roll/character/"

    let apiCall;
    if (characterLevel === null) {
        apiCall = fullURL+'normal'
    } else {
        apiCall = fullURL+characterLevel
    }

    getMethod(apiCall)
}

function getMethod(apiCall) {
    $.ajax({
        type: 'GET',
        url: apiCall,
        async: true,
        dataType: 'json',
        success: rollCharSuccess,
        error: rollFailure
    });
}

function rollSuccess(data) {
    diceData = data['Rolls']
    let dieSet;
    let text = "Rolls: ";
    for (dieSet of diceData) {
        text = text + "(" + dieSet['Dice'] + ") = " + dieSet['Total'] + " , ";
    }
    updateHTMLFromRoll(text.replace(/\s,\s$/, ''), data, false);
    flash($('#DiceResults'), "0, 100, 0", "233, 236, 239");
    saveCurrentRoll(data, text)
}

function rollCharSuccess(data) {
    let roll;
    let totalArr = [];
    for (roll of data['Rolls']) {
        totalArr.push(roll['Total'])
    }
    updateHTMLFromRoll("Rolls: "+totalArr, data, false);
    flash($('#DiceResults'), "0, 100, 0", "233, 236, 239");
}

function rollFailure(data) {
    updateHTMLFromRoll("", "", true)
    flash($('#DiceResults'), "139, 0, 0", "233, 236, 239");
}

function updateHTMLFromRoll(diceResults = "", jsonResponse = undefined, bntStatus = true) {
    document.getElementById("DiceResults").placeholder = diceResults;
    document.getElementById("rollDetailsDiceResults").innerText = diceResults;
    document.getElementById("rollDetailsJSONResponse").innerText = JSON.stringify(jsonResponse, undefined, 2);
    document.getElementById('rollDetailsSaveToFavBnt').value = (jsonResponse !== undefined) ? jsonResponse['rollID'] : "";
    document.getElementById('showRollDetailsBnt').disabled = bntStatus;
    document.getElementById('showRollDetailsBnt').setAttribute('aria-disabled', bntStatus);
}
/*
 * </The end of the primary rolling methods. Below are helper methods and other such things.>
 */


//This function is called onload of the mRoller.html page. It two methods that build out the bootstrap modal for both history and favorite rolls using localStorage.
function preLoadSession() {
    document.getElementById("DiceText").placeholder = "IE: d20+2d4+1"
    document.getElementById('showRollDetailsBnt').disabled = true;
    document.getElementById('showRollDetailsBnt').setAttribute('aria-disabled', true);
    genHTMLHistory();
    genHTMLFavRolls();
}

/*
 * < Functions for get/set/update Local Storage rolling history >
 */
function getHistory() {
    if (window.localStorage['history'] === undefined) {
        window.localStorage.setItem('history', '[]');
    }
    return JSON.parse(window.localStorage.getItem('history'));
}

function setHistory(historyArr) {
    historyArr = trimHistory(historyArr)
    window.localStorage.setItem('history', JSON.stringify(historyArr));
    genHTMLHistory()
}

function appendHistory(historyObj) {
    let historyArr = getHistory();
    historyArr.push(historyObj);
    setHistory(historyArr);
}

function popHistory() {
    let historyArr = getHistory();
    historyArr.pop();
    setHistory(historyArr);
}

function trimHistory(historyArr) {
    if (historyArr.length > 8) {
        return historyArr.slice(historyArr.length-8, historyArr.length)
    } else {
        return historyArr
    }
}

function getHistoryByID(rollID) {
    let histArr = getHistory();
    let hist;
    for (hist of histArr) {
        if ( hist.rollID === rollID ) {
            return hist
        }
    }
}

function clearHistory() {
    setHistory([])
}

function clearHTMLHistory() {
    for (historyDiv of document.getElementById("historyMain").getElementsByClassName('input-group')) {
        historyDiv.remove()
    }
    if (document.getElementById("historyMain").getElementsByClassName('input-group').length > 0) {
        clearHTMLHistory()
    }
}

function genHTMLHistory() {
    let historyArr = getHistory()
    clearHTMLHistory()
    for (let i = historyArr.length-1; i > -1; i--) {
        let hist = historyArr[i];
        let newEntry = defaultDiceHistoryItem.replace('%NUM', i+1);
        newEntry = newEntry.replace('$VAL', "Dice: "+hist.dString+" // "+hist.rollText);
        newEntry = newEntry.replace('%ROLLID', hist.rollID).replace('%ROLLID', hist.rollID);
        appendModalHistory(newEntry, i+1)
    }
}

function appendModalHistory(newEntry, num) {
    let div = document.createElement('div');
    div.setAttribute('class', 'input-group mb-3');
    div.setAttribute('id', "history-"+num.toString());
    div.innerHTML = newEntry
    document.getElementById("historyMain").appendChild(div);
}

function saveCurrentRoll(data, rollText) {

    let mesg = rollMap.get(data.rollID);

    mesg.diceRoll = data['Rolls'];
    mesg.rollText = rollText.replace(/\s,\s$/, '').replace(/^Rolls:\s/, '');

    appendHistory(mesg);
}
/*
 * </ End of Functions for editing local roll history >
 */


/*
 * < Start of Functions for editing local favorite die rolls >
 */
function getFavRolls() {
    if (window.localStorage['favRolls'] === undefined) {
        window.localStorage.setItem('favRolls', '[]');
    }
    return JSON.parse(window.localStorage.getItem('favRolls'))
}

function setFavRolls(favArr) {
    window.localStorage.setItem('favRolls', JSON.stringify(favArr));
    genHTMLFavRolls();
}

function appendFavRolls(favObj) {
    let favArr = getFavRolls();
    favArr.push(favObj);
    setFavRolls(favArr);
}

function clearFavRolls() {
    setFavRolls([])
}

function getFavByID(rollID) {
    let favArr = getHistory();
    let fav;
    for (fav of favArr) {
        if ( fav.rollID === rollID ) {
            return fav
        }
    }
}

function genHTMLFavRolls() {
    let favArr = getFavRolls()
    clearHTMLFavRolls()
    for (let i = favArr.length-1; i > -1; i--) {
        let fav = favArr[i];
        let newEntry = defaultFavItem.replace('%NUM', i)
        let textVal = (fav.name) ? fav.name : "Dice To Roll: "+fav.dString;
        newEntry = newEntry.replace('$VAL', textVal);
        newEntry = newEntry.replace('%ROLLID', fav.rollID).replace('%ROLLID', fav.rollID);
        appendFavRoll(newEntry, fav.rollID)
    }
}

function clearHTMLFavRolls() {
    for (favRollsDiv of document.getElementById("favMain").getElementsByClassName('input-group')) {
        favRollsDiv.remove()
    }
    if (document.getElementById("favMain").getElementsByClassName('input-group').length > 0) {
        clearHTMLFavRolls()
    }
}

function appendFavRoll(newEntry, favId) {
    let div = document.createElement('div');
    div.setAttribute('class', 'input-group mb-3');
    div.setAttribute('id', favId);
    div.innerHTML = newEntry;
    document.getElementById("favMain").appendChild(div);
}

function newSaveRoll(rollID) {
    tmpRoll = getHistoryByID(rollID);
    if (tmpRoll !== undefined) {
        $( "#historyRolls").modal('hide');
        inputObj = document.getElementById('favDie-Name');
        inputObj.value = tmpRoll.dString;
        $( "#saveFavDie").modal('show');
    }
}

function saveFromRollDetailsToFav() {
    tmpRoll = getHistoryByID(document.getElementById('rollDetailsSaveToFavBnt').value)
    if (tmpRoll !== undefined) {
        $( "#rollDetails").modal('hide');
        inputObj = document.getElementById('favDie-Name');
        inputObj.value = tmpRoll.dString;
        $( "#saveFavDie").modal('show');
    }
}

function saveHistRollInFavs() {
    if ( tmpRoll === undefined ) {
        return
    }
    tmpRoll.name = document.getElementById('favDie-Name').value;
    appendFavRolls(tmpRoll);
    tmpRoll = undefined;
}

function closeSaveFavWindow() {
    inputObj = document.getElementById('favDie-Name');
    inputObj.value = ""
    tmpRoll = undefined;
    $( "#saveFavDie").modal('hide');
}


//This removes the HTML element of the id provided. However, it is designed in such a way to only work with favorite roll modal as it is tied to the 'removeFavArrayElement' function.
function removeMe(idStr) {
    document.getElementById(idStr).remove();
    removeFavArrayElement(idStr)
}

function removeFavArrayElement(favId) {
    let favArr = getFavRolls();
    let favIndex;
    for (i = 0; i < favArr.length; i++) {
        if (favArr[i].rollID === favId) {
            favIndex = i;
            break;
        }
    }
    favArr.splice(favIndex, 1)
    setFavRolls(favArr);
}
/*
 * </ End of Functions for editing local favorite die rolls >
 */


/*
 * < Start of functions for editing die options >
 */
function getDiceArr() {
    return document.getElementById("DiceText").value.split(splitDStr);

}

function getDiceFromText() {
    return document.getElementById("DiceText").value.match(getDies);
}

function isDiePresent(mapKey) {
    let index, dString;
    if (mapKey !== undefined) {
        [index, dString] = mapKey.split('-');
    } else {
        [index, dString] = getActiveDropDown().split('-');
    }
    let diceArr = getDiceArr();
    return diceArr[Number(index)] === dString
}

function genDiceDropDown() {
    clearDiceOptions()
    clearHTMLDiceDropDown()
    document.getElementById('dieDropDownMenuText').innerText = "Select Dice for Die Options:";
    let diceArr = getDiceArr();
    let index = 0;
    for (index in diceArr) {
        if (! diceArr[index].match(determineDie)) {
            continue
        }
        let li = document.createElement('li');
        li.innerHTML = diceListFromDString
            .replace('%INDEX', index.toString())
            .replace('%DSTRING', diceArr[index])
            .replace('%MAPVAL', index+'-'+diceArr[index])
            .replace('%MAPVAL', index+'-'+diceArr[index])
            .replace('%MAPVAL', index+'-'+diceArr[index]);
        document.getElementById("dieOptionsDropDownMenu").appendChild(li);
        DieOptionsMap.set(index+'-'+diceArr[index], DieOptionsMap.get(index+'-'+diceArr[index]));
    }
}

function clearHTMLDiceDropDown() {
    for (dropDownDice of document.getElementById("dieOptionsDropDownMenu").children) {
        dropDownDice.remove()
    }
    if (document.getElementById("dieOptionsDropDownMenu").children.length > 0) {
        clearHTMLDiceDropDown()
    }
}

function setActiveDropDown(mapKey) {
    if (isDiePresent(mapKey) === false) {
        document.getElementById('dieOptionsDropDownMenu').classList.remove('show');
        alert('The Dice: '+mapKey+' is not present!')
        DieOptionsMap.delete(mapKey);
        genDiceDropDown();
    } else {
        saveCurrentDieOptions();
        let dropDownObj;
        for (dropDownObj of document.getElementById("dieOptionsDropDownMenu").children) {
            if ( dropDownObj.firstChild.id === 'dropDown-'+mapKey ) {
                if (! dropDownObj.firstChild.classList.contains('active') ) {
                    dropDownObj.firstChild.classList.add('active');
                }
                document.getElementById('dieDropDownMenuText').innerText = "Selected Dice is: "+dropDownObj.firstChild.innerText;
            } else {
                dropDownObj.firstChild.classList.remove('active');
            }
        }
        clearDieOptions();
        loadDieOptions(mapKey);
    }
}

function getActiveDropDown() {
    let dropDownObj;
    for (dropDownObj of document.getElementById("dieOptionsDropDownMenu").children) {
        if (dropDownObj.firstChild.classList.contains('active') ) {
            return dropDownObj.firstChild.value;
        }
    }
    return ''
}

function deActiveDropDowns() {
    for (dropDownObj of document.getElementById("dieOptionsDropDownMenu").children) {
        dropDownObj.firstChild.classList.remove('active');
    }
    document.getElementById('dieDropDownMenuText').innerText = "Select Dice for Die Options:";
}

function saveCurrentDieOptions(mapKey) {
    if (mapKey === undefined) {
        mapKey = getActiveDropDown();
    }
    if (isDiePresent(mapKey) !== false) {
        DieOptionsMap.set(mapKey, buildDieOptions());
    }
}

// Unsets all the options in the Die Options modal
function clearDieOptions() {
    document.getElementById("DieO-dropLowest-text").value = 0;
    document.getElementById("DieO-rerollTotal-text").value = 0;
    document.getElementById("DieO-rerollDie-text").value = 0;
    document.getElementById("DieO-subAll-text").value = 0;
    document.getElementById("DieO-addAll-text").value = 0;
    $("[class='DieO-CheckBox-0']").prop("checked", false);
    return true
}

function loadDieOptions(mapKey) {
    let dieOptions = DieOptionsMap.get(mapKey);
    if (dieOptions === undefined) {
        return
    }
    if (dieOptions.dropLowest !== undefined) {
        $('#DieO-dropLowest').prop('checked', true);
        document.getElementById("DieO-dropLowest-text").value = dieOptions.dropLowest;
    }
    if (dieOptions.rerollTotal !== undefined) {
        $('#DieO-rerollTotal').prop('checked', true);
        document.getElementById("DieO-rerollTotal-text").value = dieOptions.rerollTotal;
    }
    if (dieOptions.rerollDie !== undefined) {
        $('#DieO-rerollDie').prop('checked', true);
        document.getElementById("DieO-rerollDie-text").value = dieOptions.rerollDie;
    }
    if (dieOptions.subAll !== undefined) {
        $('#DieO-subAll').prop('checked', true);
        document.getElementById("DieO-subAll-text").value = dieOptions.subAll;
    }
    if (dieOptions.addAll !== undefined) {
        $('#DieO-addAll').prop('checked', true);
        document.getElementById("DieO-addAll-text").value = dieOptions.addAll;
    }
}

function clearDiceOptions() {
    document.getElementById("Dice-dropLowest-text").value = 0;
    document.getElementById("Dice-repeatRoll-text").value = 0;
    document.getElementById("Dice-subAll-text").value = 0;
    document.getElementById("Dice-addAll-text").value = 0;
    $("[class='Dice-CheckBox']").prop("checked", false);
    return true
}

function clearAllOptions() {
    clearDieOptions()
    clearDiceOptions()
    deActiveDropDowns()
    DieOptionsMap = new Map();
}

function clearPresentOptions() {
    if (document.getElementById('DiceOptions').classList.contains('show')) {
        clearDiceOptions();
    } else if (document.getElementById('DieOptions').classList.contains('show')) {
        clearDieOptions()
        let activeDropDown = getActiveDropDown();
        if (activeDropDown !== '') {
            DieOptionsMap.set(activeDropDown, undefined)
        }
    }
}
/*
 * </ End of functions for editing die options >
 */


function countDiesInArray(die) {
    for (i = -1; Math.abs(i) <= DieButtonHistory.length; i--) {
        if (DieButtonHistory.slice(i)[0] !== die) {
            break;
        }
    }
    return DieButtonHistory.slice(i+1).length
}


function changeDie(die) {
    DieButtonHistory.push(die);
    searchText = '[1-9]*'+die+'$'
    re = new RegExp(searchText);
    tempText = document.getElementById("DiceText").value;

    dieNum = countDiesInArray(die)
    endCharacter = "";
    if (tempText.length <= 0) {
        console.log('The tempText is zero setting endCharacter to nothing')
        endCharacter = "";
    } else if (tempText.endsWith('+')) {
        endCharacter = "+";
        tempText = tempText.slice(0,-1);
    } else if (tempText.endsWith('-')) {
        endCharacter = "-";
        tempText = tempText.slice(0,-1);
    }

    if (tempText.search(re) >= 0) {
        DiceTextHistory.push(tempText);
        tempText = tempText.replace(re, dieNum + die);
        document.getElementById("DiceText").value = tempText;
    } else {
        DiceTextHistory.push(tempText+endCharacter);
        if (dieNum === 1 && endCharacter === "" && tempText.length > 0) {
            endCharacter = "+"
        }
        document.getElementById("DiceText").value = tempText+endCharacter+dieNum+die
    }
    changeHistory.push('die')
    genDiceDropDown()
}


function changeField(newStr) {
    currentText = document.getElementById("DiceText")
    if (currentText.value === "IE: d20+2d4+1" ) {
        currentText.value = "";
    }
    if (currentText.placeholder === "IE: d20+2d4+1" ) {
        currentText.placeholder = "";
    }
    if (newStr === "backspace") {
        if (DiceTextHistory.length > 0) {
            document.getElementById("DiceText").value = DiceTextHistory.pop()
            if (changeHistory.length > 0) {
                if (changeHistory.pop() === 'die') {
                    if (DieButtonHistory.length > 0) {
                        DieButtonHistory.pop()
                    }
                }
            }
        }
    } else {
        DiceTextHistory.push(currentText.value)
        document.getElementById("DiceText").value = currentText.value + newStr
        changeHistory.push('str')
    }
    genDiceDropDown()
}

function clearField() {
    document.getElementById("DiceText").value = "";
    document.getElementById("DiceText").placeholder = "";
    document.getElementById("DiceResults").value = "";
    document.getElementById("DiceResults").placeholder = "";
    document.getElementById("rollDetailsDiceResults").innerText = "";
    document.getElementById("rollDetailsJSONResponse").innerText = "";
    document.getElementById('showRollDetailsBnt').disabled = true;
    document.getElementById('showRollDetailsBnt').setAttribute('aria-disabled', true);
    DiceTextHistory = []
    DieButtonHistory = []
    changeHistory = []
    DieOptionsMap = new Map();
    deActiveDropDowns()
    clearDieOptions()
    clearDiceOptions()
    clearHTMLDiceDropDown()
}
