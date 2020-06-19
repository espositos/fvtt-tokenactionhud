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

    settings.registerSettings(rollHandlers);

    if (!game.tokenActionHUD) {
        let actionHandler = HandlersManager.getActionHandler(system);
        let handlerId = settings.get('rollHandler');
        let rollHandler = HandlersManager.getRollHandler(system, handlerId);
        
        game.tokenActionHUD = new TokenActionHUD(actionHandler, rollHandler);
    }

});

Hooks.on('ready', () => {
    ///game.tokenActionHUD.render(true);
});

Hooks.on('canvasReady', () => {
    game.tokenActionHUD.setTokensReference(canvas.tokens);
});

Hooks.on('controlToken', () => {
    if (game.tokenActionHUD.shouldUpdateOnControlTokenChange())
        game.tokenActionHUD.update();
});

Hooks.on('updateToken', () => {
    if (game.tokenActionHUD.shouldUpdateOnControlTokenChange())
        game.tokenActionHUD.update();
});

Hooks.on('deleteToken', () => {
    if (game.tokenActionHUD.shouldUpdateOnControlTokenChange())
        game.tokenActionHUD.update();
});

Hooks.on('updateActor', (actor) => {
    if (game.tokenActionHUD.shouldUpdateOnActorOrItemUpdate(actor))
        game.tokenActionHUD.update();
});

Hooks.on('deleteActor', (actor) => {
    if (game.tokenActionHUD.shouldUpdateOnActorOrItemUpdate(actor))
        game.tokenActionHUD.update();
});

Hooks.on('deleteOwnedItem', (source, item) => {
    let actor = source.data;
    if (game.tokenActionHUD.shouldUpdateOnActorOrItemUpdate(actor))
        game.tokenActionHUD.update();
});

Hooks.on('createOwnedItem', (source, item) => {
    let actor = source.data;
    if (game.tokenActionHUD.shouldUpdateOnActorOrItemUpdate(actor))
        game.tokenActionHUD.update();
});

Hooks.on('updateOwnedItem', (source, item) => {
    let actor = source.data;
    if (game.tokenActionHUD.shouldUpdateOnActorOrItemUpdate(actor))
        game.tokenActionHUD.update();
});

Hooks.on('renderTokenActionHUD', () => {
    game.tokenActionHUD.trySetUserPos();
});