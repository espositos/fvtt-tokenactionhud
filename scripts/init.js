import { TokenActionHUD } from './tokenactionhud.js';
import { SystemManagerFactory } from './managers/systemManagerFactory.js';
import { registerHandlerbars } from './utilities/handlebars.js';

const appName = 'token-action-hud';

let systemManager;

Hooks.on('init', () => {
    registerHandlerbars();
    
    let system = game.data.system.id;
    
    systemManager = SystemManagerFactory.create(system, appName);
    systemManager.registerSettings();
});

Hooks.on('canvasReady', async () => {

    let user = game.user;

    if (!user)
        throw new Error('Token Action HUD | No user found.')

    if (!game.tokenActionHUD) {
        game.tokenActionHUD = new TokenActionHUD(systemManager);
        await game.tokenActionHUD.init(user);
    }
    
    game.tokenActionHUD.setTokensReference(canvas.tokens);

    Hooks.on('controlToken', (token, controlled) => {
            game.tokenActionHUD.update();
    });
    
    Hooks.on('updateToken', (scene, token, diff, options, idUser) => {
        // If it's an X or Y change assume the token is just moving.
        if (diff.hasOwnProperty('y') || diff.hasOwnProperty('x'))
            return;
        if (game.tokenActionHUD.validTokenChange(token))
            game.tokenActionHUD.update();
    });
    
    Hooks.on('deleteToken', (scene, token, change, userId) => {
        if (game.tokenActionHUD.validTokenChange(token))
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
        game.tokenActionHUD.applySettings();
        game.tokenActionHUD.trySetPos();
    });

    Hooks.on('renderCompendium', (source, html) => {
        let metadata = source?.metadata;
        if (game.tokenActionHUD.isLinkedCompendium(`${metadata?.package}.${metadata?.name}`))
            game.tokenActionHUD.update();
    });

    Hooks.on('deleteCompendium', (source, html) => {
        let metadata = source?.metadata;
        if (game.tokenActionHUD.isLinkedCompendium(`${metadata?.package}.${metadata?.name}`))
            game.tokenActionHUD.update();
    });

    Hooks.on('createCombat', (combat) => {
        game.tokenActionHUD.update();
    });
    
    Hooks.on('deleteCombat', (combat) => {
        game.tokenActionHUD.update();
    });

    Hooks.on('updateCombat', (combat) => {
        game.tokenActionHUD.update();
    });

    Hooks.on('updateCombatant', (combat, combatant) => {
        game.tokenActionHUD.update();
    });

    Hooks.on('forceUpdateTokenActionHUD', () => {
        game.tokenActionHUD.update();
    })

    game.tokenActionHUD.update();
});