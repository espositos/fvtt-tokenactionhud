import {ActionListExtender} from '../actionListExtender.js';
import * as settings from '../../settings.js';

export class ItemMacroActionListExtender extends ActionListExtender {
    constructor() { super(); }

    /** @override */
    extendActionList(actionList) {
        let tokenId = actionList.tokenId;
        let actorId = actionList.actorId;

        if (!actorId)
            return;

        let itemIds = ItemMacro.getTokenItems(tokenId).map(item => item.data._id);

        if (!itemIds)
            return;

        if (itemIds.length === 0)
            return;

        let replace = settings.get('itemMacroReplace');
        let itemCatIds = ['spells', 'feats', 'inventory'];

        actionList.categories.filter(c => itemCatIds.includes(c.id)).forEach(category => {
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
            macroActions.push(macroAction);
        })

        // if replacing, actions should have already been edited in place, no need to add.
        if (replace)
            return;

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

        return newAction;
    }

    addActionsToSubcategory(subcategory, macroActions) {
        macroActions.forEach(ma => {
            let index = subcategory.actions.findIndex(a => a.id === ma.id) + 1;
            subcategory.actions.splice(index, 0, ma);
        })
    }
}