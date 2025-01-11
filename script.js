// script.js

// Hauptfunktion, die alle Operationen koordiniert
(async function TournamentApp() {
  try {
    // Daten laden
    const [detailsData, spielplanData, endrundeData] = await loadAllData();

    // Header aktualisieren
    updateHeader(detailsData);

    // Mannschaften initialisieren
    const mannschaften = initializeTeams(detailsData.gruppen);

    // Ergebnisse berechnen
    calculateResults(spielplanData.spielplan, mannschaften);

    // Gruppentabellen rendern
    renderGroupTables(
      detailsData.gruppen,
      mannschaften,
      spielplanData.spielplan
    );

    // Spielplan rendern
    renderSpielplan(spielplanData.spielplan);

    // Bedingtes Rendern der Endrunde
    handleEndrundeRendering(
      endrundeData.endrunde.spiele,
      mannschaften,
      spielplanData.spielplan
    );
  } catch (error) {
    console.error("Fehler beim Laden der Daten:", error);
  }
})();

/**
 * Lädt alle notwendigen JSON-Daten parallel.
 * @returns {Promise<Array>} - Array mit den geladenen JSON-Daten.
 */
async function loadAllData() {
  const responses = await Promise.all([
    fetch("turnierdetails.json?v=" + new Date().getTime()),
    fetch("spielplan.json?v=" + new Date().getTime()),
    fetch("endrunde.json?v=" + new Date().getTime()),
  ]);

  // Überprüfen, ob alle Anfragen erfolgreich waren
  responses.forEach((response, index) => {
    if (!response.ok) {
      const fileNames = [
        "turnierdetails.json",
        "spielplan.json",
        "endrunde.json",
      ];
      throw new Error(
        `HTTP-Fehler bei ${fileNames[index]}: ${response.status}`
      );
    }
  });

  // JSON-Daten parsen
  return Promise.all(responses.map((response) => response.json()));
}

/**
 * Aktualisiert die Header-Daten im HTML-Dokument.
 * @param {Object} detailsData - Die Daten aus turnierdetails.json.
 */
function updateHeader(detailsData) {
  document.getElementById("titel").textContent = detailsData.titel;
  document.getElementById("untertitel").textContent = detailsData.untertitel;
  document.getElementById("datum").textContent = `Am ${detailsData.datum}`;
  document.getElementById("details").innerHTML = `
    Beginn: <strong>${detailsData.beginn}</strong> Uhr |
    Spielzeit: <strong>${detailsData.spielzeit}</strong> min |
    Pause: <strong>${detailsData.pause}</strong> min
  `;
}

/**
 * Initialisiert die Mannschaften mit 0 Punkten und 0 Toren.
 * @param {Object} gruppen - Die Gruppen aus den Turnierdetails.
 * @returns {Object} - Objekt mit Mannschaftsdaten.
 */
function initializeTeams(gruppen) {
  const mannschaften = {};
  Object.values(gruppen)
    .flat()
    .forEach((team) => {
      mannschaften[team.name] = { punkte: 0, tore: 0 };
    });
  return mannschaften;
}

/**
 * Berechnet die Ergebnisse basierend auf dem Spielplan.
 * @param {Array} spielplan - Das Array der Spiele.
 * @param {Object} mannschaften - Das Objekt, das die Mannschaften speichert.
 */
