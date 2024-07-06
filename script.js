const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const output = document.getElementById('output');
const snapButton = document.getElementById('snap');
const outputText = document.getElementById('output-text');

// Accéder à la caméra arrière du smartphone
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Erreur d'accès à la caméra : ", err);
    });

// Capturer la photo
snapButton.addEventListener('click', () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    output.src = dataUrl;

    // Analyser l'image (appel de la fonction pour extraire les informations)
    analyseImage(dataUrl);
});

function analyseImage(imageDataUrl) {
    // Utiliser un modèle de reconnaissance de texte OCR pour extraire les informations
    // Par exemple, Tesseract.js
    Tesseract.recognize(
        imageDataUrl,
        'eng', // Vous pouvez changer la langue ici
        {
            logger: m => console.log(m)
        }
    ).then(({ data: { text } }) => {
        console.log(text);
        outputText.textContent = text; // Afficher le texte reconnu
        // Vous pouvez traiter le texte pour extraire les informations nécessaires
        // Nom de la série, nom du Pokémon, niveau, ID, langue
        extraireInfos(text);
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

    // Traitement du texte ici pour remplir l'objet infos
    // Vous pouvez utiliser des expressions régulières pour identifier les différentes parties du texte
    console.log("Texte extrait : ", text);

    // Logique de traitement du texte pour extraire les infos
    // Ceci est un exemple simple, il peut nécessiter des ajustements en fonction du format de la carte
    const lines = text.split('\n');
    lines.forEach(line => {
        if (line.toLowerCase().includes('pokémon')) {
            infos.nom = line;
        }
        if (line.match(/Niveau\s+\d+/i)) {
            infos.niveau = line.match(/Niveau\s+\d+/i)[0];
        }
        if (line.match(/\d{3}\/\d{3}/)) {
            infos.id = line.match(/\d{3}\/\d{3}/)[0];
        }
        // Ajouter plus de logique selon le format de la carte
    });

    console.log(infos);
    // Afficher ou utiliser les informations extraites
}
