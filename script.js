// Funktion zur Berechnung der Punkte und Tore
function berechnePunkteUndTore(gruppen, spielplan) {
  const mannschaften = {};

  // Initialisiere Punkte und Tore für jede Mannschaft
  console.log("Initialisiere Mannschaften...");
  Object.values(gruppen)
    .flat()
    .forEach((team) => {
      mannschaften[team.name] = { punkte: 0, tore: 0 }; // Setze Punkte und Tore auf 0
    });
  console.log("Nach Initialisierung:", JSON.stringify(mannschaften));

  // Ergebnisse aus dem Spielplan verarbeiten
  console.log("Starte Verarbeitung der Spielplan-Ergebnisse...");
  spielplan.forEach((spiel) => {
    console.log(`Verarbeite Spiel: ${JSON.stringify(spiel)}`);
    if (spiel.ergebnis && spiel.ergebnis.includes(":")) {
      // Überprüfe, ob ein gültiges Ergebnis vorliegt
      const [toreHeim, toreGast] = spiel.ergebnis.split(":").map(Number);

      if (!isNaN(toreHeim) && !isNaN(toreGast)) {
        console.log(`Valide Tore: Heim (${toreHeim}), Gast (${toreGast})`);

        // Tore aktualisieren
        mannschaften[spiel.heim].tore += toreHeim;
        mannschaften[spiel.gast].tore += toreGast;

        // Punkte basierend auf dem Ergebnis berechnen
        if (toreHeim > toreGast) {
          mannschaften[spiel.heim].punkte += 3; // Heimsieg
        } else if (toreHeim < toreGast) {
          mannschaften[spiel.gast].punkte += 3; // Gastsieg
        } else {
          mannschaften[spiel.heim].punkte += 1; // Unentschieden
          mannschaften[spiel.gast].punkte += 1;
        }
        console.log(
          `Nach Berechnung: Heim (${spiel.heim}): ${JSON.stringify(
            mannschaften[spiel.heim]
          )}, Gast (${spiel.gast}): ${JSON.stringify(mannschaften[spiel.gast])}`
        );
      }
    } else {
      console.log("Kein gültiges Ergebnis gefunden. Überspringe Spiel.");
    }
  });

  console.log("Endergebnis nach Berechnung:", JSON.stringify(mannschaften));
  return mannschaften;
}

// Turnierdetails und Spielplan laden
fetch("turnierdetails.json?v=" + new Date().getTime())
  .then((response) => response.json())
  .then((data) => {
    fetch("spielplan.json?v=" + new Date().getTime())
      .then((response) => response.json())
      .then((spielplanData) => {
        console.log("Geladene Turnierdetails:", JSON.stringify(data));
        console.log("Geladener Spielplan:", JSON.stringify(spielplanData));

        const punkteUndTore = berechnePunkteUndTore(
          data.gruppen,
          spielplanData.spielplan
        );

        // Gruppen anzeigen
        const gruppenContainer = document.getElementById("gruppen-container");
        Object.entries(data.gruppen).forEach(([gruppenName, mannschaften]) => {
          const gruppeDiv = document.createElement("div");
          gruppeDiv.className = "gruppe";

          let tabelleHTML = `
            <table>
              <thead>
                <tr>
                  <th>Nr.</th>
                  <th>Name</th>
                  <th>Punkte</th>
                  <th>Tore</th>
                </tr>
              </thead>
              <tbody>
          `;

          mannschaften.forEach((team, index) => {
            const stats = punkteUndTore[team.name];
            tabelleHTML += `
              <tr>
                <td>${index + 1}.</td>
                <td>${team.name}</td>
                <td>${stats.punkte}</td>
                <td>${stats.tore}</td>
              </tr>
            `;
          });

          tabelleHTML += `
              </tbody>
            </table>
          `;

          gruppeDiv.innerHTML = tabelleHTML;
          gruppenContainer.appendChild(gruppeDiv);
        });

        // Spielplan anzeigen
        const spielplanContainer = document.getElementById(
          "spielplan-container"
        );
        let spielplanHTML = `
          <table>
            <thead>
              <tr>
                <th>Nr.</th>
                <th>Beginn</th>
                <th>Feld</th>
                <th>Heim</th>
                <th>Gast</th>
                <th>Ergebnis</th>
              </tr>
            </thead>
            <tbody>
        `;

        spielplanData.spielplan.forEach((spiel) => {
          spielplanHTML += `
            <tr>
              <td>${spiel.nr}</td>
              <td>${spiel.beginn}</td>
              <td>${spiel.feld}</td>
              <td>${spiel.heim}</td>
              <td>${spiel.gast}</td>
              <td>${spiel.ergebnis}</td>
            </tr>
          `;
        });

        spielplanHTML += `
            </tbody>
          </table>
        `;

        spielplanContainer.innerHTML = spielplanHTML;
      })
      .catch((error) =>
        console.error("Fehler beim Laden des Spielplans:", error)
      );
  })
  .catch((error) =>
    console.error("Fehler beim Laden der Turnierdetails:", error)
  );
