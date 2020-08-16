import { Logger } from './logger.js';
export { Logger } from './logger.js';
import * as systemSettings from './settings/systemSettings.js'

const updateSettings = (value) => { Logger.debug('Settings updated. Refreshing HUD'); if (game.tokenActionHUD)game.tokenActionHUD.updateSettings(); }

const app = 'token-action-hud';
export const registerSettings = function(system, rollHandlers) {
    game.settings.register(app,'rollHandler', {
        name : game.i18n.localize('tokenactionhud.settings.rollHandler.name'),
        hint : game.i18n.localize('tokenactionhud.settings.rollHandler.hint'),
        scope : 'world',
        config : true,
        type : String,
        choices : rollHandlers,
        default : 'core',
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'enabledForUser', {
        name : game.i18n.localize('tokenactionhud.settings.enabledForUser.name'),
        hint : game.i18n.localize('tokenactionhud.settings.enabledForUser.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'alwaysShowHud', {
        name : game.i18n.localize('tokenactionhud.settings.alwaysShowHud.name'),
        hint : game.i18n.localize('tokenactionhud.settings.alwaysShowHud.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'showHudTitle', {
        name : game.i18n.localize('tokenactionhud.settings.showHudTitle.name'),
        hint : game.i18n.localize('tokenactionhud.settings.showHudTitle.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'showIcons', {
        name : game.i18n.localize('tokenactionhud.settings.showIcons.name'),
        hint : game.i18n.localize('tokenactionhud.settings.showIcons.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'alwaysShowAdditionalCategories', {
        name : game.i18n.localize('tokenactionhud.settings.alwaysShowAdditionalCategories.name'),
        hint : game.i18n.localize('tokenactionhud.settings.alwaysShowAdditionalCategories.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'onTokenHover', {
        name : game.i18n.localize('tokenactionhud.settings.onTokenHover.name'),
        hint : game.i18n.localize('tokenactionhud.settings.onTokenHover.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : false,
        onChange: value => { updateSettings(value); }
    });
   
    systemSettings.setSettings(system, app, updateSettings);
    
    game.settings.register(app,'playerPermission', {
        name : game.i18n.localize('tokenactionhud.settings.playerPermission.name'),
        hint : game.i18n.localize('tokenactionhud.settings.playerPermission.hint'),
        scope : 'world',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'renderItemOnRightClick', {
        name : game.i18n.localize('tokenactionhud.settings.renderItemOnRightClick.name'),
        hint : game.i18n.localize('tokenactionhud.settings.renderItemOnRightClick.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : false,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'debug', {
        name : game.i18n.localize('tokenactionhud.settings.debug.name'),
        hint : game.i18n.localize('tokenactionhud.settings.debug.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : false,
        onChange: value => { updateSettings(value); }
    });

    Logger.debug('available rollHandlers: ', rollHandlers);
}

export function get(setting) {
    return game.settings.get(app, setting);
}

export function set(setting, value) {
    game.settings.set(app, setting, value);
}
