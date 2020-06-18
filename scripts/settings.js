import { Logger } from "./logger.js";
export { Logger } from "./logger.js";
import * as dnd5eSettings from "./settings/dnd5e-settings.js"
import * as wfrp4eSettings from "./settings/wfrp4e-settings.js"

const app = 'token-action-hud';
export const registerSettings = function(rollHandlers) {
    game.settings.register(app,'rollHandler', {
        name : "HUD roll handler",
        hint : "Choose which module handles the HUD's button clicks.",
        scope : "world",
        config : true,
        type : String,
        choices : rollHandlers,
        default : "core"
    });
    game.settings.register(app,'playerPermission', {
        name : "Enable HUD for players",
        hint : "Disable this to restrict use of the HUD to the GM.",
        scope : "world",
        config : true,
        type : Boolean,
        default : true
    });
    game.settings.register(app,'enabledForUser', {
        name : "Enable HUD for current user",
        hint : "Enables or disables the bar for the current user.",
        scope : "client",
        config : true,
        type : Boolean,
        default : true
    });
    game.settings.register(app,'debug', {
        name : "Enable debugging",
        hint : "Enable debug logging.",
        scope : "client",
        config : true,
        type : Boolean,
        default : false
    });

    let system = game.data.system.id;

    if (!Object.values(knownSystems).includes(system))
        throw new Error('Unknown system.');

    switch (system) {
        case "dnd5e":
            dnd5eSettings.registerSettings(app, settings);
            break;
        case "wfrp4e":
            wfrp4eSettings.registerSettings(app, settings);
            break;
        default:
            throw new Error('Unknown system.');
    }

    Logger.debug("settings ENUM: ", settings);
    Logger.debug("rollHandlers: ", rollHandlers);
}

export function getSetting(setting) {
    if (!Object.values(settings).includes(setting)) {
        Logger.error('Unknown setting.');
        return;
    }

    return game.settings.get(app, setting);
}

export function setSetting(setting, value) {
    if (!Object.values(settings).includes(setting)) {
        Logger.error('Unknown setting.');
        return;
    }

    game.settings.set(app, setting, value);
}

/** ENUMS */

/** @enum */
export const settings = {
    rollHandler: 'rollHandler',
    enabledForUser: 'enabledForUser',
    playerPermission: 'playerPermission',
    debug: 'debug'
};

/** @enum */
export const knownSystems = {
    wfrp4e: "wfrp4e",
    dnd5e: "dnd5e"
}
