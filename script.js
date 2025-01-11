// Funktionen zur Modularisierung

/**
 * Initialisiert die Mannschaften mit 0 Punkten und 0 Toren.
 * @param {Object} gruppen - Die Gruppen aus den Turnierdetails.
 * @param {Object} mannschaften - Das Objekt, das die Mannschaften speichert.
 */
function initializeTeams(gruppen, mannschaften) {
  Object.entries(gruppen).forEach(([gruppenName, teams]) => {
    teams.forEach((team) => {
      if (!mannschaften[team.name]) {
        mannschaften[team.name] = { punkte: 0, tore: 0 };
      }
    });
  });
}

/**
 * Berechnet die Ergebnisse basierend auf dem Spielplan.
 * @param {Array} spielplan - Das Array der Spiele.
 * @param {Object} mannschaften - Das Objekt, das die Mannschaften speichert.
 */
function calculateResults(spielplan, mannschaften) {
  spielplan.forEach((spiel) => {
    if (
      spiel.ergebnis &&
      spiel.ergebnis.includes(":") &&
      spiel.ergebnis.trim() !== ":"
    ) {
      const [toreHeim, toreGast] = spiel.ergebnis.split(":").map(Number);

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
      }
    }
  });
}

/**
 * Sortiert die Teams basierend auf Punkten, Toren und direkten Vergleich.
 * @param {Array} teams - Das Array der Teams in einer Gruppe.
 * @param {Object} mannschaften - Das Objekt, das die Mannschaften speichert.
 * @param {Array} spielplan - Das Array der Spiele, um direkte Vergleiche zu ermöglichen.
 * @returns {Array} - Das sortierte Array der Teams.
 */
function sortTeams(teams, mannschaften, spielplan) {
  return [...teams].sort((a, b) => {
    const teamA = mannschaften[a.name];
    const teamB = mannschaften[b.name];

    // Zuerst nach Punkten sortieren (absteigend)
    if (teamB.punkte !== teamA.punkte) {
      return teamB.punkte - teamA.punkte;
    }

    // Bei gleicher Punktzahl nach Toren sortieren (absteigend)
    if (teamB.tore !== teamA.tore) {
      return teamB.tore - teamA.tore;
    }

    // Direkter Vergleich (Head-to-Head)
    const spiel = spielplan.find(
      (s) =>
        (s.heim === a.name && s.gast === b.name) ||
        (s.heim === b.name && s.gast === a.name)
    );

    if (
      spiel &&
      spiel.ergebnis &&
      spiel.ergebnis.includes(":") &&
      spiel.ergebnis.trim() !== ":"
    ) {
      const [toreHeim, toreGast] = spiel.ergebnis.split(":").map(Number);
      if (spiel.heim === a.name) {
        if (toreHeim > toreGast) return -1;
        if (toreHeim < toreGast) return 1;
      } else {
        if (toreGast > toreHeim) return -1;
        if (toreGast < toreHeim) return 1;
      }
    }

    // Wenn immer noch gleich, Platzhalter oder zufällige Reihenfolge
    return 0;
  });
}

/**
 * Rendert die Gruppen-Tabellen.
 * @param {Object} gruppen - Die Gruppen aus den Turnierdetails.
 * @param {Object} mannschaften - Das Objekt, das die Mannschaften speichert.
 * @param {Array} spielplan - Das Array der Spiele, um direkte Vergleiche zu ermöglichen.
 */
function renderGroupTables(gruppen, mannschaften, spielplan) {
  const gruppenContainer = document.getElementById("gruppen-container");
  gruppenContainer.innerHTML = ""; // Leeren Sie den Container vor dem Rendern

  Object.entries(gruppen).forEach(([gruppenName, teams]) => {
    const gruppeDiv = document.createElement("div");
    gruppeDiv.className = "gruppe";

    const sortedTeams = sortTeams(teams, mannschaften, spielplan);

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

    sortedTeams.forEach((team, index) => {
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
}

/**
 * Rendert den Spielplan.
 * @param {Array} spielplan - Das Array der Spiele.
 */
function renderSpielplan(spielplan) {
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

  spielplan.forEach((spiel) => {
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
}

/**
 * Rendert die Endrunde.
 * @param {Object} endrunde - Die Endrunde aus der Endrunde-JSON.
 */
function renderEndrunde(endrunde) {
  const endrundeContainer = document.getElementById("endrunde-container");
  const { spiele, beginn, spielzeit, pause } = endrunde;

  let endrundeHTML = `
    <p>Beginn: ${beginn} Uhr | Spielzeit: ${spielzeit} min | Pause: ${pause} min</p>
    <table>
      <thead>
        <tr>
          <th>Nr.</th>
          <th>Platz</th>
          <th>Beginn</th>
          <th>Heim</th>
          <th>Gast</th>
          <th>Ergebnis</th>
        </tr>
      </thead>
      <tbody>
  `;

  spiele.forEach((spiel) => {
    endrundeHTML += `
      <tr>
        <td>${spiel.nr}</td>
        <td>${spiel.platz}</td>
        <td>${spiel.beginn}</td>
        <td>${spiel.heim}</td>
        <td>${spiel.gast}</td>
        <td>${spiel.ergebnis}</td>
      </tr>
    `;
  });

  endrundeHTML += `
      </tbody>
    </table>
  `;

  endrundeContainer.innerHTML = endrundeHTML;
}

// Hauptlogik
Promise.all([
  fetch("turnierdetails.json?v=" + new Date().getTime()),
  fetch("spielplan.json?v=" + new Date().getTime()),
  fetch("endrunde.json?v=" + new Date().getTime()),
])
  .then(async ([detailsResponse, spielplanResponse, endrundeResponse]) => {
    if (!detailsResponse.ok) {
      throw new Error(
        `HTTP-Fehler bei turnierdetails.json: ${detailsResponse.status}`
      );
    }
    if (!spielplanResponse.ok) {
      throw new Error(
        `HTTP-Fehler bei spielplan.json: ${spielplanResponse.status}`
      );
    }
    if (!endrundeResponse.ok) {
      throw new Error(
        `HTTP-Fehler bei endrunde.json: ${endrundeResponse.status}`
      );
    }

    const [detailsData, spielplanData, endrundeData] = await Promise.all([
      detailsResponse.json(),
      spielplanResponse.json(),
      endrundeResponse.json(),
    ]);

    // Header-Daten aktualisieren
    document.getElementById("titel").textContent = detailsData.titel;
    document.getElementById("untertitel").textContent = detailsData.untertitel;
    document.getElementById("datum").textContent = `Am ${detailsData.datum}`;
    document.getElementById("details").innerHTML = `
      Beginn: <strong>${detailsData.beginn}</strong> Uhr |
      Spielzeit: <strong>${detailsData.spielzeit}</strong> min |
      Pause: <strong>${detailsData.pause}</strong> min
    `;

    // Mannschaften initialisieren
    const mannschaften = {};
    initializeTeams(detailsData.gruppen, mannschaften);

    // Ergebnisse berechnen
    calculateResults(spielplanData.spielplan, mannschaften);

    // Sortierte Tabellen rendern
    renderGroupTables(
      detailsData.gruppen,
      mannschaften,
      spielplanData.spielplan
    );

    // Spielplan rendern
    renderSpielplan(spielplanData.spielplan);

    // Endrunde rendern
    renderEndrunde(endrundeData.endrunde);
  })
  .catch((error) => {
    console.error("Fehler beim Laden der Daten:", error);
  });
