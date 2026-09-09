function controleerAntwoord() {
    const huidigWoordObj = geologicalWord = huidigeWoorden[woordIndex];
    let verdiendePunten = 0;
    let foutenLijst = [];
    let allesGoed = true;

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
    if (isEchtSamenstelling && kindZegtSamenstelling) {
        const letters = huidigWoordObj.woord.split("");
        let grensIndexEcht = huidigWoordObj.delen[0].woord.length - 1;
        let grensIndexKind = gameState.actieveHakStrepen.length > 0 ? gameState.actieveHakStrepen[0] : -1;

        const zoneElement = document.getElementById(`split-zone-${grensIndexKind}`);

        if (grensIndexKind === grensIndexEcht) {
            verdiendePunten += 30;
            if (zoneElement) zoneElement.classList.add('correct-cut'); // EIS: Wordt GROEN
        } else {
            allesGoed = false;
            foutenLijst.push(`De splitsing klopte niet (moest zijn: **${huidigWoordObj.delen[0].woord} | ${huidigWoordObj.delen[1].woord}**).`);
            
            // EIS: Kleur de foute lijn ROOD
            if (zoneElement) zoneElement.classList.add('wrong-cut');
            // Kleur de juiste lijn alsnog groen ter verbetering
            const correctZone = document.getElementById(`split-zone-${grensIndexEcht}`);
            if (correctZone) correctZone.classList.add('correct-cut');
        }
    } else {
        verdiendePunten += 30;
    }

    // 3. Geavanceerde Categorieën Controle met diepe analyse (Te veel / te weinig)
    if (isEchtSamenstelling && kindZegtSamenstelling && huidigWoordObj.delen) {
        // Deel 1 checken
        const analyseDeel0 = analyseerCategorieFouten(huidigWoordObj.delen[0].categorieen, gameState.categorieenDeel0, huidigWoordObj.delen[0].woord);
        if (analyseDeel0.correct) { verdiendePunten += 20; } else { allesGoed = false; foutenLijst.push(analyseDeel0.bericht); }

        // Deel 2 checken
        const analyseDeel1 = analyseerCategorieFouten(huidigWoordObj.delen[1].categorieen, gameState.categorieenDeel1, huidigWoordObj.delen[1].woord);
        if (analyseDeel1.correct) { verdiendePunten += 20; } else { allesGoed = false; foutenLijst.push(analyseDeel1.bericht); }
    } else {
        // Gewoon woord checken
        const analyseGewoon = analyseerCategorieFouten(huidigWoordObj.categorieen, gameState.categorieenDeel0, huidigWoordObj.woord);
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
    if (allesGoed) {
        feedbackBox.className = "feedback correct";
        feedbackBox.innerHTML = `🎉 **UITSTEKEND!** Alles is helemaal goed gedaan!<br>⭐ Je verdient **+${verdiendePunten} punten**!`;
    } else {
        feedbackBox.className = "feedback wrong";
        let feedbackTekst = `👍 Goed geprobeerd! Je scoort **+${verdiendePunten} punten**.<br><br>Kijk goed naar de foutenanalyse:<br>`;
        foutenLijst.forEach(fout => { feedbackTekst += `• ${fout}<br>`; });
        feedbackBox.innerHTML = feedbackTekst;
    }

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

    // EIS: Vuurrode kleur toewijzen aan de foute kaarten op de kaart onderaan
    teVeel.forEach(num => {
        const card = document.getElementById(`cat-card-${num}`);
        if (card) card.classList.add('wrong-selection');
    });

    if (teWeinig.length === 0 && teVeel.length === 0) {
        return { correct: true };
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
    return { correct: false, bericht: bericht };
}