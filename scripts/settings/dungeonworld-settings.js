export function register(app, updateSettings) {
    game.settings.register(app,'showGmCompendiums', {
        name: game.i18n.localize('tokenactionhud.settings.dungeonworld.showGmCompendiums.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dungeonworld.showGmCompendiums.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });
}
    