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

        let magicItemsIds = magicItems.map(item => item.id);
        
        itemCategories.subcategories.forEach(s => {
            let magicItemActions = [];
            
            s.actions.forEach(action => {
                if (!magicItemsIds.includes(action.id))
                    return;

                magicItemActions.push({id:action.id, actions: []});
                let actionsArray = magicItemActions.find(a => a.id === action.id).actions;
                let item = magicItems.find(item => item.id === action.id);

                item.ownedEntries.forEach(entry => {
                    let spell = entry.item;
                    let encodedValue = ['magicItem', tokenId, `${action.id}>${spell.id}`].join('|');
                    let magicItemAction = {name: spell.name, id:spell.id, encodedValue: encodedValue};
                    magicItemAction.info1 = spell.consumption;
                    magicItemAction.info2 = `${this.i18n('tokenactionhud.level')} ${spell.baseLevel}`;
                    magicItemAction.info3 = `${item.uses}/${item.charges}`;
                    actionsArray.push(magicItemAction);
                });
            });

            magicItemActions.forEach(m => {
                let index = s.actions.findIndex(a => a.id === m.id) + 1;
                s.actions.splice(index, 0, ...m.actions)
            })
        });
    }
}