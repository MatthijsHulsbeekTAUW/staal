function bouwCategorieKaart() {
    const container = document.getElementById('category-container');
    container.innerHTML = "";
    let maxCategorie = bepaalMaxCategorie(speler.groep, speler.blok);

    for (let i = 1; i <= maxCategorie; i++) {
        const card = document.createElement('div');
        card.className = "cat-card";
        card.id = `cat-card-${i}`;
        
        // Indeling met een linker- en rechterhelft voor een perfecte uitlijning met plaatje
        card.innerHTML = `
            <div class="cat-card-left">
                <div class="cat-number">${i}</div>
                <div class="cat-sprite" style="${getSpriteStyle(i)}"></div>
            </div>
            <div class="cat-name">${staalCategorieMapping[i]}</div>
        `;
        
        card.onclick = function() { selecteerCategorieCard(i); };
        container.appendChild(card);
    }
}

function selecteerCategorieCard(nummer) {
    let actieveLijst = gameState.huidigWoordDeelIndex === 0 ? gameState.categorieenDeel0 : gameState.categorieenDeel1;

    if (actieveLijst.includes(nummer)) {
        actieveLijst = actieveLijst.filter(n => n !== nummer);
    } else {
        actieveLijst.push(nummer);
    }

    if (gameState.huidigWoordDeelIndex === 0) { gameState.categorieenDeel0 = actieveLijst; } 
    else { gameState.categorieenDeel1 = actieveLijst; }

    renderInteractiefWoord();
    updateKaartGeselecteerdeStaten();
}

function updateKaartGeselecteerdeStaten() {
    document.querySelectorAll('.cat-card').forEach(el => {
        el.classList.remove('selected');
        el.classList.remove('wrong-selection');
    });
    let actieveLijst = gameState.huidigWoordDeelIndex === 0 ? gameState.categorieenDeel0 : gameState.categorieenDeel1;
    actieveLijst.forEach(num => {
        const card = document.getElementById(`cat-card-${num}`);
        if (card) card.classList.add('selected');
    });
}

function toggleSamenstelling() {
    const btn = document.getElementById('samenstelling-toggle-btn');
    const star = document.getElementById('samenstelling-star-indicator');
    
    gameState.isSamenstellingGekozen = !gameState.isSamenstellingGekozen;
    
    gameState.actieveHakStrepen = [];
    gameState.huidigWoordDeelIndex = 0;
    gameState.categorieenDeel0 = [];
    gameState.categorieenDeel1 = [];
    
    if (gameState.isSamenstellingGekozen) {
        btn.classList.add('active');
        star.classList.add('active');
        document.getElementById('current-instruction').innerHTML = "⭐ **Samenstelling!** Tik eerst tussen de letters om het woord in tweeën te hakken.";
    } else {
        btn.classList.remove('active');
        star.classList.remove('active');
        document.getElementById('current-instruction').innerText = "Klik onderaan op de categorieën die bij het woord horen.";
    }
    
    renderInteractiefWoord();
    updateKaartGeselecteerdeStaten();
}

