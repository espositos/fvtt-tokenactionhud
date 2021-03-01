import { Logger } from './logger.js';
import { ItemMacroOptions } from './settings/dnd5e/itemMacroOptions.js';
export { Logger } from './logger.js';

const updateFunc = (value) => { Logger.debug('Settings updated. Refreshing HUD'); if (game.tokenActionHUD)game.tokenActionHUD.updateSettings(); }
let appName;

export const registerSettings = function(app, systemManager, rollHandlers) {
    appName = app;

    game.settings.register(appName,'rollHandler', {
        name : game.i18n.localize('tokenactionhud.settings.rollHandler.name'),
        hint : game.i18n.localize('tokenactionhud.settings.rollHandler.hint'),
        scope : 'world',
        config : true,
        type : String,
        choices : rollHandlers,
        default : 'core',
        onChange: value => { updateFunc(value); }
    });
    
    game.settings.register(appName,'enabledForUser', {
        name : game.i18n.localize('tokenactionhud.settings.enabledForUser.name'),
        hint : game.i18n.localize('tokenactionhud.settings.enabledForUser.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateFunc(value); }
    });
    
    game.settings.register(appName,'alwaysShowHud', {
        name : game.i18n.localize('tokenactionhud.settings.alwaysShowHud.name'),
        hint : game.i18n.localize('tokenactionhud.settings.alwaysShowHud.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateFunc(value); }
    });
    
    game.settings.register(appName,'showHudTitle', {
        name : game.i18n.localize('tokenactionhud.settings.showHudTitle.name'),
        hint : game.i18n.localize('tokenactionhud.settings.showHudTitle.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'showIcons', {
        name : game.i18n.localize('tokenactionhud.settings.showIcons.name'),
        hint : game.i18n.localize('tokenactionhud.settings.showIcons.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'alwaysShowAdditionalCategories', {
        name : game.i18n.localize('tokenactionhud.settings.alwaysShowAdditionalCategories.name'),
        hint : game.i18n.localize('tokenactionhud.settings.alwaysShowAdditionalCategories.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'onTokenHover', {
        name : game.i18n.localize('tokenactionhud.settings.onTokenHover.name'),
        hint : game.i18n.localize('tokenactionhud.settings.onTokenHover.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : false,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'clickOpenCategory', {
        name : game.i18n.localize('tokenactionhud.settings.clickOpenCategory.name'),
        hint : game.i18n.localize('tokenactionhud.settings.clickOpenCategory.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : false,
        onChange: value => { updateFunc(value); }
    });
   
    systemManager.doRegisterSettings(appName, updateFunc);

    if (game.modules.get('itemacro')?.active) {
        game.settings.register(appName,'itemMacroReplace', {
            name: game.i18n.localize('tokenactionhud.settings.dnd5e.itemMacroReplace.name'),
            hint: game.i18n.localize('tokenactionhud.settings.dnd5e.itemMacroReplace.hint'),
            scope: "client",
            config: true,
            type: String,
            choices: {
                showBoth: game.i18n.localize(ItemMacroOptions.SHOW_BOTH),
                showItemMacro: game.i18n.localize(ItemMacroOptions.SHOW_ITEM_MACRO),
                showOriginal: game.i18n.localize(ItemMacroOptions.SHOW_ORIGINAL_ITEM)
            },
            default: 'showBoth',
            onChange: value => { updateFunc(value); }
        });
    }
            
    game.settings.register(appName,'playerPermission', {
        name : game.i18n.localize('tokenactionhud.settings.playerPermission.name'),
        hint : game.i18n.localize('tokenactionhud.settings.playerPermission.hint'),
        scope : 'world',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateFunc(value); }
    });
    
    game.settings.register(appName,'renderItemOnRightClick', {
        name : game.i18n.localize('tokenactionhud.settings.renderItemOnRightClick.name'),
        hint : game.i18n.localize('tokenactionhud.settings.renderItemOnRightClick.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName, 'scale', {
      name: game.i18n.localize('tokenactionhud.settings.scale.name'),
      hint: game.i18n.localize('tokenactionhud.settings.scale.hint'),
      scope: 'client',
      config: true,
      type: Number,
      range: {     
        min: 0.8,
        max: 2,
        step: 0.1
      },
      default: 1,
      onChange: value => { updateFunc(value); }
    });
    
    game.settings.register(appName,'activeCssAsText', {
        name : game.i18n.localize('tokenactionhud.settings.activeCssAsText.name'),
        hint : game.i18n.localize('tokenactionhud.settings.activeCssAsText.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : false,
        onChange: value => { updateFunc(value); }
    });
    
    game.settings.register(appName,'dropdown', {
        name : game.i18n.localize('tokenactionhud.settings.dropdown.name'),
        hint : game.i18n.localize('tokenactionhud.settings.dropdown.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : true,
        onChange: value => { updateFunc(value); }
    });
    
    game.settings.register(appName,'debug', {
        name : game.i18n.localize('tokenactionhud.settings.debug.name'),
        hint : game.i18n.localize('tokenactionhud.settings.debug.hint'),
        scope : 'client',
        config : true,
        type : Boolean,
        default : false,
        onChange: value => { updateFunc(value); }
    });

    Logger.debug('available rollHandlers: ', rollHandlers);
}

export function get(setting) {
    return game.settings.get(appName, setting);
}

export function set(setting, value) {
    game.settings.set(appName, setting, value);
}
