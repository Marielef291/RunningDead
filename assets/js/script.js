console.log("Bienvenue sur Running Dead !");

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

//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////  3s de décompte /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
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



//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////  CHRONO  ////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
const stopbutton = document.getElementById("stop");
const minute = document.getElementById("minute");
const seconde = document.getElementById("sec");
const centiSeconde = document.getElementById("msec");
const bg = document.getElementById("outer-circle");

let startTime, elapsedTime = 0;
let requestID;
let tempsList = []; // Liste temporaire pour les temps


const enregistrerTemps = (temps) => {
    tempsList.push(temps); // Ajouter le temps dans la liste temporaire
};

// Fonction pour obtenir les valeurs actuelles des minutes, secondes et centièmes depuis elapsedTime
const getTimeCounters = (elapsedTime) => {
    const min = Math.floor(elapsedTime / 60000);
    const sec = Math.floor((elapsedTime % 60000) / 1000);
    const centi = Math.floor((elapsedTime % 1000) / 10);
    return { min, sec, centi };
};

// Fonction pour formater les compteurs en une chaîne de caractères
const getFormattedTime = ({ min, sec, centi }) => {
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(centi).padStart(2, '0')}`;
};

// Fonction pour réinitialiser le chronomètre
const resetChrono = () => {
    elapsedTime = 0;
    minute.innerHTML = '00 :';
    seconde.innerHTML = '&nbsp;00 .';
    centiSeconde.innerHTML = '&nbsp;00';
};

const play = async () => {
    return new Promise((resolve) => {
        let audio;
        if (dataObject.son == "on"){
            audio = new Audio("./assets/sono/bruitagesZombie.mp3");
        } else {
            audio = new Audio("./assets/sono/bipSonarRunningdead.mp3");
        }
        audio.play();
        stopbutton.disabled = true;
        let tpsDisabled;

        switch (dataObject.distance) {
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
                tpsDisabled = 0;
        }

        setTimeout(() => {
            stopbutton.disabled = false;
        }, tpsDisabled * 1000);

        bg.classList.add("animation-bg");
        startTime = Date.now() - elapsedTime;

        const updateTime = () => {
            elapsedTime = Date.now() - startTime;
            const timeCounters = getTimeCounters(elapsedTime);

            minute.innerHTML = `${String(timeCounters.min).padStart(2, '0')} :`;
            seconde.innerHTML = `&nbsp;${String(timeCounters.sec).padStart(2, '0')} .`;
            centiSeconde.innerHTML = `&nbsp;${String(timeCounters.centi).padStart(2, '0')}`;

            requestID = requestAnimationFrame(updateTime);
        };

        updateTime();

        stopbutton.addEventListener("click", () => {
            const finalTime = getFormattedTime(getTimeCounters(elapsedTime));
            tempsList.push(elapsedTime);
            cancelAnimationFrame(requestID);
            bg.classList.remove("animation-bg");
            resetChrono();
            resolve();
        }, { once: true });
    });
};

//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////  ATTENTE ////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
const precSprint = document.getElementById("precSprint");
const reposList = []
const reposAffich = document.getElementById("reposAffich");

function getRandomIntInclusive(min, max) {
    return (Math.random() * (max - min)) + min;
}

const tempsAttente = async () => {
    return new Promise((resolve) => {
        if (reposList.length === 0){
            precSprint.innerHTML = getFormattedTime(getTimeCounters(tempsList[tempsList.length - 1]));
        }else{
            precSprint.innerHTML = getFormattedTime(getTimeCounters(tempsList[tempsList.length - 1]));
            reposAffich.innerHTML = ` avec un temps de repos de ${getFormattedTime(getTimeCounters(reposList[reposList.length - 1]))}`;
        }

        //génération aléatoire du temps d'attente
        tpsRepos = getRandomIntInclusive(parseInt(dataObject.tpsReposCourse, 10), parseInt(dataObject.tpsReposCoursemax, 10))

        const tpsReposMillis = tpsRepos * 60 * 1000; // Convertit en millisecondes
        const timeCountersRepos = getTimeCounters(tpsReposMillis);
        const formattedTime = getFormattedTime(timeCountersRepos);

        // console.log(`Temps de repos en millisecondes : ${tpsReposMillis} ms`);
        console.log(`Temps de repos : ${formattedTime}`);
        reposList.push(`${tpsReposMillis}`)
        setTimeout(() => {
            resolve(); // Résout la promesse après le délai d'attente
        }, tpsReposMillis); // Attente de 10 secondes <=== CHANGER ICI POUR LES TESTS
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

//////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////  RESULTAT ///////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
const listeResultats = document.getElementById("listeResultats")
const affichageResulat = () => {
    // console.log(reposList);
    let totalMillis = 0;
    for (let i = 0; i < tempsList.length; i++){
        const li = document.createElement("li");
        const number = document.createElement("span");
        const timeStamp = document.createElement("span");

        li.setAttribute("class", "lap-item");
        number.setAttribute("class", "number");
        timeStamp.setAttribute("class", "time-stamp");

        number.innerText = `#${i+1}`;
        timeStamp.innerHTML = getFormattedTime(getTimeCounters(tempsList [i]))

        li.append(number, timeStamp);
        totalMillis += tempsList [i];

        listeResultats.append(li);
    }

    const moyenneMillis = getFormattedTime(getTimeCounters(totalMillis / dataObject.nbCourse));
    
    // Calcul de la vitesse moyenne en m/s
    const tempsTotalSecondes = totalMillis / 1000; // Temps total en secondes
    const distanceTotale = dataObject.distance * dataObject.nbCourse; // Distance totale en mètres
    const vitesseMoyenne = ((distanceTotale / tempsTotalSecondes)*3.6).toFixed(2); // km/h


    const tempsTotalMinutes = totalMillis / (1000 * 60); // Temps total en minutes
    const distanceTotaleKm = (dataObject.distance * dataObject.nbCourse) / 1000; // Distance totale en kilomètres
    // Calcul du rythme en min/km
    const rythmeMinParKm = (tempsTotalMinutes / distanceTotaleKm).toFixed(2); // min/km

    // Affichage du temps moyen
    const moyenneElem = document.createElement("li");
    moyenneElem.innerText = `Temps moyen : ${moyenneMillis}`;
    listeResultats.append(moyenneElem);

    // Affichage de la vitesse moyenne
    const vitesseElem = document.createElement("li");
    vitesseElem.innerText = `Vitesse moyenne : ${vitesseMoyenne} km/h`;
    listeResultats.append(vitesseElem);

    // Affichage de la rythme moyen
    const rythmeElem = document.createElement("li");
    rythmeElem.innerText = `Rythme moyen : ${rythmeMinParKm} min/km`;
    listeResultats.append(rythmeElem);
}


const sauvegarderDansLocalStorage = () => {
    localStorage.setItem('tempsEntrainement', JSON.stringify(tempsList)); // Sauvegarde la liste complète dans le localStorage
};

// Fonction à appeler à la fin de l'entraînement
const finaliserEntrainement = () => {
    sauvegarderDansLocalStorage();
    // console.log("Entraînement sauvegardé !");
};

// Événement pour sauvegarder les données en cas de fermeture ou de rechargement de la page
window.addEventListener("beforeunload", () => {
    sauvegarderDansLocalStorage();
});
