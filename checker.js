function controleerAntwoord() {
    const huidigWoordObj = geologicalWord = huidigeWoorden[woordIndex];
    let verdiendePunten = 0;
    let foutenLijst = [];
    let allesGoed = true;

    // Reset eventuele eerdere foutmarkeringen op kaarten
    document.querySelectorAll('.cat-card.wrong-selection, .cat-card.missing-selection, .cat-card.correct-selection')
        .forEach(c => c.classList.remove('wrong-selection', 'missing-selection', 'correct-selection'));

    const kindZegtSamenstelling = gameState.isSamenstellingGekozen;
    const isEchtSamenstelling = huidigWoordObj.samenstelling ? true : false;
    
    // 1. Controle samenstelling-keuze
    if (kindZegtSamenstelling === isEchtSamenstelling) {
        verdiendePunten += 30;
    } else {
        allesGoed = false;
        foutenLijst.push(isEchtSamenstelling ? "Dit woord is een **samenstelling** (vergeet de ster niet!)." : "Dit woord is **géén** samenstelling.");
    }

    // 2. Controle van de hakstreep (Alleen verplicht bij samenstelling)
    const grensIndexEcht = isEchtSamenstelling && huidigWoordObj.delen ? huidigWoordObj.delen[0].woord.length - 1 : -1;
    const grensIndexKind = gameState.actieveHakStrepen.length > 0 ? gameState.actieveHakStrepen[0] : -1;

    if (isEchtSamenstelling) {
        if (kindZegtSamenstelling && grensIndexKind === grensIndexEcht) {
            verdiendePunten += 30;
            gameState.hakStreepStatus = { index: grensIndexEcht, correct: true };
        } else {
            allesGoed = false;
            foutenLijst.push(`De splitsing klopte niet.`);
            // EIS: Rood streepje getoond tussen de letters waar het streepje had moeten staan
            gameState.hakStreepStatus = { index: grensIndexEcht, correct: false };
        }
    } else {
        verdiendePunten += 30;
        if (kindZegtSamenstelling && grensIndexKind !== -1) {
            allesGoed = false;
            gameState.hakStreepStatus = { index: grensIndexKind, correct: false };
        } else {
            gameState.hakStreepStatus = null;
        }
    }

    // 3. Geavanceerde Categorieën Controle met diepe analyse (Te veel / te weinig)
    if (isEchtSamenstelling && kindZegtSamenstelling && huidigWoordObj.delen) {
        const analyseDeel0 = analyseerCategorieFouten(huidigWoordObj.delen[0].categorieen, gameState.categorieenDeel0, huidigWoordObj.delen[0].woord);
        const analyseDeel1 = analyseerCategorieFouten(huidigWoordObj.delen[1].categorieen, gameState.categorieenDeel1, huidigWoordObj.delen[1].woord);
        window.analyseResult = {
            isSamenstelling: true,
            grensIndexEcht: grensIndexEcht,
            deel0: analyseDeel0,
            deel1: analyseDeel1
        };
        if (analyseDeel0.correct) { verdiendePunten += 20; } else { allesGoed = false; foutenLijst.push(analyseDeel0.bericht); }
        if (analyseDeel1.correct) { verdiendePunten += 20; } else { allesGoed = false; foutenLijst.push(analyseDeel1.bericht); }
    } else if (isEchtSamenstelling && !kindZegtSamenstelling && huidigWoordObj.delen) {
        const alleCorrecteCategorieen = huidigWoordObj.categorieen || [...(huidigWoordObj.delen[0].categorieen || []), ...(huidigWoordObj.delen[1].categorieen || [])];
        const analyseGewoon = analyseerCategorieFouten(alleCorrecteCategorieen, gameState.categorieenDeel0, huidigWoordObj.woord);
        window.analyseResult = {
            isSamenstelling: false,
            grensIndexEcht: grensIndexEcht,
            deel0: analyseGewoon
        };
        allesGoed = false;
    } else {
        // Gewoon woord checken
        const analyseGewoon = analyseerCategorieFouten(huidigWoordObj.categorieen, gameState.categorieenDeel0, huidigWoordObj.woord);
        window.analyseResult = {
            isSamenstelling: false,
            grensIndexEcht: -1,
            deel0: analyseGewoon
        };
        if (analyseGewoon.correct) { verdiendePunten += 40; } else { allesGoed = false; foutenLijst.push(analyseGewoon.bericht); }
    }

    // 4. Bonus bij foutloos
    if (allesGoed) {
        verdiendePunten += 50; 
        sterrenTeller += 1;
    }

    speler.score += verdiendePunten;
    document.getElementById('display-score').innerText = speler.score;
    document.getElementById('display-stars').innerText = "⭐ " + sterrenTeller;

    const feedbackBox = document.getElementById('feedback-box');
    const wordContainer = document.getElementById('interactive-word-container');
    const categoryLabel = document.getElementById('category-label');

    // Hide old feedback box
    feedbackBox.style.display = 'none';

    // Reset previous error state
    wordContainer.classList.remove('validation-error');
    categoryLabel.classList.remove('validation-error');
    categoryLabel.innerHTML = 'Klik op de spellingscategorieën:';

    // Markeer gecontroleerd en render interactief woord voor visuele feedback
    gameState.isGecontroleerd = true;
    renderInteractiefWoord();

    document.getElementById('check-btn').style.display = "none";
    document.getElementById('samenstelling-toggle-btn').style.display = "none";
    document.getElementById('next-btn').style.display = "inline-block";
}

