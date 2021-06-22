export function register(appName, updateFunc) {

    game.settings.register(appName,'ignorePassiveFeats', {
        name: game.i18n.localize('tokenactionhud.settings.dnd5e.ignorePassiveFeats.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dnd5e.ignorePassiveFeats.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'showSpellInfo', {
        name: game.i18n.localize('tokenactionhud.settings.dnd5e.showSpellInfo.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dnd5e.showSpellInfo.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'showAllNonpreparableSpells', {
        name: game.i18n.localize('tokenactionhud.settings.dnd5e.showAllNonpreparableSpells.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dnd5e.showAllNonpreparableSpells.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'hideLongerActions', {
        name: game.i18n.localize('tokenactionhud.settings.dnd5e.hideLongerActions.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dnd5e.hideLongerActions.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'abbreviateSkills', {
        name: game.i18n.localize('tokenactionhud.settings.dnd5e.abbreviateSkills.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dnd5e.abbreviateSkills.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'splitAbilities', {
        name: game.i18n.localize('tokenactionhud.settings.dnd5e.splitAbilities.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dnd5e.splitAbilities.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'showAllNpcItems', {
        name: game.i18n.localize('tokenactionhud.settings.dnd5e.showAllNpcItems.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dnd5e.showAllNpcItems.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'showEmptyItems', {
        name: game.i18n.localize('tokenactionhud.settings.dnd5e.showEmptyItems.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dnd5e.showEmptyItems.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: value => { updateFunc(value); }
    });

    game.settings.register(appName,'showConditionsCategory', {
        name: game.i18n.localize('tokenactionhud.settings.dnd5e.showConditionsCategory.name'),
        hint: game.i18n.localize('tokenactionhud.settings.dnd5e.showConditionsCategory.hint'),
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { updateFunc(value); }
    });

    if (game.modules.get('character-actions-list-5e')?.active) {
        game.settings.register(appName,'useActionList', {
            name : game.i18n.localize('tokenactionhud.settings.useActionList.name'),
            hint : game.i18n.localize('tokenactionhud.settings.useActionList.hint'),
            scope : 'client',
            config : true,
            type : Boolean,
            default : false,
            onChange: value => { updateFunc(value); }
        });
    }
}
