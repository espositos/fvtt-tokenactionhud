import {HudCompendium} from './hudCompendium.js';

export class CompendiumCategory {
    compendiums = [];
    id = '';
    title = '';

    constructor(actionHandler, id, title) {
        this.actionHandler = actionHandler;
        this.id = id;
        this.title = title;
    }

    addToActionList(actionList) {
        let result = this.actionHandler.initializeEmptyCategory(this.id);
        this.compendiums.forEach(c => c.addToCategory(result));
        this.actionHandler._combineCategoryWithList(actionList, this.title, result);
        return actionList;
    }

    selectCompendiums(compendiums) {
        for (let c of compendiums) {
            this.addCompendium(c);
        }

        for (var i = this.compendiums.length - 1; i >= 0; i--) {
            if (!idMap.includes(this.compendiums[i].id))
                this.compendiums.splice(i, 1);
        }

        this.updateFlag();
    }

    addCompendium(compendium) {
        if (this.compendiums.any(c => c.id === compendium.id))
            return;

        let hudCompendium = new HudCompendium(this.actionHandler, this.filterManager, compendium.id, compendium.value);

        this.compendiums.push(hudCompendium);
    }

    unsetFlag() {
        game.user.unsetFlag('token-action-hud', `categories.${this.id}`);
    }

    updateFlag() {
        let compendiums = this.compendiums.map(c => {return {id: c.id, title: c.title }});
        let contents = {title: this.title, compendiums: compendiums};
        game.user.setFlag('token-action-hud', `categories.${this.id}`, contents);
    }
}