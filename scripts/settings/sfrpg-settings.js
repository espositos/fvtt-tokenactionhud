export function register(app, updateSettings) {
    game.settings.register(app,'showSpellInfo', {
        name: game.i18n.localize('tokenactionhud.settings.sfrpg.showSpellInfo.name'),
        hint: game.i18n.localize('tokenactionhud.settings.sfrpg.showSpellInfo.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'showMiscFeats', {
        name: game.i18n.localize('tokenactionhud.settings.sfrpg.showMiscFeats.name'),
        hint: game.i18n.localize('tokenactionhud.settings.sfrpg.showMiscFeats.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });
}