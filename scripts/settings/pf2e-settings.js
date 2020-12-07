export function register(app, updateSettings) {    
    game.settings.register(app,'showPcAbilities', {
        name: game.i18n.localize('tokenactionhud.settings.pf2e.showPcAbilities.name'),
        hint: game.i18n.localize('tokenactionhud.settings.pf2e.showPcAbilities.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'showNpcAbilities', {
        name: game.i18n.localize('tokenactionhud.settings.pf2e.showNpcAbilities.name'),
        hint: game.i18n.localize('tokenactionhud.settings.pf2e.showNpcAbilities.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'showOldNpcStrikes', {
        name: game.i18n.localize('tokenactionhud.settings.pf2e.showOldNpcStrikes.name'),
        hint: game.i18n.localize('tokenactionhud.settings.pf2e.showOldNpcStrikes.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'ignorePassiveActions', {
        name: game.i18n.localize('tokenactionhud.settings.pf2e.ignorePassiveActions.name'),
        hint: game.i18n.localize('tokenactionhud.settings.pf2e.ignorePassiveActions.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'separateTogglesCategory', {
        name: game.i18n.localize('tokenactionhud.settings.pf2e.separateTogglesCategory.name'),
        hint: game.i18n.localize('tokenactionhud.settings.pf2e.separateTogglesCategory.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateSettings(value); }
    });

    game.settings.register(app,'calculateAttackPenalty', {
        name: game.i18n.localize('tokenactionhud.settings.pf2e.calculateAttackPenalty.name'),
        hint: game.i18n.localize('tokenactionhud.settings.pf2e.calculateAttackPenalty.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'printSpellCard', {
        name: game.i18n.localize('tokenactionhud.settings.pf2e.printSpellCard.name'),
        hint: game.i18n.localize('tokenactionhud.settings.pf2e.printSpellCard.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateSettings(value); }
    });
    
    game.settings.register(app,'abbreviateSkills', {
        name: game.i18n.localize('tokenactionhud.settings.pf2e.abbreviateSkills.name'),
        hint: game.i18n.localize('tokenactionhud.settings.pf2e.abbreviateSkills.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateSettings(value); }
    });
}