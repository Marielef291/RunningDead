// Fonction pour obtenir les valeurs actuelles des minutes, secondes et centièmes depuis elapsedTime
export const getTimeCounters = (elapsedTime) => {
    const min = Math.floor(elapsedTime / 60000);
    const sec = Math.floor((elapsedTime % 60000) / 1000);
    const centi = Math.floor((elapsedTime % 1000) / 10);
    return { min, sec, centi };
};

// Fonction pour formater les compteurs en une chaîne de caractères
export const getFormattedTime = ({ min, sec, centi, separation = "." }) => {
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}${separation}${String(centi).padStart(2, '0')}`;
};