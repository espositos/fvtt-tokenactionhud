export function registerSettings(app, updateSettings) {    
        game.settings.register(app,'showPcAbilities', {
            name: "Show PC abilities",
            hint: "If enabled, PCs will also have an Abilities category on their HUD.",
            scope: "client",
            config: true,
            type: Boolean,
            default: true,
            onChange: value => { updateSettings(value); }
        });
    
    game.settings.register(app,'showNpcAbilities', {
        name: "Show NPC abilities",
        hint: "If enabled, NPCs will also have an Abilities category on their HUD.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'calculateAttackPenalty', {
        name: "Show calculated MAP",
        hint: "If enabled, strikes will show their calculated attack bonus (attack bonus - MAP) instead of the flat MAP.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'printSpellCard', {
        name: "Print spell card to chat",
        hint: "If disabled, left-clicking a spell will roll attack, right-clicking will roll damage. If attack or damage are not applicable, the other other will be rolled. If neither are applicable, the spell card will be printed to chat anyway.",
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
}