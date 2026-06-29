// argmap engine — pure JavaScript. No DOM, no framework.
//
// The graph data model + the API the view calls. Functions RETURN A NEW GRAPH
// (return-fresh), they do not mutate the one passed in. See ../DESIGN.md.
//
// Graph shape:  { claims: [{id, text, isPremise}], edges: [{from, to}], nextId }
//
// API to build (engine is Nathan's to write, by hand):
//   addClaim(graph, text)     -> new graph with claim {id: nextId, text, isPremise:false}, nextId bumped
//   connect(graph, from, to)  -> new graph with edge {from, to} (block self-connect: from === to)
//   markPremise(graph, id)    -> new graph with that claim's isPremise = true
//   check(graph)              -> read-only; flagged claims (no incoming edge AND isPremise false)
//
// Suggested first step: check(graph) against a hand-made graph literal.


var graph = {
    claims: [
        { id: 1, text: "A", isPremise: true },
        { id: 2, text: "B", isPremise: false },
        { id: 3, text: "C", isPremise: false }
    ],
    edges: [
        { from: 1, to: 2 }
    ],
    nextId: 4
}

function addClaim(graph, text) {
    var newClaim = { id: graph.nextId, text: text, isPremise: false };

    return {...graph,
        claims: [...graph.claims, newClaim],
        nextId: graph.nextId + 1
    }
}

function checkGraph(graph) {
    const flaggedClaims = [];

    for (const claim of graph.claims) {
        const isSupported = graph.edges.some(edge => edge.to === claim.id);

        if (!claim.isPremise && !isSupported) {
            flaggedClaims.push(claim);
        }
    }

    return flaggedClaims;
}

const graph2 = addClaim(graph, "D");
console.log("returned:", graph2.claims);   // should have 4 claims, incl. D
console.log("original:", graph.claims);    // should STILL have 3
console.log("nextId:", graph2.nextId);     // should be 5