export function register(app, updateSettings) {
    game.settings.register(app,'abbreviateAttributes', {
        name: game.i18n.localize('tokenactionhud.settings.swade.abbreviateAttributes.name'),
        hint: game.i18n.localize('tokenactionhud.settings.swade.abbreviateAttributes.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateFunc(value); }
    });
}
    