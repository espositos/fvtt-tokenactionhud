import {ActionHandler} from '../actionHandler.js';

export class ActionHandlerWfrp extends ActionHandler {
    constructor() {
        super();
    }    

    /** @override */
    async buildActionList(token) {
        let result = { tokenId: '', actorId: '', categories: {}};

        if (!token) {
            return result;
        }

        let tokenId = token.data._id;

        result.tokenId = tokenId;

        let actor = token.actor;

        if (!actor) {
            return result;
        }

        result.actorId = actor._id;
        
        let weapons = this._getSubcategoryList(actor, tokenId, 'weapon');
        let characteristics = this._getCharacteristics(actor, tokenId);
        let skills = this._getSkills(actor, tokenId);
        let spells = this._getSpells(actor, tokenId);
        let prayers = this._getPrayers(actor, tokenId);
        let talents = this._getTalents(actor, tokenId);
        let traits = this._getTraits(actor, tokenId);
        
        this._combineCategoryWithList(result, game.i18n.localize('WFRP4E.TrappingType.Weapon'), weapons);
        this._combineCategoryWithList(result, game.i18n.localize('Characteristics'), characteristics);
        this._combineCategoryWithList(result, game.i18n.localize('Skills'), skills);
        this._combineCategoryWithList(result, game.i18n.localize('Magic'), spells);
        this._combineCategoryWithList(result, game.i18n.localize('Religion'), prayers);
        this._combineCategoryWithList(result, game.i18n.localize('Talents'), talents);
        this._combineCategoryWithList(result, game.i18n.localize('Traits'), traits);

        return result;
    }

    _getSubcategoryList(actor, tokenId, type) {
        let types = type+'s';
        let result = {
            'subcategories': {}
        }

        let subcategory = { 
            'actions': this._produceMap(tokenId ,actor.items.filter(i => i.type == type), type) };

        if (subcategory.actions.length > 0)
            result.subcategories[type+'s'] = subcategory;

        return result;
    }

    _getCharacteristics(actor, tokenId) {
        let result = this.initializeEmptyCategory();
        let macroType = 'characteristic';

        let characteristics = Object.entries(actor.data.data.characteristics);
        let characteristicsCategory = this.initializeEmptySubcategory();
        characteristicsCategory.actions = characteristics.map(c => {
            let encodedValue = [macroType, tokenId, c[0]].join(this.delimiter);
            return {name: game.i18n.localize(c[1].abrev), encodedValue: encodedValue, id:c[0]}
        })

        this._combineSubcategoryWithCategory(result, game.i18n.localize('Characteristics'), characteristicsCategory);

        return result;
    }

    _getItems(actor, tokenId) {
        let result = this.initializeEmptyCategory();
        let macroType = 'item';
        let skills = actor.items.filter(i => i.type === macroType);

        let basicSkills = skills.filter(s => s.data.data.grouped.value === 'isSpec');
        let basicSkillsCat = this.initializeEmptySubcategory();
        basicSkillsCat.actions = this._produceMap(tokenId, basicSkills, macroType);

        let advancedSkills = skills.filter(s => s.data.data.grouped.value === 'isSpec');
        let advancedSkillsCat = this.initializeEmptySubcategory();
        advancedSkillsCat.actions = this._produceMap(tokenId, basicSkills, macroType);
        
        this._combineSubcategoryWithCategory(result, game.i18n.localize('Basic'), basicSkillsCat);
        this._combineSubcategoryWithCategory(result, game.i18n.localize('Advanced'), advancedSkillsCat);

        return result;
    }

