import { getTimeCounters, getFormattedTime } from "./fonctions.js";
// import NoSleep from '/../node_modules/nosleep.js/dist/NoSleep.js';
export let requestID;
export let elapsedTime = 0;

// let noSleep = new NoSleep();

export const startCountdown = async () => {
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

export const resetChrono = (minute, seconde, centiSeconde) => {
    elapsedTime = 0;  // Réinitialiser la variable globale `elapsedTime` ici.
    minute.innerHTML = '00 :';
    seconde.innerHTML = '&nbsp;00 .';
    centiSeconde.innerHTML = '&nbsp;00';
    return elapsedTime;
};

export const startChrono = (dataObject, stopbutton, bg) => {
    return new Promise((resolve) => {
        let audio;
        if (dataObject.son == "on") {
            audio = new Audio("./assets/sono/bruitagesZombie.mp3");
        } else {
            audio = new Audio("./assets/sono/bipSonarRunningdead.mp3");
        }
        audio.play();

        stopbutton.disabled = true;

        // Déterminer le temps de désactivation du bouton stop
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
                console.error("Valeur de distance non valide :", dataObject.distance);
                tpsDisabled = 0;
        }

        setTimeout(() => {
            stopbutton.disabled = false;
        }, tpsDisabled * 1000);

        bg.classList.add("animation-bg");

        resolve(Date.now()); // Retourne l'heure de départ pour le chrono
    });
};

export const updateChrono = (startTime, minute, seconde, centiSeconde) => {
    let elapsedTime = Date.now() - startTime; // Calculer l'écart de temps depuis le début

    const updateTime = () => {
        elapsedTime = Date.now() - startTime; // Mettre à jour l'elapsedTime en continu
        const timeCounters = getTimeCounters(elapsedTime);

        minute.innerHTML = `${String(timeCounters.min).padStart(2, '0')} :`;
        seconde.innerHTML = `&nbsp;${String(timeCounters.sec).padStart(2, '0')} .`;
        centiSeconde.innerHTML = `&nbsp;${String(timeCounters.centi).padStart(2, '0')}`;

        requestID = requestAnimationFrame(updateTime);
    };

    requestID = requestAnimationFrame(updateTime); // Démarre la mise à jour
    return elapsedTime; // Retourne l'elapsedTime initial pour l'utiliser ailleurs
};

export const stopChrono = (tempsList, stopbutton, bg, minute, seconde, centiSeconde, startTime) => {
    return new Promise((resolve) => {
        stopbutton.addEventListener("click", () => {
            const elapsedTime = Date.now() - startTime; // Calculer elapsedTime une dernière fois lors de l'arrêt
            tempsList.push(elapsedTime); // Sauvegarde le temps final
            cancelAnimationFrame(requestID); // Arrête l'animation
            bg.classList.remove("animation-bg");
            resetChrono(minute, seconde, centiSeconde); // Réinitialise l'affichage
            resolve(); // Résout la promesse pour signaler que le chrono est terminé
        }, { once: true });
    });
};

export const play = async (dataObject, stopbutton, bg, minute, seconde, centiSeconde, tempsList) => {
    const startTime = await startChrono(dataObject, stopbutton, bg); // Démarre le chrono
    updateChrono(startTime, minute, seconde, centiSeconde); // Met à jour en temps réel
    await stopChrono(tempsList, stopbutton, bg, minute, seconde, centiSeconde, startTime); // Attend l'arrêt du chrono
};



// export const retourAccueil = (isChronoRunning, minute, seconde, centiSeconde, firstPage, chronoPage, resultPage, troisSeconde) => {
//     isChronoRunning = false; // Arrête le chronomètre
//     // Arrête les timers en cours et réinitialise le chronomètre
//     cancelAnimationFrame(requestID); // Annule le frame request pour le chronomètre
//     elapsedTime = 0; // Réinitialise le temps écoulé

//     // Réinitialise les éléments d'affichage
//     resetChrono(minute, seconde, centiSeconde);

//     // Remet à zéro le décompte (dans startCountdown, si on avait un intervalle en cours)
//     const countdownElement = document.getElementById("decompte");
//     if (countdownElement) {
//         countdownElement.innerText = "3"; // Remet le décompte à 3 secondes
//     }

//     troisSeconde.style.display = "none";
//     firstPage.style.display = "block";
//     chronoPage.style.display = "none";
//     resultPage.style.display = "none";

// }
