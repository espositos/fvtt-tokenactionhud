import {ActionListExtender} from './actionListExtender.js';
import * as settings from '../settings.js';

export class MagicItemActionListExtender extends ActionListExtender {
    constructor() { super(); }

    /** @override */
    extendActionList(actionList, multipleTokens) {
        if (multipleTokens)
            return;
            
        let tokenId = actionList.tokenId;
        let actorId = actionList.actorId;

        if (!actorId)
            return;

        let itemCategories = actionList.categories.find(c => c.id === 'inventory');
        let actor = MagicItems.actor(actorId);

        if (!(actor && itemCategories))
            return;

        let magicItems = actor.items ?? [];
        
        if (magicItems.length === 0)
            return;

        let magicItemsCategory = this.initializeEmptyCategory('magicItemsModule');
        magicItemsCategory.name = this.i18n('tokenactionhud.magicItems');

        let magicItemsIds = magicItems.map(item => item.id);
        
        itemCategories.subcategories.forEach(s => {
            
            s.actions.forEach(action => {
                if (!magicItemsIds.includes(action.id))
                    return;

                let magicItem = magicItems.find(item => item.id === action.id);

                if (magicItem.attuned && !this._isItemAttuned(magicItem))
                    return;

                if (magicItem.equipped && !this._isItemEquipped(magicItem))
                    return;

                let subcategory = this.initializeEmptySubcategory();
                subcategory.info1 = `${magicItem.uses}/${magicItem.charges}`;

                magicItem.ownedEntries.forEach(entry => {
                    let effect = entry.item;
                    let encodedValue = ['magicItem', tokenId, `${action.id}>${effect.id}`].join('|');
                    let img = this._getImage(effect);
                    let magicItemAction = {name: effect.name, id:effect.id, encodedValue: encodedValue, img:img};
                    magicItemAction.info1 = effect.consumption;
                    if (effect.baseLevel)
                        magicItemAction.info2 = `${this.i18n('tokenactionhud.levelAbbreviation')} ${effect.baseLevel}`;
                    subcategory.actions.push(magicItemAction);
                });

                subcategory.actions.unshift(action);

                this._combineSubcategoryWithCategory(magicItemsCategory, action.name, subcategory);
            });
        });

        this._combineCategoryWithList(actionList, magicItemsCategory.name, magicItemsCategory, false);
    }

    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }

    _isItemEquipped(magicItem) {
        return magicItem.item.data.data.equipped;
    }

    _isItemAttuned(magicItem) {
        return magicItem.item.data.data.attuned;
    }
}