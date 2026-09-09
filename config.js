const staalCategorieMapping = {
    1: "Hakwoord", 2: "Zingwoord", 3: "Luchtwoord", 4: "Plankwoord",
    5: "Eer-oor-eur-woord", 6: "Aai-ooi-oei-woord", 7: "Eeuw-ieuw-woord", 8: "Langermaakwoord",
    9: "Voorvoegsel", 10: "Klankgroepenwoord", 11: "Verkleinwoord", 12: "Achtervoegsel",
    13: "Kilowoord", 14: "Komma-s-woord", 15: "Centwoord", 16: "Komma-s-meervoud",
    17: "Politiewoord", 18: "Colawoord", 19: "Tropisch woord", 20: "Taxiwoord",
    21: "Chefwoord", 22: "Theewoord", 23: "Caféwoord", 24: "Cadeauwoord",
    25: "Routewoord", 26: "Garagewoord", 27: "Trema-meervoud", 28: "Trema-woord"
};

const MAX_WOORDEN_PER_RONDE = 20;

function bepaalMaxCategorie(groep, blok) {
    if (groep === 4) {
        if (blok <= 2) return 3;
        if (blok <= 4) return 6;
        if (blok <= 6) return 9;
        return 12;
    }
    if (groep === 5) {
        if (blok <= 2) return 14;
        if (blok <= 4) return 16;
        if (blok <= 6) return 18;
        return 19;
    }
    if (groep === 6) {
        if (blok <= 2) return 21;
        if (blok <= 4) return 24;
        if (blok <= 6) return 26;
        return 28;
    }
    return 12;
}

function getSpriteStyle(num) {
    const imgUrl = "categoriekaart.webp";
    let left, top, width, height;

    if (num <= 19) {
        const col = (num - 1) % 4;
        const row = Math.floor((num - 1) / 4);
        width = 6.5; height = 11.2;
        left = 6.8 + col * (6.5 + 0.9); top = 8.3 + row * (11.2 + 1.6);
    } else {
        const idx = num - 20; const col = idx % 3; const row = Math.floor(idx / 3);
        width = 14.8; height = 25.8;
        left = 45.3 + col * (14.8 + 2.3); top = 8.3 + row * (25.8 + 2.4);
    }

    const bgSizeX = (100 / width) * 100; const bgSizeY = (100 / height) * 100;
    const bgPosX = (left / (100 - width)) * 100; const bgPosY = (top / (100 - height)) * 100;
    return `background-image: url('${imgUrl}'); background-size: ${bgSizeX}% ${bgSizeY}%; background-position: ${bgPosX}% ${bgPosY}%;`;
}