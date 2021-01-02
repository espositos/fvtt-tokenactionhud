import { ActionHandler } from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerSwade extends ActionHandler {
    constructor (filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    /** @override */
    async doBuildActionList(token, multipleTokens) {
        let result = this.initializeEmptyActionList();

        if (!token)
            return result;

        let tokenId = token.data._id;

        result.tokenId = tokenId;

        let actor = token.actor;

        if (!actor)
            return result;

        result.actorId = actor._id;

        this._addAttributes(result, tokenId, actor);
        this._addSkills(result, tokenId, actor);
        this._addStatuses(result, tokenId, actor);
        this._addWoundsAndFatigue(result, tokenId, actor);
        this._addBennies(result, tokenId, actor);
        this._addPowers(result, tokenId, actor);
        this._addInventory(result, tokenId, actor);
        this._addEdgesAndHinderances(result, tokenId, actor);
        this._addUtilities(result, tokenId, actor);
    
        if (settings.get('showHudTitle'))
            result.hudTitle = token.data?.name;

        return result;
    }

    /** @private */
    _addAttributes(list, tokenId, actor) {
        const attr = actor.data.data.attributes;
        const macroType = 'attribute';

        const subcat = this.initializeEmptySubcategory('attributes');
        Object.entries(attr).forEach(a => {
            const key = a[0];
            const data = a[1];

            const nameData = CONFIG.SWADE.attributes[key];

            let name;
            if (settings.get('abbreviateAttributes'))
                name = this.i18n(nameData.short);
            else
                name = this.i18n(nameData.long);

            const encodedValue = [macroType, tokenId, key].join(this.delimiter);
            const action = {name: name, encodedValue: encodedValue, id: key};

            const mod = this._buildDieString(data.die, data['wild-die']);
            action.info1 = mod;

            subcat.actions.push(action);
        })

        const catName = this.i18n('tokenactionhud.attributes');
        let cat = this.initializeEmptyCategory('attributes');
        this._combineSubcategoryWithCategory(cat, catName, subcat);
        this._combineCategoryWithList(list, catName, cat);
    }

    /** @private */
    _addSkills(list, tokenId, actor) {
        const cat = this.initializeEmptyCategory('skills');
        const macroType = 'skill';
        const skills = actor.data.items.filter(i => i.type === macroType);

        const subcat = this.initializeEmptySubcategory('skills');
        skills.forEach(s => {
            const encodedValue = [macroType, tokenId, s._id].join(this.delimiter);
            const action = {name: s.name, encodedValue: encodedValue, id: s._id};

            let mod = this._parseDie(s.data.die, s.data['wild-die']);
            action.info1 = mod;

            subcat.actions.push(action);
        });

        const skillName = this.i18n('tokenactionhud.skills');
        this._combineSubcategoryWithCategory(cat, skillName, subcat);
        this._combineCategoryWithList(list, skillName, cat);
    }

    /** @private */
    _addPowers(list, tokenId, actor) {
        
        const powers = actor.data.items.filter(i => i.type === 'power');
        if (powers.length === 0)
            return;
        
        const macroType = 'powerPoints';
        const cat = this.initializeEmptyCategory(macroType);

        const pp = actor.data.data.powerPoints;
        if (pp)
            cat.info1 = `${pp.value}/${pp.max}`;

        this._addCounterSubcategory(cat, tokenId, pp, this.i18n('tokenactionhud.points'), macroType);

        const powersName = this.i18n('tokenactionhud.powers');

        const groupedPowers = this._groupPowers(powers);
        Object.entries(groupedPowers).forEach(g => {
            const key = g[0];
            const groupPowers = g[1];
            this._addPowersSubcategory(tokenId, key, groupPowers, macroType, cat);
        })

        this._combineCategoryWithList(list, powersName, cat);
    }

    /** @private */
    _groupPowers(powers) {
        const powerTypes = [...new Set(powers.map(i => i.data.rank))];

        return powerTypes.reduce((grouped, p) => {
            let powerName = p;
            if (powerName === '')
                powerName = 'No rank';

            if (!grouped.hasOwnProperty(p))
                grouped[powerName] = [];

                grouped[powerName].push(...powers.filter(i => i.data.rank === p));

            return grouped;
        }, {});
    }

    /** @private */
    _addInventory(list, tokenId, actor) {
        const cat = this.initializeEmptyCategory('inventory');

        let items = actor.data.items;

        if (actor.data.type === 'character')
            items = items.filter(i => i.data.equipped);

        const weapons = items.filter(i => i.type === 'weapon');
        const weaponsName = this.i18n('tokenactionhud.weapons');
        this._addItemSubcategory(tokenId, weaponsName, weapons, 'weapons', cat);

        const armour = items.filter(i => i.type === 'armor');
        const armourName = this.i18n('tokenactionhud.armour');
        this._addItemSubcategory(tokenId, armourName, armour, 'armour', cat);

        const shields = items.filter(i => i.type === 'shield');
        const shieldsName = this.i18n('tokenactionhud.shields');
        this._addItemSubcategory(tokenId, shieldsName, shields, 'shields', cat);

        const misc = items.filter(i => i.type === 'misc' || i.type === 'gear');
        const miscName = this.i18n('tokenactionhud.misc');
        this._addItemSubcategory(tokenId, miscName, misc, 'misc', cat);

        this._combineCategoryWithList(list, this.i18n('tokenactionhud.inventory'), cat);
    }

    /** @private */
    _addWoundsAndFatigue(list, tokenId, actor) {
        let cat = this.initializeEmptyCategory('wounds');

        let woundsName = this.i18n('tokenactionhud.wounds');
        this._addCounterSubcategory(cat, tokenId, actor.data.data.wounds, woundsName, 'wounds');
        
        let fatigueName = this.i18n('tokenactionhud.fatigue');
        this._addCounterSubcategory(cat, tokenId, actor.data.data.fatigue, fatigueName, 'fatigue');

        this._combineCategoryWithList(list, this.i18n('tokenactionhud.woundsAndFatigue'), cat);
    }

    /** @private */
    _addCounterSubcategory(category, tokenId, countItem, name, macroType) {
        if (!countItem || (countItem.max < 1 && countItem.value < 1))
            return;
        
        const decreaseValue = [macroType, tokenId, 'decrease'].join(this.delimiter);
        const decreaseAction = {name:'-', encodedValue: decreaseValue, id:`${macroType}Decrease`, cssClass: 'shrink'};

        const increaseValue = [macroType, tokenId, 'increase'].join(this.delimiter);
        const increaseAction = {name:'+', encodedValue: increaseValue, id:`${macroType}Increase`, cssClass: 'shrink'};

        const subcat = this.initializeEmptySubcategory(macroType);
        subcat.info1 = `${countItem.value}/${countItem.max}`;
        subcat.actions.push(decreaseAction);
        subcat.actions.push(increaseAction);
        
        this._combineSubcategoryWithCategory(category, name, subcat);
    }

    /** @private */
    _addEdgesAndHinderances(list, tokenId, actor) {
        const cat = this.initializeEmptyCategory('edges');
        
        const edges = actor.data.items.filter(i => i.type === 'edge');
        const edgesName = this.i18n('tokenactionhud.edges');
        this._addItemSubcategory(tokenId, edgesName, edges, 'edges', cat);

        const hindrances = actor.data.items.filter(i => i.type === 'hindrance');
        const hindName = this.i18n('tokenactionhud.hindrances');
        this._addItemSubcategory(tokenId, hindName, hindrances, 'hindrances', cat);

        this._combineCategoryWithList(list, this.i18n('tokenactionhud.edgesAndHindrances'), cat);
    }

    /** @private */
    _addPowersSubcategory(tokenId, subcatName, items, itemType, category) {
        const macroType = 'item';
        const subcat = this.initializeEmptySubcategory(itemType);

        items.filter(i => i.name !== '-').forEach(i => {
            const action = this._buildPowerAction(tokenId, i)
            subcat.actions.push(action);
        })

        this._combineSubcategoryWithCategory(category, subcatName, subcat);
    }

    /** @private */
    _addItemSubcategory(tokenId, subcatName, items, itemType, category) {
        const macroType = 'item';
        const subcat = this.initializeEmptySubcategory(itemType);

        items.filter(i => i.name !== '-').forEach(i => {
            const action = this._buildItemAction(tokenId, i)
            subcat.actions.push(action);
        })

        this._combineSubcategoryWithCategory(category, subcatName, subcat);
    }

    /** @private */
    _addStatuses(list, tokenId, actor) {
        const cat = this.initializeEmptyCategory('status');
        const macroType = 'status';
        const statuses = actor.data.data.status;

        const subcat = this.initializeEmptySubcategory('status');
        Object.entries(statuses).forEach(s => {
            const key = s[0];
            const value = s[1];

            const name = key.slice(2);
            const id = name.toLowerCase();
            const encodedValue = [macroType, tokenId, id].join(this.delimiter);
            const action = {name: name, id: name, encodedValue: encodedValue};
            action.cssClass = value ? 'active' : '';

            subcat.actions.push(action);
        });

        const statusesName = this.i18n('tokenactionhud.status');
        this._combineSubcategoryWithCategory(cat, statusesName, subcat);
        this._combineCategoryWithList(list, statusesName, cat);
    }

    /** @private */
    _addBennies(list, tokenId, actor) {
        const bennies = actor.data.data.bennies;
        if (!bennies)
            return;

        const cat = this.initializeEmptyCategory('bennies');
        const macroType = 'benny';
        const benniesName = this.i18n('tokenactionhud.bennies');
        
        const spendName = this.i18n('tokenactionhud.spend');
        const spendValue = [macroType, tokenId, 'spend'].join(this.delimiter);
        const spendAction = {name: spendName, encodedValue: spendValue, id:`bennySpend`};

        const getName = this.i18n('tokenactionhud.get');
        const getValue = [macroType, tokenId, 'get'].join(this.delimiter);
        const getAction = {name: getName, encodedValue: getValue, id:`bennyGet`};
                  
        const tokenSubcat = this.initializeEmptySubcategory(macroType);
        tokenSubcat.name = benniesName;
        tokenSubcat.info1 = bennies.value.toString();
        cat.info1 = bennies.value.toString();

        tokenSubcat.actions.push(spendAction);
        tokenSubcat.actions.push(getAction);

        this._combineSubcategoryWithCategory(cat, benniesName, tokenSubcat);

        if (game.user.isGM) {
            const gmBennies = game.user.getFlag('swade', 'bennies');
            if (gmBennies !== null) {
                const gmMacroType = 'gmBenny';
                const gmSpend = [gmMacroType, tokenId, 'spend'].join(this.delimiter);
                const gmSpendAction = {name: spendName, encodedValue: gmSpend, id:`gmBennySpend`};
        
                const gmGet = [gmMacroType, tokenId, 'get'].join(this.delimiter);
                const gmGetAction = {name: getName, encodedValue: gmGet, id:`gmBennyGet`};
                          
                const gmSubcat = this.initializeEmptySubcategory(gmMacroType);
                gmSubcat.actions.push(gmSpendAction);
                gmSubcat.actions.push(gmGetAction);
                const gmName = `${this.i18n('tokenactionhud.gm')} ${benniesName}`;
                gmSubcat.info2 = gmBennies.toString();
                cat.info2 = gmBennies.toString();
                this._combineSubcategoryWithCategory(cat, gmName, gmSubcat);
            }
        }

        this._combineCategoryWithList(list, benniesName, cat);
    }

    /** @private */
    _addUtilities(list, tokenId, actor) {
        let cat = this.initializeEmptyCategory('utility');

        this._combineCategoryWithList(list, this.i18n('tokenactionhud.utility'), cat);
    }

    /** @private */
    _parseDie(die, wild) {
        let dieMod = this._buildDieString(die);

        if (!wild)
            return dieMod;

        let wildMod = this._buildDieString(wild);
        if (dieMod.toUpperCase().localeCompare(wildMod.toUpperCase(), undefined, {sensitivity: 'base'}) === 0)
            return dieMod;

        return `${dieMod}/${wildMod}`;
    }

    /** @private */
    _buildDieString(die) {
        if (!die)
            return '';

        let result = `d${die.sides}`;
        
        const mod = parseInt(die.modifier);
        if (!die.modifier || mod === 0)
            return result;

        let dieMod = mod > 0 ? `+${mod}` : `${mod}`;
        
        result += dieMod;

        return result;
    }

    /** @private */
    _buildItemAction(tokenId, item) {
        const macroType = 'item';
        const id = item._id;
        const name = item.name;
        const encodedValue = [macroType, tokenId, id].join(this.delimiter);
        const action = {name: name, id: id, encodedValue: encodedValue};

        action.info1 = this._getItemQuantity(item);
        action.info2 = this._getItemShots(item);

        action.img = item.img;

        return action;
    }

    /** @private */
    _getItemQuantity(item) {
        if (item.data.quantity !== 1)
            return item.data.quantity;

        return '';
    }

    /** @private */
    _getItemShots(item) {
        
        const curr = item.data.currentShots;
        const shots = item.data.shots;
        
        if (!curr)
            return;
        
        let result = '';
        if (curr != 0 || shots != 0)
            result += curr;
            
        if (shots > 0)
            result += `/${shots}`;

        return result;
    }

    /** @private */
    _buildPowerAction(tokenId, item) {
        const macroType = 'item';
        const id = item._id;
        const name = item.name;
        const encodedValue = [macroType, tokenId, id].join(this.delimiter);
        const action = {name: name, id: id, encodedValue: encodedValue};

        action.info1 = this._getPowerPoints(item);
        
        action.img = item.img;

        return action;
    }

    /** @private */
    _getPowerPoints(item) {
        const pp = item.data.pp;
        if (pp.toLowerCase() === 'special')
            return '*';

        const points = parseInt(pp);

        if (points === NaN)
            return '';

        return points;
    }
}