export function registerSettings(app, updateSettings) {

    game.settings.register(app,'ignorePassiveFeats', {
        name: "Ignore passive feats",
        hint: "If enabled, passive feats are not shown.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'showSpellInfo', {
        name: "Display spell information",
        hint: "If enabled, spell component information, concentration, and ritual status will be noted next to the spell name.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'showAllNonpreparableSpells', {
        name: "Show all non-preparable spells",
        hint: "If disabled, spells such as cantrips, innate, pact, and at-will spells need to be 'prepared' via the spell details to be shown on the HUD.",
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

    game.settings.register(app,'abbreviateSkills', {
        name: "Abbreviate skill and ability names",
        hint: "If enabled, skills and abilities will use a three-character abbreviation.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'splitAbilities', {
        name: "Show separate ability check and save categories",
        hint: "If enabled, abilities will be separated into checks and saves.",
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

    settings['showAllNpcItems'] = 'showAllNpcItems';
    settings['ignorePassiveFeats'] = 'ignorePassiveFeats';
    settings['showAllNonpreparableSpells'] = 'showAllNonpreparableSpells';
    settings['hideLongerActions'] = 'hideLongerActions';
    settings['abbreviateSkills'] = 'abbreviateSkills';
    settings['splitAbilities'] = 'splitAbilities';
    settings['showSpellInfo'] = 'showSpellInfo';
}