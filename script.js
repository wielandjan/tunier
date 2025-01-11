// Turnierdetails laden
fetch("turnierdetails.json?v=" + new Date().getTime())
  .then((response) => {
    if (!response.ok) {
      throw new Error(
        `HTTP-Fehler bei turnierdetails.json: ${response.status}`
      );
    }
    return response.json();
  })
  .then((data) => {
    console.log("Turnierdetails geladen:", data); // Debugging

    // Header-Daten
    document.getElementById("titel").textContent = data.titel;
    document.getElementById("untertitel").textContent = data.untertitel;
    document.getElementById("datum").textContent = `Am ${data.datum}`;
    document.getElementById("details").innerHTML = `
      Beginn: <strong>${data.beginn}</strong> Uhr |
      Spielzeit: <strong>${data.spielzeit}</strong> min |
      Pause: <strong>${data.pause}</strong> min
    `;

    // Initialisiere Mannschaften (ohne Werte aus der JSON-Datei)
    const mannschaften = {};
    Object.entries(data.gruppen).forEach(([gruppenName, teams]) => {
      teams.forEach((team) => {
        mannschaften[team.name] = { punkte: 0, tore: 0 }; // Setze Punkte und Tore auf 0
      });
    });
    console.log("Initialisierte Mannschaften:", mannschaften); // Debugging

    // Spielplan laden und Punkte/Tore berechnen
    fetch("spielplan.json?v=" + new Date().getTime())
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP-Fehler bei spielplan.json: ${response.status}`);
        }
        return response.json();
      })
      .then((spielplanData) => {
        console.log("Spielplan geladen:", spielplanData); // Debugging

        // Berechne Punkte und Tore basierend auf dem Spielplan
        spielplanData.spielplan.forEach((spiel) => {
          console.log(`Verarbeite Spiel: ${spiel.heim} vs ${spiel.gast}`); // Debugging
          if (spiel.ergebnis && spiel.ergebnis.includes(":")) {
            const [toreHeim, toreGast] = spiel.ergebnis.split(":").map(Number);

            if (!isNaN(toreHeim) && !isNaN(toreGast)) {
              // Tore aktualisieren
              mannschaften[spiel.heim].tore += toreHeim;
              mannschaften[spiel.gast].tore += toreGast;

              // Punkte aktualisieren
              if (toreHeim > toreGast) {
                mannschaften[spiel.heim].punkte += 3; // Heimsieg
              } else if (toreHeim < toreGast) {
                mannschaften[spiel.gast].punkte += 3; // Gastsieg
              } else {
                mannschaften[spiel.heim].punkte += 1; // Unentschieden
                mannschaften[spiel.gast].punkte += 1;
              }
            }
          }
        });

        console.log("Endergebnisse der Mannschaften:", mannschaften); // Debugging

        // Gruppen mit berechneten Punkten und Toren anzeigen
        const gruppenContainer = document.getElementById("gruppen-container");
        Object.entries(data.gruppen).forEach(([gruppenName, teams]) => {
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

          teams.forEach((team, index) => {
            const stats = mannschaften[team.name];
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
      })
      .catch((error) =>
        console.error("Fehler beim Laden des Spielplans:", error)
      );
  })
  .catch((error) =>
    console.error("Fehler beim Laden der Turnierdetails:", error)
  );
