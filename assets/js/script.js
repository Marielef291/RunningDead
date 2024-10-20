console.log("hello world");

const firstPage = document.getElementById("parametres")
const chronoPage = document.getElementById("chrono")
const resultPage = document.getElementById("resultats")

document.addEventListener('DOMContentLoaded', function() {
    const savedData = JSON.parse(localStorage.getItem("ParamRunDead"));

    if (savedData) {
        // Appliquer les valeurs à chaque input du formulaire
        document.getElementById('nbCourse').value = savedData.nbCourse || '';
        document.getElementById('distance').value = savedData.distance || '';
        document.getElementById('tpsReposCourse').value = savedData.tpsReposCourse || '';
        document.getElementById('tpsReposCoursemax').value = savedData.tpsReposCoursemax || '';

        // Restaurer les cases à cocher avec une comparaison cohérente
        document.getElementById('son').checked = savedData.son === 'on';
        document.getElementById('zombiesuccesif').checked = savedData.zombiesuccesif === 'on';
        document.getElementById('theme').checked = savedData.theme === 'true';
        
        // Appliquer le thème sombre si nécessaire
        if (savedData.theme === 'true') {
            darkMode();  // Appelle la fonction pour activer le mode sombre
        }
    }
});

function darkMode() {
    let body = document.body;
    body.classList.toggle("dark-mode");
 }

document.getElementById('formQuestionnaire').addEventListener('submit', function(event) {
    event.preventDefault(); 
    const formData = new FormData(this);

    if (!formData.has('son')) {
        formData.append('son', 'off');
    }

    if (!formData.has('zombiesuccesif')) {
        formData.append('zombiesuccesif', 'off');
    }
    formData.append('theme', document.getElementById('theme').checked ? true : false);

    const dataObject = {};
    formData.forEach((value, key) => {
        dataObject[key] = value;
    });

    localStorage.setItem("ParamRunDead", JSON.stringify(dataObject));

    firstPage.style.display="none"
    chronoPage.style.display="block"

});
