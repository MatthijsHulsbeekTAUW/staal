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
    if (gameState.isGecontroleerd) return;

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
    if (gameState.isGecontroleerd) return;

    document.querySelectorAll('.cat-card').forEach(el => {
        el.classList.remove('selected');
        el.classList.remove('wrong-selection');
        el.classList.remove('missing-selection');
        el.classList.remove('correct-selection');
    });
    let actieveLijst = gameState.huidigWoordDeelIndex === 0 ? gameState.categorieenDeel0 : gameState.categorieenDeel1;
    actieveLijst.forEach(num => {
        const card = document.getElementById(`cat-card-${num}`);
        if (card) card.classList.add('selected');
    });
}

function toggleSamenstelling() {
    if (gameState.isGecontroleerd) return;

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
    
    let grensIndex = -1;
    if (gameState.isGecontroleerd && window.analyseResult && window.analyseResult.isSamenstelling) {
        grensIndex = window.analyseResult.grensIndexEcht;
    } else if (gameState.isSamenstellingGekozen && gameState.actieveHakStrepen.length > 0) {
        grensIndex = gameState.actieveHakStrepen[0];
    }

    letters.forEach((letter, index) => {
        const letterBox = document.createElement('div');
        letterBox.className = "letter-box";
        letterBox.innerText = letter;
        
        if (gameState.isSamenstellingGekozen && !gameState.isGecontroleerd) {
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

        // Bepaal welke categorieën en analyse horen bij dit vakje
        let actieveLijstVoorDitVakje = [];
        let analyseVoorDitVakje = null;

        if (gameState.isGecontroleerd && window.analyseResult) {
            if (window.analyseResult.isSamenstelling) {
                if (index === window.analyseResult.grensIndexEcht) {
                    actieveLijstVoorDitVakje = gameState.categorieenDeel0;
                    analyseVoorDitVakje = window.analyseResult.deel0;
                } else if (index === letters.length - 1) {
                    actieveLijstVoorDitVakje = gameState.isSamenstellingGekozen ? gameState.categorieenDeel1 : gameState.categorieenDeel0;
                    analyseVoorDitVakje = window.analyseResult.deel1;
                }
            } else {
                if (index === letters.length - 1) {
                    actieveLijstVoorDitVakje = gameState.categorieenDeel0;
                    analyseVoorDitVakje = window.analyseResult.deel0;
                }
            }
        } else {
            if (gameState.isSamenstellingGekozen && grensIndex !== -1) {
                if (index === grensIndex) { actieveLijstVoorDitVakje = gameState.categorieenDeel0; }
                if (index === letters.length - 1) { actieveLijstVoorDitVakje = gameState.categorieenDeel1; }
            } else {
                if (index === letters.length - 1) { actieveLijstVoorDitVakje = gameState.categorieenDeel0; }
            }
        }

        const selectedCats = actieveLijstVoorDitVakje || [];
        const wrongCats = (analyseVoorDitVakje && analyseVoorDitVakje.teVeel) ? analyseVoorDitVakje.teVeel : [];
        const missingCats = (analyseVoorDitVakje && analyseVoorDitVakje.teWeinig) ? analyseVoorDitVakje.teWeinig : [];

        if (selectedCats.length > 0 || missingCats.length > 0) {
            const badgesContainer = document.createElement('div');
            badgesContainer.className = "mini-badges-container";

            const allBadges = [];
            selectedCats.forEach(num => {
                let badgeClass = 'mini-staal-badge';
                if (gameState.isGecontroleerd) {
                    badgeClass = wrongCats.includes(num) ? 'mini-staal-badge wrong-selection' : 'mini-staal-badge correct-selection';
                }
                allBadges.push({
                    num: num,
                    className: badgeClass
                });
            });
            missingCats.forEach(num => {
                allBadges.push({
                    num: num,
                    className: 'mini-staal-badge missing-category'
                });
            });

            allBadges.forEach((bItem, bIdx) => {
                const badge = document.createElement('div');
                badge.className = bItem.className;
                badge.innerText = bItem.num;
                badgesContainer.appendChild(badge);

                if (bIdx < allBadges.length - 1) {
                    const comma = document.createElement('span');
                    comma.className = 'badge-comma';
                    comma.innerText = ',';
                    badgesContainer.appendChild(comma);
                }
            });

            letterBox.appendChild(badgesContainer);
        }

        container.appendChild(letterBox);

        // Splitsingslijnen tussen de letters
        if (index < letters.length - 1) {
            const splitZone = document.createElement('div');
            splitZone.className = "split-zone";
            splitZone.id = `split-zone-${index}`;

            const line = document.createElement('div');
            line.className = "split-line-visual";
            splitZone.appendChild(line);

            if (gameState.isGecontroleerd) {
                splitZone.style.cursor = "default";
                if (gameState.hakStreepStatus && gameState.hakStreepStatus.index === index) {
                    splitZone.classList.add('cut');
                    if (gameState.hakStreepStatus.correct) {
                        splitZone.classList.add('correct-cut'); // GROEN
                    } else {
                        splitZone.classList.add('wrong-cut');   // ROOD op de plek waar het streepje had moeten staan!
                    }
                }
            } else {
                if (gameState.actieveHakStrepen.includes(index)) {
                    splitZone.classList.add('cut');
                }

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
            }

            container.appendChild(splitZone);
        }
    });
}