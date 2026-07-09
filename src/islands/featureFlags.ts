// Capital's island worlds are the default experience.
// They stay on unless explicitly disabled with VITE_ISLANDS=0.
export const ISLANDS_ENABLED = import.meta.env.VITE_ISLANDS !== "0";

// When true (the default), Capital boots straight into the island launcher
// instead of the legacy mode-selection screen. Set VITE_DEFAULT_MODE to
// "select" to restore the old chooser.
export const ISLANDS_DEFAULT = ISLANDS_ENABLED && import.meta.env.VITE_DEFAULT_MODE !== "select";
