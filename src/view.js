// argmap view — vanilla list UI. Drives the engine ONLY through its API
// (addClaim / connect / markPremise / check); never reaches into the lists directly.
//
// renderGraph(graph) draws graph.claims into #app as a numbered list; each row is
// labelled [premise] / [supported by: …] / [no support]. This is the disposable
// layer — replaced by a React UI at v2. See ../DESIGN.md.
//
// TODO: interactivity — the 3-state machine (Viewing / Selected / Supporting) and the
// buttons that call addClaim / connect / markPremise and re-render. Not built yet.


// Design idea below

// 1. A [premise]

// 2. B [supported by: 1]

// 3. C [supported by: 1, 2]

// 4. D [no support] 

function renderGraph(graph) {

    var app = document.getElementById("app");
    // Clearing the contents of app to prevent render duplication
    app.innerHTML = "";

    graph.claims.forEach(claim => {
        var currentClaim = claim.id + ". " + claim.text + " ";
        if (claim.isPremise === true) { currentClaim = currentClaim + "[premise]"; }
        else {
            //find incoming edge -> put into a list
            var supportList = [];
            graph.edges.forEach(edge => { if (edge.to === claim.id) { supportList.push(edge.from) } })
            if (supportList.length === 0) { currentClaim = currentClaim + "[no support]"; }
            else { currentClaim = currentClaim + "[supported by: " + supportList.join(", ") + "]"; }
        }
        //append to the app element
        row = document.createElement("div");
        row.textContent = currentClaim;
        app.appendChild(row);
    });
}

const graph = {
    claims: [
        {id:1, text:"A", isPremise:true},
        {id:2, text:"B", isPremise:false},
        {id:3, text:"C", isPremise:false},
        {id:4, text:"D", isPremise:false}
    ],
    edges: [
        {from:1, to:2},
        {from:1, to:3},
        {from:2, to:3}
    ],
    nextId: 4
};

renderGraph(graph);