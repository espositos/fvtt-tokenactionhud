import * as settings from "./settings.js";
import { HandlersManager } from "./handlersManager.js";
import { TokenActionHUD } from "./tokenactionhud.js";

Hooks.on('init', () => {
    Handlebars.registerHelper('cap', function(string) {
        return string[0].toUpperCase() + string.slice(1); 
    });

    loadTemplates([
        "modules/token-action-hud/templates/category.hbs",
        "modules/token-action-hud/templates/subcategory.hbs",
        "modules/token-action-hud/templates/action.hbs"
    ]);

    let system = game.data.system.id;
    let rollHandlers = HandlersManager.getRollHandlerChoices(system);

    settings.registerSettings(system, rollHandlers);

    if (!game.tokenActionHUD) {
        let actionHandler = HandlersManager.getActionHandler(system);
        let handlerId = settings.get('rollHandler');
        
        if (! (handlerId === 'core' || game.modules.get(handlerId).active) ) {
            settings.Logger.error(handlerId, "not found, reverting to core roller.")
            handlerId = 'core';
            settings.set('rollHandler', handlerId);
        }

        let rollHandler = HandlersManager.getRollHandler(system, handlerId);
        
        game.tokenActionHUD = new TokenActionHUD(actionHandler, rollHandler);
    }
});

Hooks.on('canvasReady', () => {
    game.tokenActionHUD.setTokensReference(canvas.tokens);

    Hooks.on('controlToken', (token, controlled) => {
        if (game.tokenActionHUD.validTokenChange())
            game.tokenActionHUD.update();
    });
    
    Hooks.on('updateToken', (scene, token, diff, options, idUser) => {
        if (game.tokenActionHUD.validTokenChange())
            game.tokenActionHUD.update();
    });
    
    Hooks.on('deleteToken', (scene, token, empty, userId) => {
        if (game.tokenActionHUD.validTokenChange())
            game.tokenActionHUD.update();
    });
    
    Hooks.on('hoverToken', (token, hovered) => {
        if (game.tokenActionHUD.validTokenHover(token, hovered))
            game.tokenActionHUD.update();
    });
    
    Hooks.on('updateActor', (actor) => {
        if (game.tokenActionHUD.validActorOrItemUpdate(actor))
            game.tokenActionHUD.update();
    });
    
    Hooks.on('deleteActor', (actor) => {
        if (game.tokenActionHUD.validActorOrItemUpdate(actor))
            game.tokenActionHUD.update();
    });
    
    Hooks.on('deleteOwnedItem', (source, item) => {
        let actor = source.data;
        if (game.tokenActionHUD.validActorOrItemUpdate(actor))
            game.tokenActionHUD.update();
    });
    
    Hooks.on('createOwnedItem', (source, item) => {
        let actor = source.data;
        if (game.tokenActionHUD.validActorOrItemUpdate(actor))
            game.tokenActionHUD.update();
    });
    
    Hooks.on('updateOwnedItem', (source, item) => {
        let actor = source.data;
        if (game.tokenActionHUD.validActorOrItemUpdate(actor))
            game.tokenActionHUD.update();
    });
    
    Hooks.on('renderTokenActionHUD', () => {
        game.tokenActionHUD.trySetPos();
    });

    game.tokenActionHUD.update();
});