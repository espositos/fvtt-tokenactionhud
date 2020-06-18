export function registerSettings(app, settings) {

    game.settings.register(app,'ignorePassiveFeats', {
        name: "Ignore passive feats",
        hint: "Disable if you (the user) would like to see passive feats in the Token Action HUD",
        scope: "client",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(app,'showAllNpcItems', {
        name: "Show all NPC items",
        hint: "Determines whether all NPC items are shown, or only equipped items.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true
    });

    settings['showAllNpcItems'] = 'showAllNpcItems';
    settings['ignorePassiveFeats'] = 'ignorePassiveFeats';
}
    