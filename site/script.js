// JSON-Datei laden
fetch("turnierdaten.json")
  .then((response) => response.json())
  .then((data) => {
    // Header-Daten einfügen
    document.getElementById("titel").textContent = data.titel;
    document.getElementById("untertitel").textContent = data.untertitel;
    document.getElementById("datum").textContent = `Am ${data.datum}`;
    document.getElementById(
      "details"
    ).textContent = `Beginn: ${data.beginn} | Spielzeit: ${data.spielzeit} | Pause: ${data.pause}`;

    // Mannschaften in Gruppen anzeigen
    const gruppenContainer = document.getElementById("gruppen");
    for (const [gruppe, teams] of Object.entries(data.gruppen)) {
      const gruppeDiv = document.createElement("div");
      gruppeDiv.innerHTML = `
        <h3>Gruppe ${gruppe}</h3>
        <ol>${teams.map((team) => `<li>${team}</li>`).join("")}</ol>
      `;
      gruppenContainer.appendChild(gruppeDiv);
    }

    // Spielplan einfügen
    const spieleTabelle = document.getElementById("spiele");
    data.spiele.forEach((spiel) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${spiel.nr}</td>
        <td>${spiel.gruppe}</td>
        <td>${spiel.beginn}</td>
        <td>${spiel.heim}</td>
        <td>${spiel.gast}</td>
        <td>${spiel.ergebnis || "-"}</td>
      `;
      spieleTabelle.appendChild(row);
    });
  })
  .catch((error) => console.error("Fehler beim Laden der Daten:", error));
