export function registerSettings(app, settings) {

    game.settings.register(app,'ignorePassiveFeats', {
        name: "Ignore passive feats",
        hint: "Disable if you (the user) would like to see passive feats in the Token Action HUD",
        scope: "client",
        config: true,
        type: Boolean,
        default: true
    });
    
    game.settings.register(app,'npcShowAllItems', {
        name: "NPCs - show all items (not only equipped)",
        hint: "Disable if you would like unequipped NPC items to be hidden from the HUD.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true
    });

    settings['npcShowAllItems'] = 'npcShowAllItems';
    settings['ignorePassiveFeats'] = 'ignorePassiveFeats';
}
    