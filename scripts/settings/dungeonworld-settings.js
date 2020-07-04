export function registerSettings(app, updateSettings) {
    game.settings.register(app,'showGmCompendiums', {
        name: "Show GM Compendiums",
        hint: "If enabled, and if the user is a GM, the HUD bar will include GM moves, treasure rollable-tables, and charts.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });
}
    