import {ActionListExtender} from './actionListExtender.js';
import {SystemManager} from '../managers/manager.js';
import * as settings from '../settings.js';

export class ItemMacroActionListExtender extends ActionListExtender {
    constructor() { super(); }

    /** @override */
    extendActionList(actionList, multipleTokens) {
        if (multipleTokens)
            return;

        let tokenId = actionList.tokenId;
        let actorId = actionList.actorId;

        if (!actorId)
            return;

        let actor = this.getActor(tokenId);
        let items = actor.items.filter(item => item.hasMacro());

        let itemIds;
        if (SystemManager.isModuleActive('midi-qol')) {
            itemIds = items.filter(this.isUnsupportedByMidiQoL).map(item => item.data._id);
        } else {
            itemIds = items.map(item => item.data._id);
        }

        if (!itemIds)
            return;

        if (itemIds.length === 0)
            return;

        let itemMacroSetting = settings.get('itemMacroReplace');

        if (itemMacroSetting === 'showOriginal')
            return actionList;

        let replace = itemMacroSetting === 'showItemMacro';

        actionList.categories.forEach(category => {
            category.subcategories.forEach(subcategory => {
                this.addSubcategoryActions(itemIds, subcategory, replace);
            });
        });

        return actionList;
    }

    addSubcategoryActions(itemIds, subcategory, replace) {
        if (subcategory.subcategories && subcategory.subcategories.length > 0)
            subcategory.subcategories.forEach(s => this.addSubcategoryActions(itemIds, s, replace));
        
        let macroActions = [];
        subcategory.actions.forEach(action => {
            if (!itemIds.includes(action.id))
                return;

            let macroAction = this.createItemMacroAction(action, replace)

            // if replacing, actions should have already been edited in place, no need to add.
            if (!replace)
                macroActions.push(macroAction);
        })

        this.addActionsToSubcategory(subcategory, macroActions);
    }

    createItemMacroAction(action, replace) {
        let macroType = 'itemMacro';
        let newAction = replace ? action : {};

        let keep = action.encodedValue.substr(action.encodedValue.indexOf(this.delimiter));
        newAction.encodedValue = macroType + keep;
        newAction.name = replace ? action.name : `(M) ${action.name}`
        newAction.id = action.id;
        newAction.img = action.img;
        newAction.icon = action.icon;

        newAction.info1 = action.info1;
        newAction.info2 = action.info2;
        newAction.info3 = action.info3;
    
        return newAction;
    }

    addActionsToSubcategory(subcategory, macroActions) {
        macroActions.forEach(ma => {
            let index = subcategory.actions.findIndex(a => a.id === ma.id) + 1;
            subcategory.actions.splice(index, 0, ma);
        })
    }

    isUnsupportedByMidiQoL(item) {
        let flag = item.getFlag('midi-qol', 'onUseMacroName');
        return !flag;
    }

    getActor(tokenId) {
        return canvas.tokens.placeables.find(t => t.data._id === tokenId)?.actor;
    }
}