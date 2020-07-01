export function registerSettings(app, updateSettings) {
    game.settings.register(app,'abbreviateSkills', {
        name: "Abbreviate skill and ability names",
        hint: "If enabled, skills and abilities will use a three-character abbreviation.",
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

    game.settings.register(app,'showPcAbilities', {
        name: "Show PC abilities",
        hint: "If enabled, PCs will also have an Abilities category on their HUD.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });
}