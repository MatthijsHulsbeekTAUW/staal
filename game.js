let speler = { naam: "", groep: 4, modus: "", score: 0 };
let huidigeWoorden = [];
let woordIndex = 0;
let geselecteerdeCategorieen = [];
let sterrenTeller = 0;

// Bij het laden van de pagina direct opgeslagen gegevens ophalen
window.onload = function() {
    const opgeslagenNaam = localStorage.getItem('staal_naam');
    const opgeslagenGroep = localStorage.getItem('staal_groep');
    const opgeslagenHighScore = localStorage.getItem('staal_highscore') || 0;

    if (opgeslagenNaam) document.getElementById('student-name').value = opgeslagenNaam;
    if (opgeslagenGroep) document.getElementById('student-group').value = opgeslagenGroep;
    document.getElementById('high-score-display').innerText = `🏆 Persoonlijk Record: ${opgeslagenHighScore} punten`;

    // Toetsenbord koppelen aan invoervelden (functie uit keyboard.js)
    setupInputListeners();
};

async function startSpel() {
    const naamInput = document.getElementById('student-name').value.trim();
    if (!naamInput) return alert("Vul eerst je naam in!");
    
    speler.naam = naamInput;
    speler.groep = parseInt(document.getElementById('student-group').value);
    speler.modus = document.getElementById('game-mode').value;
    speler.score = 0;
    sterrenTeller = 0;

    localStorage.setItem('staal_naam', speler.naam);
    localStorage.setItem('staal_groep', speler.groep);

    try {
        const response = await fetch(`groep${speler.groep}.json?v=${Date.now()}`);
        if (!response.ok) throw new Error("Bestand kon niet worden geladen");
        huidigeWoorden = await response.json();
    } catch (error) {
        console.error(error);
        return alert(`Oeps! Er ging iets mis met het inladen van groep${speler.groep}.json.`);
    }

    huidigeWoorden.sort(() => Math.random() - 0.5);
    woordIndex = 0;

    document.getElementById('display-name').innerText = speler.naam;
    document.getElementById('display-group').innerText = `Groep ${speler.groep}`;
    document.getElementById('display-score').innerText = speler.score;
    document.getElementById('display-stars').innerText = "⭐ " + sterrenTeller;
    document.getElementById('display-word-count').innerText = `1 / ${MAX_WOORDEN_PER_RONDE}`;

    document.getElementById('screen-intake').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');

    bouwCategorieKaart();
    laadWoord();
}

function bouwCategorieKaart() {
    const container = document.getElementById('category-container');
    container.innerHTML = "";
    geselecteerdeCategorieen = [];

    let maxCategorie = speler.groep === 4 ? 12 : (speler.groep === 5 ? 19 : 28);

    for (let i = 1; i <= maxCategorie; i++) {
        const card = document.createElement('div');
        card.className = "cat-card";
        card.innerHTML = `
            <div class="cat-number">${i}</div>
            <div class="cat-sprite" style="${getSpriteStyle(i)}"></div>
            <div class="cat-name">${staalCategorieMapping[i]}</div>
        `;
        card.onclick = () => selecteerCategorie(i, card);
        container.appendChild(card);
    }
}

function selecteerCategorie(nummer, element) {
    if (geselecteerdeCategorieen.includes(nummer)) {
        geselecteerdeCategorieen = geselecteerdeCategorieen.filter(n => n !== nummer);
        element.classList.remove('selected');
    } else {
        geselecteerdeCategorieen.push(nummer);
        element.classList.add('selected');
    }
}

function laadWoord() {
    const huidigWoordObj = huidigeWoorden[woordIndex];

    document.getElementById('input-syllables').value = "";
    document.getElementById('feedback-box').className = "feedback";
    document.getElementById('check-btn').style.display = "inline-block";
    document.getElementById('next-btn').style.display = "none";
    document.getElementById('custom-keyboard').style.display = "block";
    
    document.querySelectorAll('.cat-card').forEach(el => el.classList.remove('selected'));
    geselecteerdeCategorieen = [];

    const inputWord = document.getElementById('input-word');
    const inputSyllables = document.getElementById('input-syllables');

    if (speler.modus === 'oefen') {
        document.getElementById('oefen-controls').style.display = "block";
        document.getElementById('dictee-controls').style.display = "none";
        document.getElementById('show-word').innerText = huidigWoordObj.woord;
        actiefInputVeld = inputSyllables;
        inputSyllables.classList.add('input-highlight');
        if (inputWord) inputWord.classList.remove('input-highlight');
    } else {
        document.getElementById('oefen-controls').style.display = "none";
        document.getElementById('dictee-controls').style.display = "block";
        if (inputWord) inputWord.value = "";
        actiefInputVeld = inputWord;
        if (inputWord) inputWord.classList.add('input-highlight');
        if (inputSyllables) inputSyllables.classList.remove('input-highlight');
        spreekWoordUit();
    }
}

