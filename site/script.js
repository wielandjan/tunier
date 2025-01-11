const datenAuswahl = document.getElementById("daten-auswahl");
const turnierName = document.getElementById("turnier-name");
const tableBody = document.querySelector("#turnier-tabelle tbody");

// Funktion zum Laden und Anzeigen der Daten
function ladeTurnierDaten(datei) {
  fetch(datei)
    .then((response) => response.json())
    .then((data) => {
      turnierName.textContent = data.turnierName;
      tableBody.innerHTML = ""; // Tabelle leeren

      data.spiele.forEach((spiel) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${spiel.nr}</td>
          <td>${spiel.beginn}</td>
          <td>${spiel.heim}</td>
          <td>${spiel.gast}</td>
          <td>${spiel.ergebnis || "-"}</td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Daten:", error);
      tableBody.innerHTML =
        '<tr><td colspan="5">Daten konnten nicht geladen werden.</td></tr>';
    });
}

// Standardmäßig erste Datei laden
ladeTurnierDaten(datenAuswahl.value);

// Eventlistener für Dropdown-Auswahl
datenAuswahl.addEventListener("change", () => {
  ladeTurnierDaten(datenAuswahl.value);
});
