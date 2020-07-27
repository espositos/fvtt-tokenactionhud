import {HudCompendium} from './hudCompendium.js';
import {CompendiumHelper} from './compendiumHelper.js';
import * as settings from '../../settings.js';

export class CompendiumCategory {
    compendiums = [];
    id = '';
    title = '';

    constructor(filterManager, id, title) {
        this.filterManager = filterManager;
        this.id = id;
        this.key = id.slugify({strict:true})
        this.title = title;
    }

    async addToActionList(actionHandler, actionList) {
        let result = actionHandler.initializeEmptyCategory(this.id);
        result.canFilter = true;

        for (let compendium of this.compendiums) {
            await compendium.addToCategory(actionHandler, result);
        }

        let push = settings.get('pushCompendiumCategories');

        actionHandler._combineCategoryWithList(actionList, this.title, result, push);

        return actionList;
    }

    async selectCompendiums(compendiums) {
        compendiums = compendiums.filter(c => !!c.id)

        for (let comp of compendiums) {
            await this.addCompendium(comp);
        }

        if (this.compendiums.length === 0)
            return;

        let idMap = compendiums.map(c => c.id);
        for (var i = this.compendiums.length - 1; i >= 0; i--) {
            let compendium = this.compendiums[i];
            if (!idMap.includes(compendium.id))
               await this.removeCompendium(i)
        }

        this.updateFlag();
    }

    async addCompendium(compendium) {
        if (this.compendiums.some(c => c.id === compendium.id))
            return;

        if (!CompendiumHelper.exists(compendium.id))
            return;

        let hudCompendium = new HudCompendium(this.filterManager, this.key, compendium.id, compendium.title);

        hudCompendium.createFilter();
        await hudCompendium.submitFilterSuggestions();

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
        game.user.setFlag('token-action-hud', `compendiumCategories.${this.key}.title`, this.title);
        game.user.setFlag('token-action-hud', `compendiumCategories.${this.key}.id`, this.id);

        this.compendiums.map(c => c.updateFlag(this.id));
    }

    asTagifyEntry() {
        return {id: this.id, value: this.title}
    }

    getCompendiumsAsTagifyEntries() {
        return this.compendiums.map(c => c.asTagifyEntry())
    }
}