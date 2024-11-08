console.log("hello world");

const firstPage = document.getElementById("parametres")
const chronoPage = document.getElementById("chrono")
const resultPage = document.getElementById("resultats")
const enAttente = document.getElementById("enAttente")
const troisSeconde = document.getElementById("troisSeconde")

const dataObject = {};


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

    formData.forEach((value, key) => {
        dataObject[key] = value;
    });

    localStorage.setItem("ParamRunDead", JSON.stringify(dataObject));

    chrono();

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////  3s de décompte ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const startCountdown = async () => {
    return new Promise((resolve) => {
        let countdownValue = 3; // Départ du compte à rebours
        const countdownElement = document.getElementById("decompte");

        countdownElement.innerText = countdownValue; // Affiche le début (3)

        const countdownInterval = setInterval(() => {
            countdownValue--; // Décrément du compte

            if (countdownValue > 0) {
                countdownElement.innerText = countdownValue; // Mise à jour de l'affichage
            } else {
                clearInterval(countdownInterval); // Arrête l'intervalle quand le décompte est terminé
                resolve(); // Résout la promesse lorsque le décompte est terminé
            }
        }, 1000); // Mise à jour toutes les secondes
    });
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////  CHRONO  //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const stopbutton = document.getElementById("stop");
const minute = document.getElementById("minute");
const seconde = document.getElementById("sec");
const centiSeconde = document.getElementById("msec");
const bg = document.getElementById("outer-circle");


let startTime, elapsedTime = 0;
let minCounter = 0;
let secCounter = 0;
let centiCounter = 0;
let requestID;
let tempsList = []; // Liste temporaire pour les temps



const enregistrerTemps = (temps) => {
    tempsList.push(temps); // Ajouter le temps dans la liste temporaire
};

// Fonction pour réinitialiser le chronomètre
const resetChrono = () => {
    elapsedTime = 0;
    minCounter = 0;
    secCounter = 0;
    centiCounter = 0;

    // Mettre à jour l'affichage
    minute.innerHTML = '00 :';
    seconde.innerHTML = '&nbsp;00 .';
    centiSeconde.innerHTML = '&nbsp;00';

};

// Fonction pour démarrer le chronomètre
const play = async () => {
    return new Promise((resolve) => {
        let audio
        if (dataObject.son == "on"){
            audio = new Audio("/assets/sono/bruitagesZombie.mp3");
        }
        else {
            audio = new Audio("/assets/sono/bipSonarRunningdead.mp3");
        }
        
        audio.play();
        stopbutton.disabled = true;
        let tpsDisabled;

        // Vérifie si distance est bien une valeur valide
        switch (dataObject.distance) { // Conversion en string si nécessaire
            case "50":
                tpsDisabled = 5;
                break;
            case "100":
                tpsDisabled = 10;
                break;
            case "150":
                tpsDisabled = 15;
                break;
            case "200":
                tpsDisabled = 20;
                break;
            default:
                console.error("Valeur de distance non valide :", distance);
                tpsDisabled = 0; // ou une valeur par défaut si distance est invalide
        }

        setTimeout(() => {
            stopbutton.disabled = false;
        }, tpsDisabled * 1000);

        bg.classList.add("animation-bg");

        // Définir l'heure de début en tenant compte du temps écoulé si en pause
        startTime = Date.now() - elapsedTime;

        // Fonction d'animation
        const updateTime = () => {
            elapsedTime = Date.now() - startTime;

            // Calculer les minutes, secondes et centièmes de seconde
            minCounter = Math.floor(elapsedTime / 60000);
            secCounter = Math.floor((elapsedTime % 60000) / 1000);
            centiCounter = Math.floor((elapsedTime % 1000) / 10);

            // Mettre à jour les affichages avec un format à deux chiffres
            minute.innerHTML = `${String(minCounter).padStart(2, '0')} :`;
            seconde.innerHTML = `&nbsp;${String(secCounter).padStart(2, '0')} .`;
            centiSeconde.innerHTML = `&nbsp;${String(centiCounter).padStart(2, '0')}`;

            // Boucler l'animation
            requestID = requestAnimationFrame(updateTime);
        };

        updateTime();

        // Écouteur pour arrêter le chrono et enregistrer le temps, puis résoudre la promesse
        stopbutton.addEventListener("click", () => {
            tempsList.push(`${String(minCounter).padStart(2, '0')}:${String(secCounter).padStart(2, '0')}.${String(centiCounter).padStart(2, '0')}`);
            console.log(tempsList);
            cancelAnimationFrame(requestID);
            bg.classList.remove("animation-bg");
            // audio.stop();
            resetChrono();
            resolve(); // Résout la promesse quand le chrono s'arrête
        }, { once: true }); // L'événement s'exécute une seule fois
    });
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////  ATTENTE //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const precSprint = document.getElementById("precSprint");


const tempsAttente = async () => {
    return new Promise((resolve) => {
        precSprint.innerHTML = tempsList[tempsList.length - 1];
        setTimeout(() => {
            
            resolve(); // Résout la promesse après le délai d'attente
        }, 10 * 1000); // Attente de 10 secondes
    });
};


const chrono = async () => {
    firstPage.style.display="none";
    troisSeconde.style.display="block";
    await startCountdown();
    troisSeconde.style.display="none";
    for (let i = 0; i < dataObject.nbCourse; i++) {
        chronoPage.style.display = "block";
        await play();
        chronoPage.style.display = "none";
        if (i != dataObject.nbCourse-1){
            enAttente.style.display = "block";
            await tempsAttente();
            enAttente.style.display = "none";
        }
    }
    affichageResulat();
    resultPage.style.display = "block"
    finaliserEntrainement(); // Appelle finaliserEntrainement après la fin de toutes les courses
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////  RESULTAT /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const listeResultats = document.getElementById("listeResultats")
const affichageResulat = () => {

    for (let i = 0; i < tempsList.length; i++){
        const li = document.createElement("li");
        const number = document.createElement("span");
        const timeStamp = document.createElement("span");

        li.setAttribute("class", "lap-item");
        number.setAttribute("class", "number");
        timeStamp.setAttribute("class", "time-stamp");

        number.innerText = `#${i+1}`;
        timeStamp.innerHTML = tempsList [i]
        li.append(number, timeStamp);
        listeResultats.append(li);
    }
}


const sauvegarderDansLocalStorage = () => {
    localStorage.setItem('tempsEntrainement', JSON.stringify(tempsList)); // Sauvegarde la liste complète dans le localStorage
};

// Fonction à appeler à la fin de l'entraînement
const finaliserEntrainement = () => {
    sauvegarderDansLocalStorage();
    console.log("Entraînement sauvegardé !");
};

// Événement pour sauvegarder les données en cas de fermeture ou de rechargement de la page
window.addEventListener("beforeunload", () => {
    sauvegarderDansLocalStorage();
});
