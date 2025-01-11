fetch("turnierdaten.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP-Fehler: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    console.log("Geladene Daten:", data); // Debug-Ausgabe
    // Dynamische Inhalte hinzufügen
    document.getElementById("titel").textContent = data.titel;
    document.getElementById("untertitel").textContent = data.untertitel;
    document.getElementById("datum").textContent = `Am ${data.datum}`;
    document.getElementById(
      "details"
    ).textContent = `Beginn: ${data.beginn} | Spielzeit: ${data.spielzeit} | Pause: ${data.pause}`;

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

      mannschaften.forEach((team, index) => {
        tabelleHTML += `
          <tr>
            <td>${index + 1}.</td>
            <td>${team}</td>
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
  .catch((error) => {
    console.error("Fehler beim Laden der JSON-Datei:", error);
  });
