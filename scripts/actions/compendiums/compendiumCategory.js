import {HudCompendium} from './hudCompendium.js';

export class CompendiumCategory {
    compendiums = [];
    id = '';
    title = '';

    constructor(id, title) {
        this.id = id;
        this.title = title;
    }

    addToActionList(actionHandler, actionList) {
        let result = actionHandler.initializeEmptyCategory(this.id);
        this.compendiums.forEach(c => c.addToCategory(result));
        actionHandler._combineCategoryWithList(actionList, this.title, result);
        return actionList;
    }

    selectCompendiums(compendiums) {
        for (let c of compendiums) {
            this.addCompendium(c);
        }

        if (this.compendiums.length === 0)
            return;

        for (var i = this.compendiums.length - 1; i >= 0; i--) {
            let compendium = this.compendiums[i];
            if (!idMap.includes(compendium.id))
                this.compendiums = this.compendiums.splice(i, 1);
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
        game.user.setFlag('token-action-hud', 'compendiumCategories', {[`-=${this.id}`]: null});
    }

    updateFlag() {
        let compendiums = this.compendiums.map(c => {return {id: c.id, title: c.title }});
        let contents = {title: this.title, compendiums: compendiums};
        game.user.setFlag('token-action-hud', `compendiumCategories.${this.id}`, contents);
    }

    asTagifyEntry() {
        return {id: this.id, value: this.title}
    }
}