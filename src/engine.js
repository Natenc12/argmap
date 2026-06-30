// argmap engine — pure JavaScript. No DOM, no framework.
//
// The graph data model + the API the view calls. Functions RETURN A NEW GRAPH
// (return-fresh), they do not mutate the one passed in. See ../DESIGN.md.
//
// Graph shape:  { claims: [{id, text, isPremise}], edges: [{from, to}], nextId }
//
// API (complete):
//   addClaim(graph, text)     -> new graph with claim {id: nextId, text, isPremise:false}, nextId bumped
//   connect(graph, from, to)  -> new graph with edge {from, to}; self-connect (from === to) is a no-op
//   markPremise(graph, id)    -> new graph with that claim's isPremise = true
//   checkGraph(graph)         -> read-only; returns claims with no incoming edge AND isPremise false

// Adds a claim into the graph
// Takes in the current graph and the text of the new claim
// Returns a new graph with the new claim added
function addClaim(graph, text) {
    let newClaim = { id: graph.nextId, text: text, isPremise: false };

    return {
        ...graph,
        claims: [...graph.claims, newClaim],
        nextId: graph.nextId + 1
    }
}

// creates a new connection in the graph
// Takes in the current graph, the id that points to the from claim, and the id that points to the to claim
// returns a new graph object with the edges array updated
function connect(graph, from, to) {

    // No operation if user tries to connect a claim to itself (the UI grays this out, so it's just a safety net)
    if (from === to) { return graph; }

    let newEdge = { from: from, to: to };

    return {
        ...graph,
        edges: [...graph.edges, newEdge]
    }
}

// Mark a specific claim as a premise
// Takes in the current graph and pointer id
// Then returns a new graph with the specific claim updated as a premise
function markPremise(graph, id) {
    return {
        ...graph,
        claims: graph.claims.map(e => {
            if (e.id === id) {
                return { ...e, isPremise: true }; // new object instead of mutating e, so the original graph is untouched
            }
            return e; // not the target claim — return it unchanged
        })
    }
}

// this runs through the graph and returns a list of the claims that have no support
// these are called flagged claims
function checkGraph(graph) {
    const flaggedClaims = [];

    for (const claim of graph.claims) {
        // is there any edge pointing AT this claim?
        const isSupported = graph.edges.some(edge => edge.to === claim.id);

        // unsupported AND not a premise -> it's a smuggled assertion, flag it
        if (!claim.isPremise && !isSupported) {
            flaggedClaims.push(claim);
        }
    }

    return flaggedClaims;
}
