// argmap view — vanilla list UI. Drives the engine ONLY through its API
// (addClaim / connect / markPremise / check); never reaches into the lists directly.
//
// renderGraph(graph) draws graph.claims into #app as a numbered list; each row is
// labelled [premise] / [supported by: …] / [no support]. This is the disposable
// layer — replaced by a React UI at v2. See ../DESIGN.md.
//
// State machine (viewing / selected / supporting) drives interactivity: transition() is the
// pure state->state function; handleTransition() runs it + the side effects (selectedClaim,
// engine calls) + re-render. Add / Check / connect wired. TODO: markPremise; show the
// supports button only on the selected row.


let graph = {
    claims: [
        { id: 1, text: "People feel sad when cute things are harmed", isPremise: true },
        { id: 2, text: "Making people sad is wrong", isPremise: true },
        { id: 3, text: "Animals are cute", isPremise: false },
        { id: 4, text: "Eating animals is wrong because they are cute", isPremise: false }
    ],
    edges: [
        { from: 1, to: 3 },
        { from: 2, to: 4 },
    ],
    nextId: 5
};

let selectedClaim = null;
let currentState = "viewing";

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

        let supportsBtn = document.createElement("button");
        supportsBtn.textContent = "supports...";
        supportsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (currentState === "selected" && selectedClaim === claim) {
                handleTransition(claim, "startSupport")
            }
        })

        row.appendChild(supportsBtn);

        row.addEventListener("click", () => {

            if (currentState === "viewing") {
                handleTransition(claim, "selectClaim");
            }
            if (currentState === "selected") {
                // Select a new row when one is already selected
                handleTransition(claim, "selectClaim")
            }
            if (currentState === "supporting") {
                handleTransition(claim, "pickTarget");
            }

        })

        let isFlagged = flagged.some(c => c.id === claim.id);

        if (isFlagged) {
            row.classList.add("flagged");
            row.style.color = "red";
        }

        app.appendChild(row);

    });
}

function transition(state, event) {
    if (event === "selectClaim"  && state === "viewing")    return "selected";
    if (event === "selectClaim"  && state === "selected")   return "selected";
    if (event === "startSupport" && state === "selected")   return "supporting";
    if (event === "pickTarget"   && state === "supporting") return "viewing";

    return state;
}

function handleTransition(claim, event) {

    if (currentState === "viewing" && event === "selectClaim") {
        selectedClaim = claim;
    }

    if (currentState === "selected" && event === "selectClaim") {
        selectedClaim = claim;
    }

    if (currentState === "supporting" && event === "pickTarget") {
        graph = connect(graph, selectedClaim.id, claim.id);
    }

    currentState = transition(currentState, event);
    renderGraph(graph);

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