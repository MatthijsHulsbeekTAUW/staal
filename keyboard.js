let actiefInputVeld = null; // Houdt bij of we in het spellingveld of klankgroepenveld typen

function setupInputListeners() {
    const inputWord = document.getElementById('input-word');
    const inputSyllables = document.getElementById('input-syllables');

    // Zet standaard focus op het eerste logische invoerveld
    actiefInputVeld = inputWord;
    if (inputWord) inputWord.classList.add('input-highlight');

    if (inputWord) {
        inputWord.onclick = function() {
            actiefInputVeld = inputWord;
            inputWord.classList.add('input-highlight');
            if (inputSyllables) inputSyllables.classList.remove('input-highlight');
        };
    }

    if (inputSyllables) {
        inputSyllables.onclick = function() {
            actiefInputVeld = inputSyllables;
            inputSyllables.classList.add('input-highlight');
            if (inputWord) inputWord.classList.remove('input-highlight');
        };
    }
}

// Virtueel toetsenbord logica
function pressKey(letter) {
    if (!actiefInputVeld) return;

    if (letter === 'backspace') {
        actiefInputVeld.value = actiefInputVeld.value.slice(0, -1);
    } else {
        actiefInputVeld.value += letter;
    }
}
