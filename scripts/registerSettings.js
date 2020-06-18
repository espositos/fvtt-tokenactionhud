export const registerSettings = function(rollHandlers) {
    const app = 'token-action-hud';
    game.settings.register(app,'roller', {
        name : "Token Action HUD roll handler",
        hint : "Choose output for Token Bar.",
        scope : "world",
        config : true,
        type : String,
        choices : rollHandlers,
        default : "core"
    });
    game.settings.register(app,'playerPermission', {
        name : "Allow Token Action HUD for all players",
        hint : "Disable to restrict use to the GM",
        scope : "world",
        config : true,
        type : Boolean,
        default : true
    });
    game.settings.register(app,'userEnabled', {
        name : "Toggle Token Action HUD",
        hint : "Disable if you (the user) don't want to use the Token Action HUD",
        scope : "client",
        config : true,
        type : Boolean,
        default : true
    });

    if (game.data.system.id === 'dnd5e') {
        game.settings.register(app,'ignorePassiveFeats', {
            name : "Ignore passive feats",
            hint : "Disable if you (the user) would like to see passive feats in the Token Action HUD",
            scope : "client",
            config : true,
            type : Boolean,
            default : true
        });

        game.settings.register(app,'npcShowAllItems', {
            name : "NPCs - show all items (not only equipped)",
            hint : "Disable if you would like unequipped NPC items to be hidden from the HUD.",
            scope : "client",
            config : true,
            type : Boolean,
            default : true
        });
    }

    if(debug) {log(rollHandlers, game.settings);}
}

export const hudSettings = {
    npcShowAllItems: 'npcShowAllItems',
    ignorePassiveFeats: 'ignorePassiveFeats',
    userEnabled: 'userEnabled',
    playerPermission: 'playerPermission',
    roller: 'core'
};