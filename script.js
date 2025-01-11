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
    console.log("Turnierdetails geladen:", data); // Debugging: Daten anzeigen

    // Header-Daten
    document.getElementById("titel").textContent = data.titel;
    document.getElementById("untertitel").textContent = data.untertitel;
    document.getElementById("datum").textContent = `Am ${data.datum}`;
    document.getElementById("details").innerHTML = `
      Beginn: <strong>${data.beginn}</strong> Uhr |
      Spielzeit: <strong>${data.spielzeit}</strong> min |
      Pause: <strong>${data.pause}</strong> min
    `;

    // Initialisiere Mannschaften
    const mannschaften = {}; // Variable muss hier deklariert werden

    console.log("Mannschaften vor Initialisierung:", mannschaften);

    Object.entries(data.gruppen).forEach(([gruppenName, teams]) => {
      teams.forEach((team) => {
        if (!mannschaften[team.name]) {
          console.log(`Initialisiere ${team.name} mit 0 Punkten und Toren.`);
        } else {
          console.error(
            `${team.name} war bereits initialisiert:`,
            mannschaften[team.name]
          );
        }
        mannschaften[team.name] = { punkte: 0, tore: 0 }; // Setze Punkte und Tore
      });
    });

    console.log("Mannschaften nach Initialisierung:", mannschaften);

    // Spielplan laden und Punkte/Tore berechnen
    fetch("spielplan.json?v=" + new Date().getTime())
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP-Fehler bei spielplan.json: ${response.status}`);
        }
        return response.json();
      })
      .then((spielplanData) => {
        console.log("Spielplan geladen:", spielplanData); // Debugging: Spielplan anzeigen

        // Berechne Punkte und Tore basierend auf dem Spielplan
        spielplanData.spielplan.forEach((spiel) => {
          console.log(`Verarbeite Spiel: ${spiel.heim} vs ${spiel.gast}`); // Debugging: Spielinfo
          if (spiel.ergebnis && spiel.ergebnis.includes(":")) {
            const [toreHeim, toreGast] = spiel.ergebnis.split(":").map(Number);

            console.log(
              `Ergebnis: ${toreHeim} - ${toreGast} (Heim: ${spiel.heim}, Gast: ${spiel.gast})`
            ); // Debugging: Tore

            if (!isNaN(toreHeim) && !isNaN(toreGast)) {
              mannschaften[spiel.heim].tore += toreHeim;
              mannschaften[spiel.gast].tore += toreGast;

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
                )}, Gast (${spiel.gast}): ${JSON.stringify(
                  mannschaften[spiel.gast]
                )}`
              ); // Debugging: Aktuelle Werte
            } else {
              console.error(`Ungültiges Ergebnis: ${spiel.ergebnis}`); // Debugging: Fehler
            }
          }
        });

        console.log("Endergebnisse der Mannschaften:", mannschaften); // Debugging: Endergebnisse

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
