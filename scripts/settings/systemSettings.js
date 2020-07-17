
import * as dnd5eSettings from "./dnd5e-settings.js"
import * as dwSettings from "./dungeonworld-settings.js"
import * as pf2esettings from "./pf2e-settings.js"
import * as wfrp4eSettings from "./wfrp4e-settings.js"
import * as sfrpgSettings from "./sfrpg-settings.js"

export function setSettings(system, app, updateSettings) {
    switch (system) {
        case "dnd5e":
            dnd5eSettings.registerSettings(app, updateSettings);
            break;
        case "dungeonworld":
            dwSettings.registerSettings(app, updateSettings);
            break;
        case "pf2e":
            pf2esettings.registerSettings(app, updateSettings);
            break;
        case "wfrp4e":
            wfrp4eSettings.registerSettings(app, updateSettings);
        case "sfrpg":
            sfrpgSettings.registerSettings(app, updateSettings);
            break;
        default:
            throw new Error(`Unknown system: ${system}`);
    }
}