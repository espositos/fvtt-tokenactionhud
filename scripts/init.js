import { ActionHandler5e } from "./actions/actions-dnd5e.js";
import { ResourceBuilder5e } from "./resources/resources-dnd5e.js";
import { TokenActionHUD } from "./tokenactionhud.js";
import { registerSettings } from "./registerSettings.js";
import * as macros from "./rolls/base-dnd5e-rolls.js";

Hooks.on('init', () => {
    Handlebars.registerHelper('cap', function(string) {
        return string[0].toUpperCase() + string.slice(1); 
    });

    loadTemplates([
        "modules/tokenActionHud/templates/category.hbs",
        "modules/tokenActionHud/templates/subcategory.hbs",
        "modules/tokenActionHud/templates/action.hbs"
    ]);

    if (!game.tokenActionHUD) {
        let resourceBuilder = new ResourceBuilder5e();
        let actionHandler = new ActionHandler5e(macros, resourceBuilder);
        game.tokenActionHUD = new TokenActionHUD(actionHandler);
    }

    registerSettings(game.tokenActionHUD);
});

Hooks.on('ready', () => {
    game.tokenActionHUD.render(true);
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

Hooks.on('updateActor', (actor) => {
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
