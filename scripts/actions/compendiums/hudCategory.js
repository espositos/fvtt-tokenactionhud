import {HudCompendium} from './hudCompendium.js';

export class HudCategory {
    compendiums = [];
    id = '';
    title = '';

    constructor(actionHandler, id, title) {
        this.actionHandler = actionHandler;
        this.id = id;
        this.title = title;
    }

    addToList(actionList) {
        let result = this.actionHandler.initializeEmptyCategory(this.id);
        this.compendiums.forEach(c => c.addToCategory(result));
        this.actionHandler._combineCategoryWithList(actionList, this.title, result);
        return actionList;
    }

    setCompendiums(compendiums) {
        for (let c of compendiums) {
            this.addCompendium(c);
        }

        for (var i = this.compendiums.length - 1; i >= 0; i--) {
            if (!idMap.includes(this.compendiums[i].id))
                this.compendiums.splice(i, 1);
        }
    }

    addCompendium(compendium) {
        if (this.compendiums.any(c => c.id === compendium.id))
            return;

        let hudCompendium = new HudCompendium(this.actionHandler, this.filterManager, compendium.id, compendium.value);

        this.compendiums.push(hudCompendium);
    }
}