function calculateResults(spielplan, mannschaften) {
  spielplan.forEach((spiel) => {
    // Prüfen, ob das Spiel abgeschlossen ist
    if (
      spiel.ergebnis &&
      spiel.ergebnis.includes(":") &&
      spiel.ergebnis.trim() !== ":"
    ) {
      let [toreHeim, toreGast] = spiel.ergebnis.split(":").map(Number);
      let extraPunkteHeim = 0;
      let extraPunkteGast = 0;

      // Prüfen auf Verlängerung oder Elfmeterschießen bei Unentschieden
      if (toreHeim === toreGast) {
        if (
          spiel.ergebnisVerlaengerung &&
          spiel.ergebnisVerlaengerung.includes(":")
        ) {
          const [toreHeimExt, toreGastExt] = spiel.ergebnisVerlaengerung
            .split(":")
            .map(Number);
          toreHeim += toreHeimExt;
          toreGast += toreGastExt;
          if (toreHeimExt > toreGastExt) extraPunkteHeim += 1;
          else if (toreHeimExt < toreGastExt) extraPunkteGast += 1;
        }
        if (
          spiel.ergebnisElfmeterschießen &&
          spiel.ergebnisElfmeterschießen.includes(":")
        ) {
          const [toreHeimSho, toreGastSho] = spiel.ergebnisElfmeterschießen
            .split(":")
            .map(Number);
          toreHeim += toreHeimSho;
          toreGast += toreGastSho;
          if (toreHeimSho > toreGastSho) extraPunkteHeim += 1;
          else if (toreHeimSho < toreGastSho) extraPunkteGast += 1;
        }
      }

      // Tore addieren
      mannschaften[spiel.heim].tore += toreHeim;
      mannschaften[spiel.gast].tore += toreGast;

      // Punkte berechnen
      if (toreHeim > toreGast) {
        mannschaften[spiel.heim].punkte += 3 + extraPunkteHeim;
      } else if (toreHeim < toreGast) {
        mannschaften[spiel.gast].punkte += 3 + extraPunkteGast;
      } else {
        mannschaften[spiel.heim].punkte += 1;
        mannschaften[spiel.gast].punkte += 1;
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

    // Nach Punkten sortieren (absteigend)
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

    // Alphabetisch sortieren als letztes Kriterium
    return a.name.localeCompare(b.name);
  });
}

/**
 * Rendert die Gruppen-Tabellen im HTML-Dokument.
 * @param {Object} gruppen - Die Gruppen aus den Turnierdetails.
 * @param {Object} mannschaften - Das Objekt, das die Mannschaften speichert.
 * @param {Array} spielplan - Das Array der Spiele.
 */
function renderGroupTables(gruppen, mannschaften, spielplan) {
  const gruppenContainer = document.getElementById("gruppen-container");
  gruppenContainer.innerHTML = ""; // Container leeren

  Object.entries(gruppen).forEach(([gruppenName, teams]) => {
    const gruppeDiv = document.createElement("div");
    gruppeDiv.className = "gruppe";

    const sortedTeams = sortTeams(teams, mannschaften, spielplan);

    let tabelleHTML = `
      <h3>${gruppenName}</h3>
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
 * Rendert den Spielplan im HTML-Dokument.
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
 * Rendert die Endrunde im HTML-Dokument.
 * @param {Array} endrundeSpiele - Das Array der Endrunde-Spiele.
 */
function renderEndrunde(endrundeSpiele) {
  const endrundeContainer = document.getElementById("endrunde-container");

  if (endrundeSpiele.length === 0) {
    endrundeContainer.innerHTML = "<p>Keine Endrunde verfügbar.</p>";
    return;
  }

  // Annahme: Alle Spiele haben die gleichen Spielzeit und Pause (optional anpassen)
  const firstSpiel = endrundeSpiele[0];

  let endrundeHTML = `
    <p>Beginn: ${firstSpiel.beginn} Uhr | Spielzeit: ${
    firstSpiel.spielzeit || "1 x 10:00"
  } min | Pause: ${firstSpiel.pause || "01:00"} min</p>
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

  endrundeSpiele.forEach((spiel) => {
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

/**
 * Aktualisiert die Endrunde-Teams basierend auf den Ergebnissen der Halbfinale.
 * @param {Array} endrundeSpiele - Das Array der Endrunde-Spiele.
 * @param {Object} mannschaften - Das Objekt, das die Mannschaften speichert.
 * @param {Array} spielplan - Das Array der Gruppenspiele, um direkte Vergleiche zu ermöglichen.
 */
function updateEndrunde(endrundeSpiele, mannschaften, spielplan) {
  // Halbfinale finden
  const halbfinale1 = endrundeSpiele.find((spiel) => spiel.nr === 21);
  const halbfinale2 = endrundeSpiele.find((spiel) => spiel.nr === 22);

  if (!halbfinale1) {
    console.warn("Halbfinale 1 (Nr. 21) wurde nicht gefunden.");
  }

  if (!halbfinale2) {
    console.warn("Halbfinale 2 (Nr. 22) wurde nicht gefunden.");
  }

  const siegerHalbfinale1 = halbfinale1
    ? getSieger(halbfinale1, mannschaften)
    : null;
  const siegerHalbfinale2 = halbfinale2
    ? getSieger(halbfinale2, mannschaften)
    : null;

  const verliererHalbfinale1 = halbfinale1
    ? getVerlierer(halbfinale1, mannschaften)
    : null;
  const verliererHalbfinale2 = halbfinale2
    ? getVerlierer(halbfinale2, mannschaften)
    : null;

  // Sieger Halbfinale I -> Heim des Endspiels (Nr. 26)
  const endspiel = endrundeSpiele.find((spiel) => spiel.nr === 26);
  if (endspiel) {
    if (siegerHalbfinale1) {
      endspiel.heim = siegerHalbfinale1;
    } else {
      endspiel.heim = "Sieger Halbfinale I"; // Platzhalter
      console.warn("Sieger Halbfinale 1 ist nicht festgelegt.");
    }

    if (siegerHalbfinale2) {
      endspiel.gast = siegerHalbfinale2;
    } else {
      endspiel.gast = "Sieger Halbfinale II"; // Platzhalter
      console.warn("Sieger Halbfinale 2 ist nicht festgelegt.");
    }
  } else {
    console.warn("Endspiel (Nr. 26) wurde nicht gefunden.");
  }

  // Verlierer Halbfinale I und II -> Heim und Gast des Spiels um Platz 3 und 4 (Nr. 25)
  const spielUmPlatz3und4 = endrundeSpiele.find((spiel) => spiel.nr === 25);
  if (spielUmPlatz3und4) {
    if (verliererHalbfinale1) {
      spielUmPlatz3und4.heim = verliererHalbfinale1;
    } else {
      spielUmPlatz3und4.heim = "Verlierer Halbfinale I"; // Platzhalter
      console.warn("Verlierer Halbfinale 1 ist nicht festgelegt.");
    }

    if (verliererHalbfinale2) {
      spielUmPlatz3und4.gast = verliererHalbfinale2;
    } else {
      spielUmPlatz3und4.gast = "Verlierer Halbfinale II"; // Platzhalter
      console.warn("Verlierer Halbfinale 2 ist nicht festgelegt.");
    }
  } else {
    console.warn("Spiel um Platz 3 und 4 (Nr. 25) wurde nicht gefunden.");
  }

  // Weitere Spiele um Platz 5 und 6 sowie 7 und 8 können hier ebenfalls aktualisiert werden
}

/**
 * Bestimmt den Sieger eines Spiels.
 * @param {Object} spiel - Das Spielobjekt.
 * @param {Object} mannschaften - Das Objekt, das die Mannschaften speichert.
 * @returns {String|null} - Der Name des Siegers oder null bei Unentschieden.
 */
function getSieger(spiel, mannschaften) {
  if (!spiel) return null;
  if (
    spiel.ergebnis &&
    spiel.ergebnis.includes(":") &&
    spiel.ergebnis.trim() !== ":"
  ) {
    const [toreHeim, toreGast] = spiel.ergebnis.split(":").map(Number);
    if (toreHeim > toreGast) {
      return spiel.heim;
    } else if (toreHeim < toreGast) {
      return spiel.gast;
    }
  }
  return null; // Kein Sieger (Unentschieden oder Spiel noch nicht gespielt)
}

/**
 * Bestimmt den Verlierer eines Spiels.
 * @param {Object} spiel - Das Spielobjekt.
 * @param {Object} mannschaften - Das Objekt, das die Mannschaften speichert.
 * @returns {String|null} - Der Name des Verlierers oder null bei Unentschieden.
 */
function getVerlierer(spiel, mannschaften) {
  if (!spiel) return null;
  if (
    spiel.ergebnis &&
    spiel.ergebnis.includes(":") &&
    spiel.ergebnis.trim() !== ":"
  ) {
    const [toreHeim, toreGast] = spiel.ergebnis.split(":").map(Number);
    if (toreHeim > toreGast) {
      return spiel.gast;
    } else if (toreHeim < toreGast) {
      return spiel.heim;
    }
  }
  return null; // Kein Verlierer (Unentschieden oder Spiel noch nicht gespielt)
}

/**
 * Überprüft, ob alle Gruppenspiele abgeschlossen sind.
 * @param {Object} gruppen - Die Gruppen aus den Turnierdetails.
 * @param {Array} spielplan - Das Array der Gruppenspiele.
 * @returns {Boolean} - True, wenn alle Gruppenspiele abgeschlossen sind, sonst False.
 */
function areAllGroupGamesFinished(gruppen, spielplan) {
  // Gruppenspiele identifizieren (angenommen: Nr. <= 20)
  const groupGames = spielplan.filter((spiel) => spiel.nr <= 20);
  return groupGames.every(
    (spiel) =>
      spiel.ergebnis &&
      spiel.ergebnis.trim() !== ":" &&
      spiel.ergebnis.includes(":")
  );
}

/**
 * Rendert die Endrunde bedingt und zeigt den Abschnitt an, wenn alle Gruppenspiele abgeschlossen sind.
 * @param {Array} endrundeSpiele - Das Array der Endrunde-Spiele.
 * @param {Object} mannschaften - Das Objekt, das die Mannschaften speichert.
 * @param {Array} spielplan - Das Array der Gruppenspiele.
 */
function handleEndrundeRendering(endrundeSpiele, mannschaften, spielplan) {
  const endrundeSection = document.getElementById("endrunde-section");
  const endrundeHinweis = document.getElementById("endrunde-hinweis");

  if (areAllGroupGamesFinished(mannschaften.gruppen, spielplan)) {
    // Endrunde-Teams aktualisieren
    updateEndrunde(endrundeSpiele, mannschaften, spielplan);

    // Endrunde rendern
    renderEndrunde(endrundeSpiele);

    // Sichtbarkeit der Endrunde freigeben
    endrundeSection.classList.remove("hidden");
    endrundeHinweis.classList.add("hidden");
  } else {
    // Endrunde verbergen, wenn nicht alle Gruppenspiele abgeschlossen sind
    endrundeSection.classList.add("hidden");
    endrundeHinweis.classList.remove("hidden");
  }
}