function spreekWoordUit() {
    const huidigWoord = huidigeWoorden[woordIndex].woord;
    const utterance = new SpeechSynthesisUtterance(huidigWoord);
    utterance.lang = 'nl-NL';
    utterance.rate = 0.85; 
    window.speechSynthesis.speak(utterance);
}

function controleerAntwoord() {
    const huidigWoordObj = huidigeWoorden[woordIndex];
    let verdiendePunten = 0;
    let foutenLijst = [];
    let allesGoed = true;

    if (speler.modus === 'dictee') {
        const getyptWoord = document.getElementById('input-word').value.trim().toLowerCase();
        if (getyptWoord === huidigWoordObj.woord.toLowerCase()) {
            verdiendePunten += 50;
        } else {
            allesGoed = false;
            foutenLijst.push(`Spelling van het woord (moest zijn: <strong>${huidigWoordObj.woord}</strong>)`);
        }
    }

    const uniekeCorrecteCat = [...new Set(huidigWoordObj.categorieen)].sort();
    const gekozenCat = [...geselecteerdeCategorieen].sort();
    let catFout = uniekeCorrecteCat.length !== gekozenCat.length || !uniekeCorrecteCat.every((v, i) => v === gekozenCat[i]);

    if (!catFout) {
        verdiendePunten += 30;
    } else {
        allesGoed = false;
        const correcteNamen = uniekeCorrecteCat.map(num => `${num} (${staalCategorieMapping[num]})`);
        foutenLijst.push(`Spellingscategorieën (moest zijn: <strong>${correcteNamen.join(', ')}</strong>)`);
    }

    const getypteSyllables = document.getElementById('input-syllables').value.trim().toLowerCase();
    if (getypteSyllables === huidigWoordObj.klankgroepen.toLowerCase()) {
        verdiendePunten += 20;
    } else {
        allesGoed = false;
        foutenLijst.push(`Klankgroepen ophakken (moest zijn: <strong>${huidigWoordObj.klankgroepen}</strong>)`);
    }

    if (allesGoed) {
        verdiendePunten += 50; 
        sterrenTeller += 1;
    }

    speler.score += verdiendePunten;
    document.getElementById('display-score').innerText = speler.score;
    document.getElementById('display-stars').innerText = "⭐ " + sterrenTeller;

    const feedbackBox = document.getElementById('feedback-box');
    if (allesGoed) {
        feedbackBox.className = "feedback correct";
        feedbackBox.innerHTML = `🎉 <strong>FANTASTISCH!</strong> Alles is in één keer goed!<br>⭐ Je verdient de maximale <strong>+${verdiendePunten} punten</strong>!`;
    } else {
        feedbackBox.className = "feedback wrong";
        let feedbackTekst = `👍 Goed geprobeerd! Je hebt toch <strong>+${verdiendePunten} punten</strong> verdiend.<br><br>Kijk goed naar de verbeteringen:<br>`;
        foutenLijst.forEach(fout => { feedbackTekst += `• ${fout}<br>`; });
        feedbackBox.innerHTML = feedbackTekst;
    }

    document.getElementById('check-btn').style.display = "none";
    document.getElementById('custom-keyboard').style.display = "none";
    document.getElementById('next-btn').style.display = "inline-block";
}

function volgendWoord() {
    woordIndex++;

    if (woordIndex >= MAX_WOORDEN_PER_RONDE) {
        beëindigRonde();
    } else {
        document.getElementById('display-word-count').innerText = `${woordIndex + 1} / ${MAX_WOORDEN_PER_RONDE}`;
        laadWoord();
    }
}

function beëindigRonde() {
    const huidigeHighScore = parseInt(localStorage.getItem('staal_highscore') || 0);
    let isNieuwRecord = false;

    if (speler.score > huidigeHighScore) {
        localStorage.setItem('staal_highscore', speler.score);
        isNieuwRecord = true;
    }

    alert(`🎉 Goed gedaan! Je hebt de oefening van 20 woorden afgerond.\n\nBehaalde score: ${speler.score} punten.\n${isNieuwRecord ? '🏆 NIEUW PERSOONLIJK RECORD!' : ''}`);
    
    window.location.reload();
}
