// js/features/homework.js

let homeworkData = JSON.parse(localStorage.getItem("homeworkData")) || null;

async function openCameraScan() {
    // Implementierung des QR-Code-Scans...
    // Gibt ein Promise zurück, das mit dem gescannten Code aufgelöst wird.
    // Hier ist eine vereinfachte Version:
    const code = prompt("QR-Code-Daten eingeben (JSON-Format):");
    try {
        return { data: JSON.parse(code) };
    } catch (e) {
        alert("Ungültiger Code.");
        return null;
    }
}

function renderHomeworkModal() {
    let modal = document.getElementById("homeworkModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "homeworkModal";
        modal.className = "modal-overlay"; // CSS-Klasse für das Styling
        document.body.appendChild(modal);
    }
    
    const title = homeworkData?.HA || "Keine HA";
    const desc = homeworkData?.Beschreibung || "Noch keine Hausaufgabe erhalten.";

    modal.innerHTML = `
        <div class="modal-content">
            <h2>Hausaufgabe</h2>
            <p><strong>Titel:</strong> ${title}</p>
            <p><strong>Beschreibung:</strong> ${desc}</p>
            <button id="hwReceiveBtn">HA empfangen (Scan)</button>
            <button class="close-button">Schließen</button>
        </div>
    `;

    modal.querySelector('#hwReceiveBtn').addEventListener('click', async () => {
        const result = await openCameraScan();
        if (result && result.data) {
            homeworkData = result.data;
            localStorage.setItem("homeworkData", JSON.stringify(homeworkData));
            renderHomeworkModal(); // Modal neu rendern
        }
    });
    
    modal.querySelector('.close-button').addEventListener('click', () => modal.classList.add('hidden'));
}


export function setupHomeworkFeature(triggerElement) {
    triggerElement.addEventListener('click', () => {
        renderHomeworkModal();
        document.getElementById("homeworkModal").classList.remove('hidden');
    });
}
