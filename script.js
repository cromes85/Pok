const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const output = document.getElementById('output');
const snapButton = document.getElementById('snap');

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
        // Vous pouvez traiter le texte pour extraire les informations nécessaires
        // Nom de la série, nom du Pokémon, niveau, ID, langue
        extraireInfos(text);
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

    console.log(infos);
    // Afficher ou utiliser les informations extraites
}
