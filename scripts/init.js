import { ActionHandler5e } from "./actions/actions-dnd5e.js";
import { ResourceBuilder5e } from "./resources/resources-dnd5e.js";
import { TokenActionHUD } from "./tokenactionhud.js";
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
});

Hooks.on('init', () => {
    console.log("Token Action HUD | Initializing");
    
    if (!game.tokenActionHUD) {
        let resourceBuilder = new ResourceBuilder5e();
        let actionHandler = new ActionHandler5e(macros, resourceBuilder);
        game.tokenActionHUD = new TokenActionHUD(actionHandler);
    }
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

Hooks.on('updateActor', (actor) => {
    if (game.tokenActionHUD.shouldUpdateOnActorUpdate(actor))
        game.tokenActionHUD.update();
});
