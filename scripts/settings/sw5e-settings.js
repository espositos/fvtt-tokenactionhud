export function register(app, updateSettings) {
    game.settings.register(app,'ignorePassiveFeats', {
        name: game.i18n.localize('tokenactionhud.settings.sw5e.ignorePassiveFeats.name'),
        hint: game.i18n.localize('tokenactionhud.settings.sw5e.ignorePassiveFeats.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'hideLongerActions', {
        name: game.i18n.localize('tokenactionhud.settings.sw5e.hideLongerActions.name'),
        hint: game.i18n.localize('tokenactionhud.settings.sw5e.hideLongerActions.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'abbreviateSkills', {
        name: game.i18n.localize('tokenactionhud.settings.sw5e.abbreviateSkills.name'),
        hint: game.i18n.localize('tokenactionhud.settings.sw5e.abbreviateSkills.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'showEmptyItems', {
        name: game.i18n.localize('tokenactionhud.settings.sw5e.showEmptyItems.name'),
        hint: game.i18n.localize('tokenactionhud.settings.sw5e.showEmptyItems.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateSettings(value); }
    });
	
	    game.settings.register(app,'showConditionsCategory', {
        name: game.i18n.localize('tokenactionhud.settings.dnd5e.showConditionsCategory.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dnd5e.showConditionsCategory.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateFunc(value); }
    });
}
    