import {ActionListExtender} from '../actionListExtender.js';

export class MagicItemActionListExtender extends ActionListExtender {
    constructor() { super(); }

    /** @override */
    extendActionList(actionList) {
        let tokenId = actionList.tokenId;
        let actorId = actionList.actorId;

        if (!actorId)
            return;

        let itemCategories = actionList.categories.find(c => c.id === 'inventory');
        let actor = MagicItems.actor(actorId);

        if (!actor)
            return;

        let magicItems = MagicItems.actor(actorId).items ?? [];
        
        if (magicItems.length === 0)
            return;

        let magicItemsCategory = this.initializeEmptyCategory('magicItemsModule');
        magicItemsCategory.name = this.i18n('tokenactionhud.magicItems');

        let magicItemsIds = magicItems.map(item => item.id);
        
        itemCategories.subcategories.forEach(s => {
            let magicItemActions = [];
            
            s.actions.forEach(action => {
                if (!magicItemsIds.includes(action.id))
                    return;

                let magicItem = magicItems.find(item => item.id === action.id);

                let subcategory = this.initializeEmptySubcategory();
                subcategory.info1 = `${magicItem.uses}/${magicItem.charges}`;

                magicItem.ownedEntries.forEach(entry => {
                    let effect = entry.item;
                    let encodedValue = ['magicItem', tokenId, `${action.id}>${effect.id}`].join('|');
                    let magicItemAction = {name: effect.name, id:effect.id, encodedValue: encodedValue};
                    magicItemAction.info1 = effect.consumption;
                    if (effect.baseLevel)
                        magicItemAction.info2 = `${this.i18n('tokenactionhud.levelAbbreviation')} ${effect.baseLevel}`;
                    subcategory.actions.push(magicItemAction);
                });

                subcategory.actions.unshift(action);

                this._combineSubcategoryWithCategory(magicItemsCategory, action.name, subcategory);
            });
        });

        actionList.categories.unshift(magicItemsCategory);
    }
}