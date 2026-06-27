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