    _getSkills(actor, tokenId) {
        let result = this.initializeEmptyCategory();
        let macroType = 'skill';
        let skills = actor.items.filter(i => i.type === macroType);

        let meleeSkills = skills.filter(s => s.data.name.startsWith('Melee'));
        let meleeCategory = this.initializeEmptySubcategory();
        meleeCategory.actions = this._produceMap(tokenId, meleeSkills, macroType);

        let rangedSkills = skills.filter(s => s.data.name.startsWith('Ranged'));
        let rangedCategory = this.initializeEmptySubcategory();
        rangedCategory.actions = this._produceMap(tokenId, rangedSkills, macroType);

        let filter = ['ranged', 'melee'];
        let basicSkills = skills.filter(s => !(s.data.name.startsWith('Melee') || s.data.name.startsWith('Ranged'))  && s.data.data.grouped.value !== 'isSpec');
        let basicSkillsCat = this.initializeEmptySubcategory();
        basicSkillsCat.actions = this._produceMap(tokenId, basicSkills, macroType);

        let advancedSkills = skills.filter(s => !(s.data.name.startsWith('Melee') || s.data.name.startsWith('Ranged')) && s.data.data.grouped.value === 'isSpec');
        let advancedSkillsCat = this.initializeEmptySubcategory();
        advancedSkillsCat.actions = this._produceMap(tokenId, advancedSkills, macroType);
        
        this._combineSubcategoryWithCategory(result, game.i18n.localize('NAME.Melee'), meleeCategory);
        this._combineSubcategoryWithCategory(result, game.i18n.localize('NAME.Ranged'), rangedCategory);
        this._combineSubcategoryWithCategory(result, game.i18n.localize('Basic'), basicSkillsCat);
        this._combineSubcategoryWithCategory(result, game.i18n.localize('Advanced'), advancedSkillsCat);

        return result;
    }

    _getSpells(actor, tokenId) {
        let macroType = 'spell';
        let result = this.initializeEmptyCategory();

        let spells = actor.items.filter(i => i.type === macroType);
        
        let petties = spells.filter(i => i.data.data.lore.value === 'petty');
        let pettyCategory = this.initializeEmptySubcategory();
        pettyCategory.actions = this._produceMap(tokenId, petties, macroType);

        this._combineSubcategoryWithCategory(result, game.i18n.localize('SHEET.PettySpell'), pettyCategory);

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
        let result = this.initializeEmptyCategory();

        let prayers = actor.items.filter(i => i.type === macroType);
        
        let blessings = prayers.filter(i => i.data.data.type.value === 'blessing');
        let blessingCategory = this.initializeEmptySubcategory();
        blessingCategory.actions = this._produceMap(tokenId, blessings, macroType);

        this._combineSubcategoryWithCategory(result, game.i18n.localize('Blessing'), blessingCategory);

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
        let result = this.initializeEmptyCategory();

        let talents = actor.items.filter(i => i.data.type === macroType);

        let rollableTalents = talents.filter(t => t.data.data.rollable?.value);
        let rollableCategory = this.initializeEmptySubcategory();
        rollableCategory.actions = this._produceMap(tokenId, rollableTalents, macroType);
        
        let unrollableTalents = talents.filter(t => !t.data.data.rollable?.value);
        let unrollableCategory = this.initializeEmptySubcategory();
        unrollableCategory.actions = this._produceMap(tokenId, unrollableTalents, macroType);
        
        this._combineSubcategoryWithCategory(result, game.i18n.localize('tokenactionhud.rollable'), rollableCategory);
        this._combineSubcategoryWithCategory(result, game.i18n.localize('tokenactionhud.unrollable'), unrollableCategory);
        
        return result;
    }

    _getTraits(actor, tokenId) {
        let macroType = 'trait';
        let result = this.initializeEmptyCategory();

        let traits = actor.items.filter(i => i.data.type === macroType);

        let rollableTraits = traits.filter(t => t.data.data.rollable?.value);
        let rollableCategory = this.initializeEmptySubcategory();
        rollableCategory.actions = this._produceMap(tokenId, rollableTraits, macroType);
        
        let unrollableTraits = traits.filter(t => !t.data.data.rollable?.value);
        let unrollableCategory = this.initializeEmptySubcategory();
        unrollableCategory.actions = this._produceMap(tokenId, unrollableTraits, macroType);
        
        this._combineSubcategoryWithCategory(result, game.i18n.localize('tokenactionhud.rollable'), rollableCategory);
        this._combineSubcategoryWithCategory(result, game.i18n.localize('tokenactionhud.unrollable'), unrollableCategory);

        return result;
    }

    _produceMap(tokenId, itemSet, type) {
        return itemSet.map(i => {
            let encodedValue = [type, tokenId, i._id].join(this.delimiter);
            return { name: i.name, encodedValue: encodedValue, id: i._id };
        });
    }   
}