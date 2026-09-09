let speler = { naam: "", groep: 4, blok: 1, modus: "oefen", score: 0, totaalWoorden: 0 };
let huidigeWoorden = [];
let woordIndex = 0;
let sterrenTeller = 0;

// Centrale staatopslag voor het actieve woord
let gameState = {
    isSamenstellingGekozen: false,
    huidigWoordDeelIndex: 0, // 0 voor deel 1, 1 voor deel 2
    categorieenDeel0: [],     // Gekozen categorieën voor deel 1
    categorieenDeel1: [],     // Gekozen categorieën voor deel 2
    actieveHakStrepen: []     // Indices van de tussenruimtes waar een streep staat
};

window.onload = function() {
    const opgeslagenNaam = localStorage.getItem('staal_naam');
    const opgeslagenGroep = localStorage.getItem('staal_groep');
    const opgeslagenBlok = localStorage.getItem('staal_blok');
    const opgeslagenHighScore = localStorage.getItem('staal_highscore') || 0;

    if (opgeslagenNaam) document.getElementById('student-name').value = opgeslagenNaam;
    if (opgeslagenGroep) document.getElementById('student-group').value = opgeslagenGroep;
    if (opgeslagenBlok) document.getElementById('student-block').value = opgeslagenBlok;
    document.getElementById('high-score-display').innerText = `🏆 Persoonlijk Record: ${opgeslagenHighScore} punten`;
};

async function startSpel() {
    const naamInput = document.getElementById('student-name').value.trim();
    if (!naamInput) return alert("Vul eerst je naam in!");
    
    speler.naam = naamInput;
    speler.groep = parseInt(document.getElementById('student-group').value);
    speler.blok = parseInt(document.getElementById('student-block').value);
    speler.score = 0;
    sterrenTeller = 0;

    localStorage.setItem('staal_naam', speler.naam);
    localStorage.setItem('staal_groep', speler.groep);
    localStorage.setItem('staal_blok', speler.blok);

    // Fullscreen (F11-effect) inschakelen
    const elem = document.documentElement;
    if (elem.requestFullscreen) { elem.requestFullscreen(); }
    else if (elem.webkitRequestFullscreen) { elem.webkitRequestFullscreen(); }

    let ruweWoordenlijst = [];
    try {
        const response = await fetch(`groep${speler.groep}.json?v=${Date.now()}`);
        if (!response.ok) throw new Error("Bestand kon niet worden geladen");
        ruweWoordenlijst = await response.json();
    } catch (error) {
        console.error(error);
        return alert(`Oeps! Er ging iets mis met het inladen van de woordenlijst.`);
    }

    const maxToegestaneCategorie = bepaalMaxCategorie(speler.groep, speler.blok);
    huidigeWoorden = ruweWoordenlijst.filter(w => w.categorieen.every(cat => cat <= maxToegestaneCategorie));

    if (huidigeWoorden.length === 0) { huidigeWoorden = ruweWoordenlijst; }

    huidigeWoorden.sort(() => Math.random() - 0.5);
    woordIndex = 0;
    speler.totaalWoorden = Math.min(MAX_WOORDEN_PER_RONDE, huidigeWoorden.length);

    document.getElementById('display-name').innerText = speler.naam;
    document.getElementById('display-group').innerText = `Groep ${speler.groep}`;
    document.getElementById('display-block').innerText = `Blok ${speler.blok}`;
    document.getElementById('display-score').innerText = speler.score;
    document.getElementById('display-stars').innerText = "⭐ " + sterrenTeller;
    document.getElementById('display-word-count').innerText = `1 / ${speler.totaalWoorden}`;

    document.getElementById('screen-intake').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');

    bouwCategorieKaart();
    laadWoord();
}

function laadWoord() {
    gameState.isSamenstellingGekozen = false;
    gameState.huidigWoordDeelIndex = 0;
    gameState.categorieenDeel0 = [];
    gameState.categorieenDeel1 = [];
    gameState.actieveHakStrepen = [];

    document.getElementById('feedback-box').className = "feedback";
    document.getElementById('check-btn').style.display = "inline-block";
    document.getElementById('next-btn').style.display = "none";
    
    const btn = document.getElementById('samenstelling-toggle-btn');
    const star = document.getElementById('samenstelling-star-indicator');
    btn.classList.remove('active');
    star.classList.remove('active');
    btn.style.display = "inline-block";

    document.getElementById('current-instruction').innerText = "Stap 1: Is dit een samenstelling? Klik dan rechts op de ster!";

    renderInteractiefWoord();
    updateKaartGeselecteerdeStaten();
    renderCategorieBadgesBovenWoord();
}

function volgendWoord() {
    woordIndex++;
    if (woordIndex >= speler.totaalWoorden) { 
        beëindigRonde(); 
    } else {
        document.getElementById('display-word-count').innerText = `${woordIndex + 1} / ${speler.totaalWoorden}`;
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

    alert(`🎉 Oefening voltooid, fantastisch gedaan!\n\nEindscore: ${speler.score} punten.\n${isNieuwRecord ? '🏆 NIEUW RECORD!' : ''}`);
    window.location.reload();
}