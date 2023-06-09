let wordList = null
let rightWord = 0

// prototype injection for string to check if it is a letter
String.prototype.isAlpha = function() {
    let re = /^[a-zA-Zä-üÄ-Üß]+$/;
    return re.test(this);
}

$(".inputField").keyup((e) => {
    if(e.originalEvent.key == "Backspace" && e.currentTarget.value.length == 0) {
        $(e.currentTarget).prevAll('.inputField:enabled:first').focus();
    } else {
        if(e.currentTarget.value.length == e.currentTarget.maxLength) {
            $(e.currentTarget).nextAll('.inputField:enabled:first').focus();
        }
    }

    if (e.originalEvent.key == "Enter") {
        // console.log("Enter")
        let valid = true
        // get word from all the children of the parent element
        let word = $(e.currentTarget).parent().children().map((index, elem) => { return elem.value }).get().join("")
        // search for empty fields that are not disabled
        $(".inputField").each((index, elem) => {
            if ((elem.value == "" || elem.value == " " || elem.value.length == 0 || elem.value.length > 1 || !elem.value.isAlpha()) && elem.disabled == false) {
                valid = false
            }
        })
        if (valid) {
            reveal(compareWords(word), e.currentTarget.parentElement)
            $(".errors").text("Wordle Deutsch")
            $(e.currentTarget).parent().next().children()[0].focus();
        }
        else $(".errors").text("Bitte alles ausfüllen")
    }
})

/**
 * @author gamersi
 * @description Random Integer zwischen Grenzen
 * @param {number} min 
 * @param {number} max 
*/
function randIntBorders(min=0, max=10) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * @author gamersi
 * @description initialisiert die Wordlist
 * @readonly
*/
function initWordlist() {
    const data = new Promise((resolve, reject) => {
        fetch('./words.json')
            .then(respond => {
                resolve(respond.json())
            }).catch(err => {
                reject(err)
        })
    })
    return data
}

/**
 * @author gamersi
 * @description wählt ein random wort aus
*/
function selectWord() {
    let word = 0
    let maxIndex = wordList.data.length - 1

    word = randIntBorders(0, maxIndex)
    return word
}

/**
 * @author gamersi
 * @description vergleicht, ob ein wort gleich ist und inwieweit 
 * @param {string} word 
 */
function compareWords(word = "hilfe") {
    let correction = [];
    // corect word check, green if true, red if it does not occure in the word and yellow if it is in the wrong position
    let empty = 0;
    // compare word with the right word
    let corrWord = wordList.data[rightWord]
    word.split("").forEach((letter, index) => {
        if (letter.toLowerCase() == corrWord[index].toLowerCase()) {
            let numChars = corrWord.toLowerCase().split(letter.toLowerCase()).length-1
            let numCharsCorr = correction.filter((corr) => { return corr.letter.toLowerCase() == letter.toLowerCase() }).length
            if (numCharsCorr + 1 >  numChars) {
                let numReplaced = 0 
                correction.forEach((corr) => {
                    if (corr.letter.toLowerCase() == letter.toLowerCase() && numReplaced <= numCharsCorr - numChars) {
                        corr.color = "red"
                    }
                })
            }
            correction.push({
                id: index,
                letter: letter,
                color: "green"
            })
        } else if (corrWord.toLowerCase().includes(letter.toLowerCase())) {
            let numChars = corrWord.toLowerCase().split(letter.toLowerCase()).length-1
            let numCharsCorr = correction.filter((corr) => { return corr.letter.toLowerCase() == letter.toLowerCase() }).length
            if (numChars >= numCharsCorr) {
                correction.push({
                    id: index,
                    letter: letter,
                    color: "yellow"
                })
            } else {
                correction.push({
                    id: index,
                    letter: letter,
                    color: "red"
                })
            }
        } else {
            correction.push({
                id: index,
                letter: letter,
                color: "red"
            })
        }
    })
    $(".inputField").each((index, elem) => {
        if (elem.value != "") {
            elem.disabled = true;
        } else {
            if (empty == 0) $(elem).focus()
            if (empty < 5) {
                elem.disabled = false;
            } else {
                elem.disabled = true;
            }
            empty++;
        }
    })
    if (corrWord == word) {
        $(".inputField").each((index, elem) => {
            elem.disabled = true;
        })
        alert("Du hast gewonnen! Nächste Runde in 5 Sekunden.");
        setTimeout(() => {
            initGame();
        }, 5000)
    } else {
        if (empty == 0) {
            $(".inputField").each((index, elem) => {
                elem.disabled = true;
            })
            alert("Du hast verloren! Nächste Runde in 5 Sekunden. Das korrekte Wort wäre " + wordList.data[rightWord] + " gewesen.")
            setTimeout(() => {
                initGame();
            }, 5000)
        }
    }
    empty = 0
    return correction
}

/**
 * 
 * @param {Array} correction 
 * @param {any} row
 */
function reveal(correction, row) {
    correction.forEach((corr) => {
        // console.log(corr)
        if(row.children[corr.id].value != corr.letter) {
            // alert("Plis hep me curaption");
            $(".errors").text("Korruption! Bitte lade die Seite neu.")
        }
        row.children[corr.id].style.backgroundColor = corr.color;
    })
}


function initGame() {
    // reset everything
    console.clear()
    $(".errors").text("Wordle Deutsch")
    $(".inputField").each((index, elem) => {
        elem.value = "";
        elem.style.backgroundColor = "white";
    })
    // set the first row to be active and the rest to be disabled
    $(".inputField").each((index, elem) => {
        if (index < 5) {
            elem.disabled = false;
        } else {
            elem.disabled = true;
        }
    })
    // set the first input field to be active
    $(".inputField").first().focus()
    // set the word
    initWordlist().then((data) => {
        wordList = data
        rightWord = selectWord()
    })
    .catch((err) => {
        console.error(err)
    })
}

initGame()