function renderInteractiefWoord() {
    const container = document.getElementById('interactive-word-container');
    container.innerHTML = "";
    
    const woord = huidigeWoorden[woordIndex].woord;
    const letters = woord.split("");
    
    let grensIndex = gameState.isSamenstellingGekozen && gameState.actieveHakStrepen.length > 0 ? gameState.actieveHakStrepen[0] : -1;

    console.log('grensIndex:', grensIndex, 'categorieenDeel0:', gameState.categorieenDeel0);
    letters.forEach((letter, index) => {
        const letterBox = document.createElement('div');
        letterBox.className = "letter-box";
        letterBox.innerText = letter;
        
        if (gameState.isSamenstellingGekozen) {
            if (grensIndex !== -1) {
                if (index <= grensIndex) {
                    letterBox.style.backgroundColor = gameState.huidigWoordDeelIndex === 0 ? "#e0f2fe" : "#f1f5f9";
                    if (gameState.huidigWoordDeelIndex === 0) letterBox.style.borderColor = "var(--staal-blue)";
                } else {
                    letterBox.style.backgroundColor = gameState.huidigWoordDeelIndex === 1 ? "#d1fae5" : "#f1f5f9";
                    if (gameState.huidigWoordDeelIndex === 1) letterBox.style.borderColor = "#10b981";
                }
                
                letterBox.style.cursor = "pointer";
                letterBox.onclick = () => {
                    gameState.huidigWoordDeelIndex = index <= grensIndex ? 0 : 1;
                    document.getElementById('current-instruction').innerHTML = gameState.huidigWoordDeelIndex === 0 ? 
                        "👉 Geselecteerd: **Woorddeel 1** (Blauw). Kies onderaan de categorieën." : 
                        "👉 Geselecteerd: **Woorddeel 2** (Groen). Kies onderaan de categorieën.";
                    renderInteractiefWoord();
                    updateKaartGeselecteerdeStaten();
                };
            } else {
                letterBox.classList.add('active-part');
            }
        } else {
            letterBox.classList.add('active-part');
        }

        let actieveLijstVoorDitVakje = [];

        if (gameState.isSamenstellingGekozen && grensIndex !== -1) {
            if (index === grensIndex) { actieveLijstVoorDitVakje = gameState.categorieenDeel0; }
            if (index === letters.length - 1) { actieveLijstVoorDitVakje = gameState.categorieenDeel1; }
        } else {
            if (index === letters.length - 1) { actieveLijstVoorDitVakje = gameState.categorieenDeel0; }
        }

        if (actieveLijstVoorDitVakje && actieveLijstVoorDitVakje.length > 0) {
            const badgesContainer = document.createElement('div');
            badgesContainer.className = "mini-badges-container";
            
            // Render the selected categories as badges
            const result = (typeof window !== 'undefined' && window.analyseResult) ?
                (index === grensIndex ? window.analyseResult.deel0 :
                 index === letters.length - 1 ? window.analyseResult.deel1 : null) : null;

            actieveLijstVoorDitVakje.forEach((num, i) => {
                const badge = document.createElement('div');
                badge.className = 'mini-staal-badge';
                // Mark wrong selections (extra categories) red
                if (result && result.teVeel && result.teVeel.includes(num)) {
                    badge.classList.add('wrong-selection');
                }
                badge.innerText = num;
                badgesContainer.appendChild(badge);

                if (i < actieveLijstVoorDitVakje.length - 1) {
                    const comma = document.createElement('span');
                    comma.className = 'badge-comma';
                    comma.innerText = ',';
                    badgesContainer.appendChild(comma);
                }
            });

            // Append missing categories (not selected) in a distinct style
            if (result && result.teWeinig && result.teWeinig.length > 0) {
                // add a separator if there were selected badges before
                if (actieveLijstVoorDitVakje.length > 0) {
                    const sep = document.createElement('span');
                    sep.className = 'badge-comma';
                    sep.innerText = ',';
                    badgesContainer.appendChild(sep);
                }
                result.teWeinig.forEach((num, i) => {
                    const missBadge = document.createElement('div');
                    missBadge.className = 'mini-staal-badge missing-category';
                    missBadge.innerText = num;
                    badgesContainer.appendChild(missBadge);
                    if (i < result.teWeinig.length - 1) {
                        const comma = document.createElement('span');
                        comma.className = 'badge-comma';
                        comma.innerText = ',';
                        badgesContainer.appendChild(comma);
                    }
                });
            }
            
            letterBox.appendChild(badgesContainer);
        }

        container.appendChild(letterBox);

        if (index < letters.length - 1) {
            const splitZone = document.createElement('div');
            splitZone.className = "split-zone";
            splitZone.id = `split-zone-${index}`;
            
            if (gameState.actieveHakStrepen.includes(index)) {
                splitZone.classList.add('cut');
            }

            const line = document.createElement('div');
            line.className = "split-line-visual";
            splitZone.appendChild(line);

            if (gameState.isSamenstellingGekozen) {
                splitZone.classList.add('can-split');
                splitZone.onclick = () => {
                    if (gameState.actieveHakStrepen.includes(index)) {
                        gameState.actieveHakStrepen = [];
                        gameState.huidigWoordDeelIndex = 0;
                        document.getElementById('current-instruction').innerHTML = "⭐ Klik tussen de letters om de samenstelling te splitsen.";
                    } else {
                        gameState.actieveHakStrepen = [index];
                        gameState.huidigWoordDeelIndex = 0;
                    }
                    renderInteractiefWoord();
                    updateKaartGeselecteerdeStaten();
                };
            } else {
                splitZone.style.cursor = "default";
            }

            container.appendChild(splitZone);
        }
    });
}