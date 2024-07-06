const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const output = document.getElementById('output');
const snapButton = document.getElementById('snap');
const uploadInput = document.getElementById('upload');
const outputText = document.getElementById('output-text');
const cameraContainer = document.getElementById('camera-container');
let pokemonData = [];
let pokemonGen9Data = [];

// Charger les données JSON
Promise.all([
    fetch('pokemon_all.json').then(response => response.json()),
    fetch('pokemon_gen9.json').then(response => response.json())
]).then(([data1, data2]) => {
    pokemonData = data1;
    pokemonGen9Data = data2;
}).catch(error => console.error('Erreur de chargement des données JSON :', error));

// Fonction pour détecter si l'utilisateur est sur mobile
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Initialisation en fonction de l'appareil
if (isMobileDevice()) {
    // Accéder à la caméra arrière du smartphone
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Erreur d'accès à la caméra : ", err);
            cameraContainer.style.display = 'none'; // Masquer l'option caméra si erreur
        });
} else {
    // Masquer les options de la caméra si l'utilisateur est sur un PC
    cameraContainer.style.display = 'none';
}

// Capturer la photo
snapButton.addEventListener('click', () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    output.src = dataUrl;

    // Analyser l'image (appel de la fonction pour extraire les informations)
    analyseImage(dataUrl);
});

// Charger une image depuis l'ordinateur
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            output.src = dataUrl;

            // Analyser l'image (appel de la fonction pour extraire les informations)
            analyseImage(dataUrl);
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
});

function analyseImage(imageDataUrl) {
    // Utiliser un modèle de reconnaissance de texte OCR pour extraire les informations
    // Par exemple, Tesseract.js
    Tesseract.recognize(
        imageDataUrl,
        'eng', // Vous pouvez changer la langue ici
        {
            logger: m => console.log(m),
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:/-%' // Restreindre les caractères pour améliorer la précision
        }
    ).then(({ data: { text } }) => {
        console.log(text);
        outputText.textContent = text; // Afficher le texte reconnu
        // Vous pouvez traiter le texte pour extraire les informations nécessaires
        // Nom de la série, nom du Pokémon, niveau, ID, langue
        const infos = extraireInfos(text);
        afficherInfos(infos);
        comparerInfos(infos);
    }).catch(err => {
        console.error("Erreur de reconnaissance de texte : ", err);
    });
}

function extraireInfos(text) {
    // Exemple de traitement du texte pour extraire les informations
    const infos = {
        serie: null,
        nom: null,
        niveau: null,
        id: null,
        langue: null
    };

    console.log("Texte extrait : ", text);

    // Utilisation des expressions régulières pour extraire les informations
    const nomMatch = text.match(/(?:VSTAR|VMAX|V)?\s*([A-Z][a-z]+)/);
    const serieMatch = text.match(/(?:VSTAR|VMAX|V)/);
    const idMatch = text.match(/(\d{3}\/\d{3})/);
    const niveauMatch = text.match(/HP\s*(\d+)/);
    const langueMatch = text.match(/\b(Basic|Base)\b/);
    
    if (nomMatch) infos.nom = nomMatch[1];
    if (serieMatch) infos.serie = serieMatch[0];
    if (idMatch) infos.id = idMatch[1];
    if (niveauMatch) infos.niveau = `HP ${niveauMatch[1]}`;
    if (langueMatch) infos.langue = langueMatch[1] === "Basic" ? "Eng" : "Fr";
    
    console.log(infos);
    return infos;
}

function afficherInfos(infos) {
    outputText.innerHTML = `
        Série: ${infos.serie ? infos.serie : 'N/A'}<br>
        Nom: ${infos.nom ? infos.nom : 'N/A'}<br>
        Niveau: ${infos.niveau ? infos.niveau : 'N/A'}<br>
        ID: ${infos.id ? infos.id : 'N/A'}<br>
        Langue: ${infos.langue ? infos.langue : 'N/A'}
    `;
}

function comparerInfos(infos) {
    const result1 = pokemonData.find(pokemon => {
        return pokemon.name.fr.toLowerCase() === infos.nom.toLowerCase() || 
               pokemon.name.en.toLowerCase() === infos.nom.toLowerCase() || 
               pokemon.name.jp.toLowerCase() === infos.nom.toLowerCase();
    });

    const result2 = pokemonGen9Data.find(pokemon => {
        return pokemon.name.fr.toLowerCase() === infos.nom.toLowerCase() || 
               pokemon.name.en.toLowerCase() === infos.nom.toLowerCase() || 
               pokemon.name.jp.toLowerCase() === infos.nom.toLowerCase();
    });

    if (result1 || result2) {
        const result = result1 || result2;
        outputText.innerHTML += `<br><br>Match trouvé dans les données JSON :<br>
        Nom: ${result.name.fr}<br>
        ID Pokedex: ${result.pokedex_id}<br>
        Catégorie: ${result.category}<br>
        Type: ${result.types ? result.types.map(type => type.name).join(', ') : 'N/A'}`;
        if (result.sprites) {
            if (result.sprites.regular) {
                outputText.innerHTML += `<br><img src="${result.sprites.regular}" alt="Image de ${result.name.fr}" />`;
            }
            if (result.sprites.shiny) {
                outputText.innerHTML += `<br><img src="${result.sprites.shiny}" alt="Image shiny de ${result.name.fr}" />`;
            }
            if (result.sprites.gmax) {
                outputText.innerHTML += `<br><img src="${result.sprites.gmax}" alt="Image gmax de ${result.name.fr}" />`;
            }
        }
    } else {
        outputText.innerHTML += `<br><br>Aucun match trouvé dans les données JSON.`;
    }
}
