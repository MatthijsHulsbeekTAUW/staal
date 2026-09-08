let speler = { naam: "", groep: 4, modus: "", score: 0 };
let huidigeWoorden = [];
let woordIndex = 0;
let geselecteerdeCategorieen = [];
let sterrenTeller = 0;

// Officiële namen van de Staal-categorieën (1 t/m 28)
const staalCategorieMapping = {
    1: "Hakwoord", 2: "Zingwoord", 3: "Luchtwoord", 4: "Plankwoord",
    5: "Eer-oor-eur-woord", 6: "Aai-ooi-oei-woord", 7: "Eeuw-ieuw-woord", 8: "Langermaakwoord",
    9: "Voorvoegsel", 10: "Klankgroepenwoord", 11: "Verkleinwoord", 12: "Achtervoegsel",
    13: "Kilowoord", 14: "Komma-s-woord", 15: "Centwoord", 16: "Komma-s-meervoud",
    17: "Politiewoord", 18: "Colawoord", 19: "Tropisch woord", 20: "Taxiwoord",
    21: "Chefwoord", 22: "Theewoord", 23: "Caféwoord", 24: "Cadeauwoord",
    25: "Routewoord", 26: "Garagewoord", 27: "Trema-meervoud", 28: "Trema-woord"
};

// Functie die de exacte CSS-achtergrondpositie berekent uit de Heutink-afbeelding
function getSpriteStyle(num) {
    const imgUrl = "categoriekaart.webp";
    let left, top, width, height;

    if (num <= 19) {
        const col = (num - 1) % 4;
        const row = Math.floor((num - 1) / 4);
        width = 6.5; 
        height = 11.2;
        left = 6.8 + col * (6.5 + 0.9);
        top = 8.3 + row * (11.2 + 1.6);
    } else {
        const idx = num - 20;
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        width = 14.8;
        height = 25.8;
        left = 45.3 + col * (14.8 + 2.3);
        top = 8.3 + row * (25.8 + 2.4);
    }

    const bgSizeX = (100 / width) * 100;
    const bgSizeY = (100 / height) * 100;
    const bgPosX = (left / (100 - width)) * 100;
    const bgPosY = (top / (100 - height)) * 100;

    return `background-image: url('${imgUrl}'); background-size: ${bgSizeX}% ${bgSizeY}%; background-position: ${bgPosX}% ${bgPosY}%;`;
}

// Laad de gekozen JSON-woordenlijst asynchroon in
async function startSpel() {
    const naamInput = document.getElementById('student-name').value.trim();
    if (!naamInput) return alert("Vul eerst je naam in!");
    
    speler.naam = naamInput;
    speler.groep = parseInt(document.getElementById('student-group').value);
    speler.modus = document.getElementById('game-mode').value;
    speler.score = 0;
    sterrenTeller = 0;

    try {
        // Cache Busting: De toevoeging van ?v= zorgt ervoor dat de browser altijd de nieuwste file ophaalt
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
    if (woordIndex >= huidigeWoorden.length) {
        huidigeWoorden.sort(() => Math.random() - 0.5);
        woordIndex = 0;
    }

    const huidigWoordObj = huidigeWoorden[woordIndex];

    document.getElementById('input-syllables').value = "";
    document.getElementById('feedback-box').className = "feedback";
    document.getElementById('check-btn').style.display = "inline-block";
    document.getElementById('next-btn').style.display = "none";
    
    document.querySelectorAll('.cat-card').forEach(el => el.classList.remove('selected'));
    geselecteerdeCategorieen = [];

    if (speler.modus === 'oefen') {
        document.getElementById('oefen-controls').style.display = "block";
        document.getElementById('dictee-controls').style.display = "none";
        document.getElementById('show-word').innerText = huidigWoordObj.woord;
    } else {
        document.getElementById('oefen-controls').style.display = "none";
        document.getElementById('dictee-controls').style.display = "block";
        document.getElementById('input-word').value = "";
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

    // 1. Controle spelling (Alleen bij dicteemodus) - Waarde: 50 punten
    if (speler.modus === 'dictee') {
        const getyptWoord = document.getElementById('input-word').value.trim().toLowerCase();
        if (getyptWoord === huidigWoordObj.woord.toLowerCase()) {
            verdiendePunten += 50;
        } else {
            allesGoed = false;
            foutenLijst.push(`Spelling van het woord (moest zijn: <strong>${huidigWoordObj.woord}</strong>)`);
        }
    }

    // 2. Controle categorieën - Waarde: 30 punten
    // Met [...new Set()] filteren we dubbele invoer (zoals 2x cat 10 bij co-la) automatisch uit de databasevergelijking
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

    // 3. Controle klankgroepen - Waarde: 20 punten
    const getypteSyllables = document.getElementById('input-syllables').value.trim().toLowerCase();
    if (getypteSyllables === huidigWoordObj.klankgroepen.toLowerCase()) {
        verdiendePunten += 20;
    } else {
        allesGoed = false;
        foutenLijst.push(`Klankgroepen ophakken (moest zijn: <strong>${huidigWoordObj.klankgroepen}</strong>)`);
    }

    // 4. Bonus berekening bij een foutloze ronde
    if (allesGoed) {
        verdiendePunten += 50; 
        sterrenTeller += 1;
    }

    // Totaalscore bijwerken
    speler.score += verdiendePunten;
    document.getElementById('display-score').innerText = speler.score;
    document.getElementById('display-stars').innerText = "⭐ " + sterrenTeller;

    // Feedbackbox invullen voor de leerling
    const feedbackBox = document.getElementById('feedback-box');
    if (allesGoed) {
        feedbackBox.className = "feedback correct";
        feedbackBox.innerHTML = `🎉 <strong>FANTASTISCH!</strong> Alles is in één keer goed!<br>⭐ Je verdient de maximale <strong>+${verdiendePunten} punten</strong>!`;
    } else {
        feedbackBox.className = "feedback wrong";
        let feedbackTekst = `👍 Goed geprobeerd! Je hebt toch <strong>+${verdiendePunten} punten</strong> verdiend.<br><br>Kijk goed naar wat je nog kunt verbeteren:<br>`;
        foutenLijst.forEach(fout => {
            feedbackTekst += `• ${fout}<br>`;
        });
        feedbackBox.innerHTML = feedbackTekst;
    }

    document.getElementById('check-btn').style.display = "none";
    document.getElementById('next-btn').style.display = "inline-block";
}

function volgendWoord() {
    woordIndex++;
    laadWoord();
}
