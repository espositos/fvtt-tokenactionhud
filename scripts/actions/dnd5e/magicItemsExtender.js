import {ActionListExtender} from '../actionListExtender.js';

export class MagicItemActionListExtender extends ActionListExtender {
    constructor() { super(); }

    /** @override */
    extendActionList(actionList) {
        let tokenId = actionList.tokenId;
        let actorId = actionList.actorId;

        let itemCategories = actionList.categories.find(c => c.id === 'items');
        let magicItems = MagicItemActor.get(actorId).items;
        
        if (magicItems.length === 0)
            return;

        let magicItemsIds = magicItems.map(items => items._id);
        
        itemCategories.subcategories.forEach(s => {
            let magicItemActions = [];
            s.actions.forEach(action => {
                if (!magicItemsIds.includes(action.id))
                    return;

                magicItemActions.push({id:action.id, actions: []});
                let actionsArray = magicItemActions.find(a => a.id === action.id).actions;
                let item = magicItems.find(item => item._id === action.id);

                item.ownedEntries.forEach(spell => {
                    let encodedValue = ['magicItem', tokenId, `${spell.pack}>${spell._id}`].join('|');
                    actionsArray.push({name: spell.name, id:spell._id, encodedValue: encodedValue});
                });
            });

            magicItemsActions.forEach(m => {
                let index = s.actions.findIndex(a => a.id === m.id);
                s.actions.splice(index, 0, ...m.actions)
            })
        });
    }
}