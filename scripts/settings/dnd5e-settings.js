export function registerSettings(app, settings, updateSettings) {

    game.settings.register(app,'ignorePassiveFeats', {
        name: "Ignore passive feats",
        hint: "If enabled, passive feats are not shown.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'showAllNpcItems', {
        name: "Show all NPC items",
        hint: "If enabled, all items are shown for NPCs, not just equipped items.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'hideLongerActions', {
        name: "Hide actions with an activation longer than 1 round",
        hint: "If enabled, actions with longer activation types (minutes, hours, or days) are not shown.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });

    settings['showAllNpcItems'] = 'showAllNpcItems';
    settings['ignorePassiveFeats'] = 'ignorePassiveFeats';
    settings['hideLongerActions'] = 'hideLongerActions';
}