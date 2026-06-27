// argmap view — vanilla list UI. Drives the engine ONLY through its API
// (addClaim / connect / markPremise / check); never reaches into the lists directly.
//
// Holds the 3-state machine (Viewing / Selected / Supporting) and renders the
// claim list into #app. This is the disposable layer — replaced by a React UI at v2.
// See ../DESIGN.md for the state machine and the 4 actions mapped to UI.
//
// (Nothing here yet — built after the engine.)
