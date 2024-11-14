import { loadSessions, finaliserEntrainement, downloadCSV } from "./gestionLocalStorage.js";
import { getTimeCounters, getFormattedTime } from "./fonctions.js";
import { startCountdown, play, resetChrono, requestID, elapsedTime } from "./chronoLogic.js";
console.log("Bienvenue sur Running Dead !");


const firstPage = document.getElementById("parametres")
const chronoPage = document.getElementById("chrono")
const resultPage = document.getElementById("resultats")
const enAttente = document.getElementById("enAttente")
const troisSeconde = document.getElementById("troisSeconde")
const decompteToAccueil = document.getElementById("decompteToAccueil")
const chronoToAccueil = document.getElementById("chronoToAccueil")


const dataObject = {};
let isZombieSuccessif;

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
        document.getElementById('zombiesuccessif').checked = savedData.zombiesuccessif === 'on';
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

    if (!formData.has('zombiesuccessif')) {
        formData.append('zombiesuccessif', 'off');
    }
    formData.append('theme', document.getElementById('theme').checked ? true : false);

    formData.forEach((value, key) => {
        dataObject[key] = value;
    });

   isZombieSuccessif = dataObject.zombiesuccessif == "on" ? true : false;
    localStorage.setItem("ParamRunDead", JSON.stringify(dataObject));
    chrono();
});

/////////////////////////////
////////// ATTENTE //////////
/////////////////////////////

const precSprint = document.getElementById("precSprint");
const reposList = []
const reposAffich = document.getElementById("reposAffich");
// const isZombieSuccessif = dataObject.zombiesuccessif == "on" ? true : false;


function getRandomIntInclusive(min, max) {
    return (Math.random() * (max - min)) + min;
}

const tempsAttente = async () => {
    return new Promise((resolve) => {
        // console.log(dataObject.zombiesuccessif);
        console.log(isZombieSuccessif);
        let tpsRepos;
        precSprint.innerHTML = getFormattedTime(getTimeCounters(tempsList[tempsList.length - 1]));
        if (reposList.length >=1){
            reposAffich.innerHTML = ` avec un temps de repos de ${getFormattedTime(getTimeCounters(reposList[reposList.length - 1]))}`;
        }

        const isSuccessif = Math.random() < 0.5
        console.log(isSuccessif);
        if (isZombieSuccessif && isSuccessif){
            tpsRepos = 0;
            isZombieSuccessif = false
        }else{
            tpsRepos = getRandomIntInclusive(parseInt(dataObject.tpsReposCourse, 10), parseInt(dataObject.tpsReposCoursemax, 10))
        }
        

        const tpsReposMillis = tpsRepos * 60 * 1000; // Convertit en millisecondes
        const formattedTime = getFormattedTime(getTimeCounters(tpsReposMillis));

        console.log(`Temps de repos : ${formattedTime}`);
        reposList.push(`${tpsReposMillis}`)
        setTimeout(() => {
            resolve(); // Résout la promesse après le délai d'attente
        }, 10 * 1000); // Attente de 10 secondes <=== CHANGER ICI POUR LES TESTS
    });
};


////////////////////////////
////////// CHRONO //////////
////////////////////////////

const stopbutton = document.getElementById("stop");
const minute = document.getElementById("minute");
const seconde = document.getElementById("sec");
const centiSeconde = document.getElementById("msec");
const bg = document.getElementById("outer-circle");

let tempsList = []; 
let isChronoRunning = false;



decompteToAccueil.addEventListener("click", () => retourAccueil());
chronoToAccueil.addEventListener("click", () => retourAccueil());

const chrono = async () => {
    isChronoRunning = true; // Le chronomètre est actif

    firstPage.style.display = "none";
    troisSeconde.style.display = "block";
    await startCountdown();
    troisSeconde.style.display = "none";

    for (let i = 0; i < dataObject.nbCourse; i++) {
        if (!isChronoRunning) break; // Vérifie si le chrono est toujours actif

        chronoPage.style.display = "block";
        await play(dataObject, stopbutton, bg, minute, seconde, centiSeconde, tempsList);
        chronoPage.style.display = "none";
        
        if (i !== dataObject.nbCourse - 1 && isChronoRunning) {
            enAttente.style.display = "block";
            await tempsAttente();
            if (i === 0) {
                chronoToAccueil.style.display = "none"; 
            }
            enAttente.style.display = "none";
        }
    }

    if (isChronoRunning) { // Afficher les résultats seulement si le chrono est actif
        finaliserEntrainement(tempsList, reposList, dataObject.distance);
        affichageResulat();
        resultPage.style.display = "block";
        chronoToAccueil.style.display = "block";
    }
    isChronoRunning = false; // Chrono terminé
};



