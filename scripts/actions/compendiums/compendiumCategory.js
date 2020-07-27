import {HudCompendium} from './hudCompendium.js';
import {CompendiumHelper} from './compendiumHelper.js';

export class CompendiumCategory {
    compendiums = [];
    id = '';
    title = '';

    constructor(filterManager, id, title) {
        this.filterManager = filterManager;
        this.id = id;
        this.title = title;
    }

    addToActionList(actionHandler, actionList) {
        let result = actionHandler.initializeEmptyCategory(this.id);
        this.compendiums.forEach(c => c.addToCategory(actionHandler, result));
        result.canFilter = true;
        actionHandler._combineCategoryWithList(actionList, this.title, result);
        return actionList;
    }

    selectCompendiums(compendiums) {
        compendiums = compendiums.filter(c => !!c.id)

        for (let comp of compendiums) {
            this.addCompendium(comp);
        }

        if (this.compendiums.length === 0)
            return;

        let idMap = compendiums.map(c => c.id);
        for (var i = this.compendiums.length - 1; i >= 0; i--) {
            let compendium = this.compendiums[i];
            if (!idMap.includes(compendium.id))
                this.removeCompendium(i)
        }

        this.updateFlag();
    }

    addCompendium(compendium) {
        if (this.compendiums.some(c => c.id === compendium.id))
            return;

        if (!CompendiumHelper.exists(compendium.id))
            return;

        let hudCompendium = new HudCompendium(this.filterManager, compendium.id, compendium.title);

        this.compendiums.push(hudCompendium);
    }

    async removeCompendium(index) {
        let compendium = this.compendiums[index];
        await compendium.clearFilter();
        this.compendiums.splice(index, 1);
    }

    async prepareForDelete() {
        await this.clearFilters();
        await this.unsetFlag();
    }

    async clearFilters() {
        for (let c of this.compendiums) {
            await c.clearFilter();
        }
    }

    async unsetFlag() {
        await game.user.setFlag('token-action-hud', 'compendiumCategories', {[`-=${this.id}`]: null});
    }

    async updateFlag() {
        let compendiums = this.compendiums.map(c => {return {id: c.id, title: c.title }});
        let contents = {title: this.title, compendiums: compendiums};
        await this.unsetFlag();
        await game.user.setFlag('token-action-hud', `compendiumCategories.${this.id}`, contents);
    }

    asTagifyEntry() {
        return {id: this.id, value: this.title}
    }

    getCompendiumsAsTagifyEntries() {
        return this.compendiums.map(c => c.asTagifyEntry())
    }
}