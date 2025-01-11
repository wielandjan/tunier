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
    // Header-Daten
    document.getElementById("titel").textContent = data.titel;
    document.getElementById("untertitel").textContent = data.untertitel;
    document.getElementById("datum").textContent = `Am ${data.datum}`;
    document.getElementById("details").innerHTML = `
      Beginn: <strong>${data.beginn}</strong> Uhr |
      Spielzeit: <strong>${data.spielzeit}</strong> min |
      Pause: <strong>${data.pause}</strong> min
    `;

    // Gruppen erstellen
    const gruppenContainer = document.getElementById("gruppen-container");
    Object.entries(data.gruppen).forEach(([gruppenName, mannschaften]) => {
      const gruppeDiv = document.createElement("div");
      gruppeDiv.className = "gruppe";

      let tabelleHTML = `
        <table>
          <thead>
            <tr>
              <th colspan="2">${gruppenName}</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Extrahiere die Namen der Mannschaften aus den Objekten
      mannschaften.forEach((team, index) => {
        tabelleHTML += `
          <tr>
            <td>${index + 1}.</td>
            <td>${team.name}</td>
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
    console.error("Fehler beim Laden der Turnierdetails:", error)
  );

// Spielplan laden
fetch("spielplan.json?v=" + new Date().getTime())
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP-Fehler bei spielplan.json: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const spielplanContainer = document.getElementById("spielplan-container");
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

    data.spielplan.forEach((spiel) => {
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
  .catch((error) => console.error("Fehler beim Laden des Spielplans:", error));
