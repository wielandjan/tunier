// Funktion zum Laden und Anzeigen von Turnierdetails
fetch("turnierdetails.json?v=" + new Date().getTime())
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP-Fehler: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    // Header-Daten einfügen
    document.getElementById("titel").textContent = data.titel;
    document.getElementById("untertitel").textContent = data.untertitel;
    document.getElementById("datum").textContent = `Am ${data.datum}`;
    document.getElementById("details").innerHTML = `
      Beginn: <strong>${data.beginn}</strong> Uhr |
      Spielzeit: <strong>${data.spielzeit}</strong> min |
      Pause: <strong>${data.pause}</strong> min
    `;

    console.log("Header erfolgreich geladen.");

    // Gruppen dynamisch laden
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
        tabelleHTML += `
          <tr>
            <td>${index + 1}.</td>
            <td>${team.name}</td>
            <td>${team.punkte}</td>
            <td>${team.tore}</td>
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

    console.log("Gruppen erfolgreich geladen.");
  })
  .catch((error) => {
    console.error("Fehler beim Laden der Turnierdetails:", error);
  });