// EIS: Diepe analysefunctie om te controleren of kaarten te veel of te weinig zijn aangeklikt
function analyseerCategorieFouten(correcteLijst, gekozenLijst, woordLabel) {
    const correctUnique = [...new Set(correcteLijst)].sort();
    const gekozenUnique = [...new Set(gekozenLijst)].sort();

    const teWeinig = correctUnique.filter(x => !gekozenUnique.includes(x));
    const teVeel = gekozenUnique.filter(x => !correctUnique.includes(x));
    const goedGekozen = gekozenUnique.filter(x => correctUnique.includes(x));

    // Highlight correct categories (green)
    goedGekozen.forEach(num => {
        const card = document.getElementById(`cat-card-${num}`);
        if (card) card.classList.add('correct-selection');
    });

    // Highlight wrong categories (extra selections)
    teVeel.forEach(num => {
        const card = document.getElementById(`cat-card-${num}`);
        if (card) {
            card.classList.remove('correct-selection');
            card.classList.add('wrong-selection');
        }
    });

    // Highlight missing categories (not selected)
    teWeinig.forEach(num => {
        const card = document.getElementById(`cat-card-${num}`);
        if (card && !card.classList.contains('correct-selection') && !card.classList.contains('wrong-selection')) {
            card.classList.add('missing-selection');
        }
    });

    if (teWeinig.length === 0 && teVeel.length === 0) {
        return { correct: true, teWeinig: [], teVeel: [], goedGekozen };
    }

    let bericht = `Categorieën bij **${woordLabel}** kloppen niet: `;
    let subBerichten = [];

    if (teWeinig.length > 0) {
        const namenWeinig = teWeinig.map(n => `**${n} (${staalCategorieMapping[n]})**`);
        subBerichten.push(`je bent deze kaart(en) nog **vergeten**: ${namenWeinig.join(', ')}`);
    }
    if (teVeel.length > 0) {
        const namenVeel = teVeel.map(n => `**${n} (${staalCategorieMapping[n]})**`);
        subBerichten.push(`je hebt deze kaart(en) **te veel** aangeklikt: ${namenVeel.join(', ')}`);
    }

    bericht += subBerichten.join(' én ');
    return { correct: false, bericht, teWeinig, teVeel, goedGekozen };
}