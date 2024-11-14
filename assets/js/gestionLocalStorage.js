import { getTimeCounters, getFormattedTime } from "./fonctions.js";

export const loadSessions = () => {
    return JSON.parse(localStorage.getItem('sessionsEntrainement')) || [];
};

const sauvegarderSession = (sessionData) => {
    const sessions = loadSessions(); // Charger les sessions existantes
    sessions.push(sessionData); // Ajouter la nouvelle session
    localStorage.setItem('sessionsEntrainement', JSON.stringify(sessions)); // Sauvegarder toutes les sessions dans le localStorage
};

// Fonction à appeler à la fin de l'entraînement pour sauvegarder les données de la session actuelle
export const finaliserEntrainement = (tempsList, reposList, distance) => {
    const sessionData = {
        session: loadSessions().length + 1, // Définir le numéro de la session
        timestamp: new Date().toLocaleDateString("fr-FR"), // Horodatage de la session
        temps: tempsList, // Copier les temps de course de la session actuelle
        attente: reposList, // Copier les temps d'attente de la session actuelle
        distance : distance// Enregistre la distance
    };

    sauvegarderSession(sessionData); // Sauvegarder cette session
    console.log("Session d'entraînement sauvegardée :", sessionData);
};

// Fonction pour convertir les données des sessions en CSV
export const convertirEnCSV = (sessions) => {
    // Crée une première ligne d'entêtes avec les clés de session
    const entetes = ["Session", "Timestamp", "Temps", "Attente", "Distance"];
    
    // Créer un tableau de lignes pour chaque session
    const lignes = sessions.flatMap(session => {
        // Pour chaque session, créer une ligne pour chaque temps de chrono
        return session.temps.map((temps, index) => {
            const attente = index === 0 ? "" : session.attente[index - 1] || ""; // Mettre "" pour le premier temps
            return [
                session.session, // Session
                session.timestamp, // Timestamp
                getFormattedTime({ ...getTimeCounters(temps), separation: ":" }), // Temps
                getFormattedTime({ ...getTimeCounters(attente), separation: ":" }), // Attente (vide pour le premier temps)
                session.distance // Distance
            ].join(","); // Sépare les valeurs par des virgules
        });
    });

    // Combine les entêtes et les lignes en une seule chaîne de texte
    return [entetes.join(","), ...lignes].join("\n");
};


// Fonction pour télécharger les données des sessions en CSV
export const downloadCSV = () => {
    const sessions = loadSessions(); // Charger les sessions
    const csvData = convertirEnCSV(sessions); // Convertir en CSV

    // Créer un objet Blob avec les données CSV
    const blob = new Blob([csvData], { type: 'text/csv' });

    // Créer un lien temporaire pour le téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sessions_entrainement.csv'; // Nom du fichier à télécharger

    // Simuler un clic sur le lien pour lancer le téléchargement
    link.click();

    // Libérer l'URL créée après le téléchargement
    URL.revokeObjectURL(url);
    // Demander à l'utilisateur s'il veut supprimer les anciennes données
    if (confirm("Voulez-vous supprimer les anciennes données après le téléchargement ?")) {
        localStorage.removeItem('sessionsEntrainement'); // Supprimer les données de sessions
        console.log("Les anciennes données ont été supprimées.");
    }
};