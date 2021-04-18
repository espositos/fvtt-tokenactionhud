import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerWfrp extends ActionHandler {
    constructor(filterManager, categoryManager) {
        super(filterManager, categoryManager);
        this.filterManager.createOrGetFilter('skills');
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

        let weapons = this._getItemsList(actor, tokenId, 'weapon');
        let characteristics = this._getCharacteristics(actor, tokenId);
        let skills = this._getSkills(actor, tokenId);
        
        let magic = this._getSpells(actor, tokenId);
        let prayers = this._getPrayers(actor, tokenId);
        let talents = this._getTalents(actor, tokenId);
        let traits = this._getTraits(actor, tokenId);
        
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.weapons'), weapons);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.characteristics'), characteristics);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.skills'), skills);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.magic'), magic);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.religion'), prayers);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.talents'), talents);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.traits'), traits);

        this._setFilterSuggestions(actor);
        
        if (settings.get('showHudTitle'))
            result.hudTitle = token.data?.name;
            
        return result;
    }

    _getItemsList(actor, tokenId, type) {
        let types = type+'s';
        let result = this.initializeEmptyCategory('items');

        let basicSubcategory = this._getBasicActions(actor, tokenId);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.basic'), basicSubcategory)

        let subcategory = this.initializeEmptySubcategory();
        let items = actor.items.filter(i => i.type === type);
        let filtered = actor.data.type === 'character' ? items.filter(i => i.data.data.equipped) : items;
        subcategory.actions = this._produceMap(tokenId, filtered, type);

        this._combineSubcategoryWithCategory(result, types, subcategory);

        return result;
    }

    _getBasicActions(actor, tokenId) {
        let basicActions = this.initializeEmptySubcategory();

        let unarmed = ['unarmed', tokenId, 'unarmed'].join(this.delimiter);
        const unarmedAction = { id: 'unarmed', name: this.i18n('tokenactionhud.unarmed'), encodedValue: unarmed, id: 'unarmed' };
        basicActions.actions.push(unarmedAction);

        let stompValue = ['stomp', tokenId, 'stomp'].join(this.delimiter);
        const stompAction = { id: 'stomp', name: this.i18n('tokenactionhud.stomp'), encodedValue: stompValue, id:'stomp'};
        basicActions.actions.push(stompAction);
        
        let improvisedValue = ['improvise', tokenId, 'improvise'].join(this.delimiter);
        const improvisedAction = {id: 'improvise', name: this.i18n('tokenactionhud.improvisedWeapon'), encodedValue: improvisedValue, id:'improvise'};
        basicActions.actions.push(improvisedAction);

        let dodgeValue = ['dodge', tokenId, 'dodge'].join(this.delimiter);
        const dodgeAction = { id: 'dodge', name: this.i18n('tokenactionhud.dodge'), encodedValue: dodgeValue, id: 'dodge' };
        basicActions.actions.push(dodgeAction);

        return basicActions;
    }

    _getCharacteristics(actor, tokenId) {
        let result = this.initializeEmptyCategory('characteristics');
        let macroType = 'characteristic';

        let characteristics = Object.entries(actor.data.data.characteristics);
        let characteristicsCategory = this.initializeEmptySubcategory();
        characteristicsCategory.actions = characteristics.map(c => {
            let encodedValue = [macroType, tokenId, c[0]].join(this.delimiter);
            return {name: this.i18n(c[1].abrev), encodedValue: encodedValue, id:c[0]}
        })

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.characteristics'), characteristicsCategory);

        return result;
    }

    _getSkills(actor, tokenId) {
        let categoryId = 'skills';
        let macroType = 'skill';
        
        let result = this.initializeEmptyCategory(categoryId);
        
        let skills = actor.items.filter(i => i.type === macroType && i._id);

        result.choices = skills.length;

        let transMelee = game.i18n.localize('tokenactionhud.wfrp.meleeSkillPrefix');
        let transRanged = game.i18n.localize('tokenactionhud.wfrp.rangedSkillPrefix');

        let meleeSkills = skills.filter(s => s.data.name.startsWith(transMelee));
        let meleeId = `${categoryId}_melee`;
        this._setFilterSuggestions(meleeId, meleeSkills);
        let meleeCat = this.initializeEmptySubcategory(meleeId);
        meleeCat.canFilter = meleeSkills.length > 0 ? true : false;
        let filteredMeleeSkills = this._filterElements(meleeId, meleeSkills);
        meleeCat.actions = this._produceMap(tokenId, filteredMeleeSkills, macroType);

        let rangedSkills = skills.filter(s => s.data.name.startsWith(transRanged));
        let rangedId = `${categoryId}_ranged`;
        this._setFilterSuggestions(rangedId, rangedSkills);
        let rangedCat = this.initializeEmptySubcategory(rangedId);
        rangedCat.canFilter = rangedSkills.length > 0 ? true : false;
        let filteredRangedSkills = this._filterElements(rangedId, rangedSkills);        
        rangedCat.actions = this._produceMap(tokenId, filteredRangedSkills, macroType);

        let basicSkills = skills.filter(s => !(s.data.name.startsWith(transMelee) || s.data.name.startsWith(transRanged))  && s.data.data.grouped.value !== 'isSpec');
        let basicId = `${categoryId}_basic`;
        this._setFilterSuggestions(basicId, basicSkills);
        let basicSkillsCat = this.initializeEmptySubcategory(basicId);
        let filteredBasicSkills = this._filterElements(basicId, basicSkills);
        basicSkillsCat.canFilter = basicSkills.length > 0 ? true : false;
        basicSkillsCat.actions = this._produceMap(tokenId, filteredBasicSkills, macroType);

        let advancedSkills = skills.filter(s => !(s.data.name.startsWith(transMelee) || s.data.name.startsWith(transRanged)) && s.data.data.grouped.value === 'isSpec');
        let advancedId = `${categoryId}_advanced`;
        this._setFilterSuggestions(advancedId, advancedSkills);
        let advancedSkillsCat = this.initializeEmptySubcategory(advancedId);
        advancedSkillsCat.canFilter = advancedSkills.length > 0 ? true : false;
        let filteredAdvancedSkills = this._filterElements(advancedId, advancedSkills);
        advancedSkillsCat.actions = this._produceMap(tokenId, filteredAdvancedSkills, macroType);
        
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.melee'), meleeCat);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.ranged'), rangedCat);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.basic'), basicSkillsCat);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.advanced'), advancedSkillsCat);

        return result;
    }

    /** @override */
    _setFilterSuggestions(id, items) {
        let suggestions = items?.map(s => { return { id: s._id, value: s.name } })
        if (suggestions?.length > 0)
            this.filterManager.setSuggestions(id, suggestions);
    }

    _filterElements(categoryId, skills) {
        let filteredNames = this.filterManager.getFilteredNames(categoryId);
        let result = skills.filter(s => !!s);
        if (filteredNames.length > 0) {
            if (this.filterManager.isBlocklist(categoryId)) {
                result = skills.filter(s => !filteredNames.includes(s.name));
            }
            else {
                result = skills.filter(s => filteredNames.includes(s.name));
            }
        }

        return result;
    }

    _getSpells(actor, tokenId) {
        let macroType = 'spell';
        let result = this.initializeEmptyCategory('spells');

        let spells = actor.items.filter(i => i.type === macroType);
        
        let petties = spells.filter(i => i.data.data.lore.value === 'petty');
        let pettyCategory = this.initializeEmptySubcategory();
        pettyCategory.actions = this._produceMap(tokenId, petties, macroType);

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.petty'), pettyCategory);

        let lores = spells.filter(i => i.data.data.lore.value !== 'petty');
        let loresCategorised = lores.reduce((output, spell) => {
            let loreType = spell.data.data.lore.value;
            if (!output.hasOwnProperty(loreType)) {
                output[loreType] = [];
            }

            output[loreType].push(spell);

            return output;
        }, {});

        Object.entries(loresCategorised).forEach(loreCategory => {
            let subcategory = this.initializeEmptySubcategory();
            subcategory.actions = this._produceMap(tokenId, loreCategory[1], macroType);
            this._combineSubcategoryWithCategory(result, loreCategory[0], subcategory);
        })

        return result;
    }

    _getPrayers(actor, tokenId) {
        let macroType = 'prayer';
        let result = this.initializeEmptyCategory('prayers');

        let prayers = actor.items.filter(i => i.type === macroType);
        
        let blessings = prayers.filter(i => i.data.data.type.value === 'blessing');
        let blessingCategory = this.initializeEmptySubcategory();
        blessingCategory.actions = this._produceMap(tokenId, blessings, macroType);

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.blessing'), blessingCategory);

        let miracles = prayers.filter(i => i.data.data.type.value !== 'blessing');
        let miraclesCategorised = miracles.reduce((output, prayer) => {
            let miracleType = prayer.data.data.type.value;
            if (!output.hasOwnProperty(miracleType)) {
                output[miracleType] = [];
            }

            output[miracleType].push(prayer);

            return output;
        }, {});

        Object.entries(miraclesCategorised).forEach(miracleCategory => {
            let subcategory = this.initializeEmptySubcategory();
            subcategory.actions = this._produceMap(tokenId, miracleCategory[1], macroType);
            this._combineSubcategoryWithCategory(result, miracleCategory[0], subcategory);
        })

        return result;
    }
    
    _getTalents(actor, tokenId) {
        let macroType = 'talent';
        let result = this.initializeEmptyCategory('talents');

        let talents = actor.items.filter(i => i.data.type === macroType);

        let rollableTalents = talents.filter(t => t.data.data.rollable?.value);
        let rollableCategory = this.initializeEmptySubcategory();
        rollableCategory.actions = this._produceMap(tokenId, rollableTalents, macroType);
        
        let unrollableTalents = talents.filter(t => !t.data.data.rollable?.value);
        let unrollableCategory = this.initializeEmptySubcategory();
        unrollableCategory.actions = this._produceMap(tokenId, unrollableTalents, macroType);
        
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.rollable'), rollableCategory);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.unrollable'), unrollableCategory);
        
        return result;
    }

    _getTraits(actor, tokenId) {
        let macroType = 'trait';
        let result = this.initializeEmptyCategory('traits');
        if (actor.data.traits) {
            let traits = actor.data.traits.filter(i => i.included);

            let rollableTraits = traits.filter(t => t.data.rollable?.value);
            let rollableCategory = this.initializeEmptySubcategory();
            rollableCategory.actions = this._produceMap(tokenId, rollableTraits, macroType);

            let unrollableTraits = traits.filter(t => !t.data.rollable?.value);
            let unrollableCategory = this.initializeEmptySubcategory();
            unrollableCategory.actions = this._produceMap(tokenId, unrollableTraits, macroType);

            this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.rollable'), rollableCategory);
            this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.unrollable'), unrollableCategory);
        }
        return result;
    }

    _produceMap(tokenId, itemSet, type) {
        return itemSet.map(i => {
            let encodedValue = [type, tokenId, i._id].join(this.delimiter);
            let img = this._getImage(i);
            return { name: i.name, encodedValue: encodedValue, id: i._id, img:img };
        });
    }

    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return result?.includes('icons/svg/mystery-man.svg') || result?.includes('systems/wfrp4e/icons/blank.png') ? '' : result;
    }
}