const retourAccueil = () => {
    isChronoRunning = false; // Arrête le chronomètre
    // Arrête les timers en cours et réinitialise le chronomètre
    cancelAnimationFrame(requestID); // Annule le frame request pour le chronomètre
    // Réinitialise les éléments d'affichage
    resetChrono(minute, seconde, centiSeconde);

    // Remet à zéro le décompte (dans startCountdown, si on avait un intervalle en cours)
    const countdownElement = document.getElementById("decompte");
    if (countdownElement) {
        countdownElement.innerText = "3"; // Remet le décompte à 3 secondes
    }

    // Réinitialiser les listes de temps de repos
    tempsList.length = 0;
    reposList.length = 0;  // Réinitialiser les temps de repos pour éviter les doublons

    troisSeconde.style.display = "none";
    firstPage.style.display = "block";
    chronoPage.style.display = "none";
    resultPage.style.display = "none";
}



//////////////////////////////
////////// RESULTAT //////////
//////////////////////////////

const listeResultats = document.getElementById("listeResultats");

const createLigneAffichage = (type, className = "", text="") => {
    const ligne = document.createElement(type);
    ligne.className = className;
    ligne.innerText = text;
    return ligne;
};

const affichageResulat = () => {
    // Calcul du total de temps en millisecondes
    const totalMillis = tempsList.reduce((total, time) => total + time, 0);
    
    tempsList.forEach((time, i) => {
        const li = createLigneAffichage("li","lap-item")

        const number = createLigneAffichage("span", "number", `#${i + 1}`)

        const timeStamp = createLigneAffichage ("span","time-stamp", getFormattedTime(getTimeCounters(time)));

        li.append(number, timeStamp);
        listeResultats.append(li);
    });

    const moyenneMillis = getFormattedTime(getTimeCounters(totalMillis / tempsList.length));

    // Calcul de la vitesse moyenne en km/h
    const tempsTotalSecondes = totalMillis / 1000;
    const distanceTotale = dataObject.distance * tempsList.length;
    const vitesseMoyenne = ((distanceTotale / tempsTotalSecondes) * 3.6).toFixed(2);

    // Calcul du rythme en min/km
    const tempsTotalMinutes = totalMillis / (1000 * 60);
    const distanceTotaleKm = distanceTotale / 1000;
    const rythmeMinParKm = (tempsTotalMinutes / distanceTotaleKm).toFixed(2);

    // Ajouter les résultats au DOM
    listeResultats.append(
        createLigneAffichage("li", "", `Temps moyen : ${moyenneMillis}`),
        createLigneAffichage("li", "", `Vitesse moyenne : ${vitesseMoyenne} km/h`),
        createLigneAffichage("li", "", `Rythme moyen : ${rythmeMinParKm} min/km`)
    );

    if (loadSessions().length > 15){
        console.log("Le nombre de sessions enregistré est suppérieur a 15!");

        document.getElementById("alerteLocalStorage").innerHTML = "Le nombre de sessions enregistré est suppérieur a 15!" 
    }

    const sessions = loadSessions();
    const dernieresSessions = sessions.length > 5 ? sessions.slice(-5) : sessions;

    const labels = dernieresSessions[0].temps.map((_, index) => `Tour ${index + 1}`);

    const datasets = dernieresSessions.map(session => ({
    label: `Session ${session.session}`,
    data: session.temps, // Garder les données en millisecondes pour le graphique
    borderWidth: 1,
    backgroundColor: `rgba(255, 0, 0, ${0.3 + 0.1 * (session.session % 5)})`, // Rouge avec une opacité variable
    borderColor: `rgba(255, 0, 0, ${0.5 + 0.1 * (session.session % 5)})`, // Bordure rouge avec une opacité variable
    
    }));

    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: datasets
    },
    options: {
        scales: {
        y: {
            beginAtZero: true,
            title: {
            display: true,
            text: 'Temps en millisecondes'
            }
        },
        x: {
            title: {
            display: true,
            text: 'Numéro de Tour'
            }
        }
        },
        responsive: true,
        plugins: {
        tooltip: {
            callbacks: {
            label: function(context) {
                // Convertir les millisecondes en format mm:ss:ms
                const time = context.raw;
                return getFormattedTime({ ...getTimeCounters(time), separation: ":" });
            }
            }
        },
        legend: {
            display: true,
            position: 'top'
        }
        }
    }
    });
};


// Empêcher le rechargement pendant que chrono() est actif
window.addEventListener('beforeunload', function(event) {
    if (isChronoRunning) {
        event.preventDefault();
        event.returnValue = ''; // Nécessaire pour certains navigateurs pour montrer l'alerte
    }
});

document.getElementById("recommencerButton").addEventListener("click", recommencer);

document.getElementById("telechargerDonnees").addEventListener("click", downloadCSV)


function recommencer() {
    tempsList.length = 0;
    reposList.length = 0;
    console.log(tempsList);
    console.log(reposList);
    listeResultats.innerHTML = "";
    document.getElementById("alerteLocalStorage").innerHTML ="";
    const divCanvas = document.getElementById("canvas");
    divCanvas.innerHTML = ""; // Efface le contenu existant de la div
    const canvas = document.createElement("canvas");
    canvas.id = "myChart";
    divCanvas.appendChild(canvas);
    firstPage.style.display = "block";
    resultPage.style.display = "none";
}
