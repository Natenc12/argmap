// argmap view — vanilla list UI. Drives the engine ONLY through its API
// (addClaim / connect / markPremise / check); never reaches into the lists directly.
//
// renderGraph(graph, flagged) draws graph.claims into #app as a numbered list; each row
// is labelled [premise] / [supported by: …] / [no support]; claims in `flagged` render
// red. This is the disposable layer — replaced by a React UI at v2. See ../DESIGN.md.
//
// Wired so far: Add claim, Check (lights up unsupported assertions).
// TODO: the 3-state machine (Viewing / Selected / Supporting) — markPremise + connect.

let graph = {
    claims: [
        { id: 1, text: "A", isPremise: true },
        { id: 2, text: "B", isPremise: false },
        { id: 3, text: "C", isPremise: false },
        { id: 4, text: "D", isPremise: false }
    ],
    edges: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 3 }
    ],
    nextId: 5
};

function renderGraph(graph, flagged = []) {

    let app = document.getElementById("app");
    // Clearing the contents of app to prevent render duplication
    app.innerHTML = "";

    graph.claims.forEach(claim => {
        let currentClaim = claim.id + ". " + claim.text + " ";
        if (claim.isPremise === true) { currentClaim = currentClaim + "[premise]"; }
        else {
            //find incoming edge -> put into a list
            let supportList = [];
            graph.edges.forEach(edge => { if (edge.to === claim.id) { supportList.push(edge.from) } })

            if (supportList.length === 0) { currentClaim = currentClaim + "[no support]"; }
            else { currentClaim = currentClaim + "[supported by: " + supportList.join(", ") + "]"; }
        }
        //append to the app element
        let row = document.createElement("div");
        row.textContent = currentClaim;

        let isFlagged = flagged.some(c => c.id === claim.id );

        if (isFlagged) {
            row.classList.add("flagged");
            row.style.color = "red";
        }

        app.appendChild(row);

    });
}

function handleAdd() {
    let text = claimInput.value;
    graph = addClaim(graph, text);
    renderGraph(graph);
    claimInput.value = "";
}

function handleCheck() {
    const flagged = checkGraph(graph);
    renderGraph(graph, flagged);
}

const claimInput = document.getElementById("claimInput");
const addBtn = document.getElementById("addBtn");
const checkBtn = document.getElementById("checkBtn");
addBtn.addEventListener("click", handleAdd);
checkBtn.addEventListener("click", handleCheck);
renderGraph(graph);