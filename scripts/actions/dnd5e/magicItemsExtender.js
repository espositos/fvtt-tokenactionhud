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
        let magicItems = MagicItems.actor(actorId).items;
        
        if (magicItems.length === 0)
            return;

        let magicItemsCategory = this.initializeEmptyCategory('magicitems');
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
                    let spell = entry.item;
                    let encodedValue = ['magicItem', tokenId, `${action.id}>${spell.id}`].join('|');
                    let magicItemAction = {name: spell.name, id:spell.id, encodedValue: encodedValue};
                    magicItemAction.info1 = spell.consumption;
                    magicItemAction.info2 = `${this.i18n('tokenactionhud.levelAbbreviation')} ${spell.baseLevel}`;
                    subcategory.actions.push(magicItemAction);
                });

                subcategory.actions.unshift(action);

                this._combineSubcategoryWithCategory(magicItemsCategory, action.name, subcategory);
            });
        });

        actionList.categories.unshift(magicItemsCategory);
    }
}