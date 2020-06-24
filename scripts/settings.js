import { Logger } from "./logger.js";
export { Logger } from "./logger.js";
import * as dnd5eSettings from "./settings/dnd5e-settings.js"
import * as wfrp4eSettings from "./settings/wfrp4e-settings.js"

const updateSettings = (value) => { Logger.debug("Settings updated. Refreshing HUD"); if (game.tokenActionHUD)game.tokenActionHUD.updateSettings(); }

const app = 'token-action-hud';
export const registerSettings = function(rollHandlers) {
    game.settings.register(app,'rollHandler', {
        name : "HUD roll handler",
        hint : "Choose which module will receive the HUD's actions.",
        scope : "world",
        config : true,
        type : String,
        choices : rollHandlers,
        default : "core",
        onChange: value => { updateSettings(value); }
    });
    game.settings.register(app,'playerPermission', {
        name : "Enable HUD for players",
        hint : "If enabled, players will be able to use the HUD.",
        scope : "world",
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateSettings(value); }
    });
    game.settings.register(app,'enabledForUser', {
        name : "Enable HUD for current user",
        hint : "If enabled, the HUD is active for the user. Does not override the player permission setting.",
        scope : "client",
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateSettings(value); }
    });
    game.settings.register(app,'onTokenHover', {
        name : "Enable hovering",
        hint : `If enabled, the HUD will appear when hovering over a controllable token.
        Warning: Due to the unpredictable position of a token on the canvas, some actiosn may fall off the screen.`,
        scope : "client",
        config : true,
        type : Boolean,
        default : false,
        onChange: value => { updateSettings(value); }
    });
    game.settings.register(app,'debug', {
        name : "Enable debugging",
        hint : "Enable debug logging.",
        scope : "client",
        config : true,
        type : Boolean,
        default : false,
        onChange: value => { updateSettings(value); }
    });

    let system = game.data.system.id;

    if (!Object.values(knownSystems).includes(system))
        throw new Error(`Unknown system: ${system}`);

    switch (system) {
        case "dnd5e":
            dnd5eSettings.registerSettings(app, configVars, updateSettings);
            break;
        case "wfrp4e":
            wfrp4eSettings.registerSettings(app, configVars, updateSettings);
            break;
        default:
            throw new Error(`Unknown system: ${system}`);
    }
    Logger.debug("rollHandlers: ", rollHandlers);
}

export function get(setting) {
    if (!Object.values(configVars).includes(setting)) {
        Logger.error('Unknown setting:', setting);
        return;
    }

    return game.settings.get(app, setting);
}

export function set(setting, value) {
    if (!Object.values(configVars).includes(setting)) {
        Logger.error('Unknown setting:', setting);
        return;
    }

    game.settings.set(app, setting, value);
}

/** ENUMS */

/** @enum */
export const configVars = {
    rollHandler: 'rollHandler',
    enabledForUser: 'enabledForUser',
    playerPermission: 'playerPermission',
    debug: 'debug',
    onTokenHover: 'onTokenHover'
};

/** @enum */
export const knownSystems = {
    wfrp4e: "wfrp4e",
    dnd5e: "dnd5e"
}
