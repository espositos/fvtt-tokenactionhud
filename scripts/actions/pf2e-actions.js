import {ActionHandler} from './actionHandler.js';

export class ActionHandlerPf2e extends ActionHandler {
    constructor(rollHandlerPf2e) {
        super();
        this.rollHandler = rollHandlerPf2e;
    }    

    /** @override */
    buildActionList(token) {
        let result = this.initializeEmptyActionList();

        if (!token) {
            return result;
        }

        let tokenId = token.data._id;

        result.tokenId = tokenId;

        let actor = token.actor;

        if (!actor) {
            return result;
        }

        let legitimateActors = ['character', 'npc'];
        if (!legitimateActors.includes(actor.data.type))
            return result;
        
        result.actorId = actor._id;

        let strikes, actions, skills, saves;
        if (actor.data.type === 'character') {
            strikes = this._getStrikesList(actor, tokenId); // ??? profit
            actions = this._getActionsList(actor, tokenId); // actions, reactions, free actions
            skills = this._getSkillsList(actor, tokenId); // skills and lore
            saves = this._getSaveList(actor, tokenId);
        }

        if (actor.data.type === 'npc') {
            skills = this._getSkillsListNpc(actor, tokenId);
            saves = this._getSaveListNpc(actor, tokenId);
        }

        let items = this._getItemsList(actor, tokenId); // weapons, consumables, other?
        let spells = this._getSpellsList(actor, tokenId);
        let feats = this._getFeatsList(actor, tokenId); // active and passive
        let abilities = this._getAbilityList(actor, tokenId);

        this._combineCategoryWithList(result, 'strikes', strikes);
        this._combineCategoryWithList(result, 'actions', actions);
        this._combineCategoryWithList(result, 'items', items);
        this._combineCategoryWithList(result, 'spells', spells);
        this._combineCategoryWithList(result, 'feats', feats);
        this._combineCategoryWithList(result, 'skills', skills);
        this._combineCategoryWithList(result, 'abilities', abilities);
        this._combineCategoryWithList(result, 'saves', saves);

        return result;
    }

    /** @private */
    _getStrikesList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let strikes = actor.data.data.actions.filter(a => a.type === 'strike');

        strikes.forEach(s => {
            let subcategory = this.initializeEmptySubcategory();

            let variantsMap = s.variants.map(function (v) {
                let name = v.label.lastIndexOf('+') >= 0 ? v.label.slice(v.label.lastIndexOf('+')-1) : v.label.slice(v.label.lastIndexOf('-')-1);
                return {_id: encodeURIComponent(this.name+`>${this.variants.indexOf(v)}`), name: name } 
            }.bind(s));
            subcategory.actions = this._produceMap(tokenId, variantsMap, 'strike');
            
            subcategory.actions.push({name: 'Damage', encodedValue: `strike.${tokenId}.${encodeURIComponent(s.name+'>damage')}`, id: encodeURIComponent(s.name+'>damage')})
            subcategory.actions.push({name: 'Critical', encodedValue: `strike.${tokenId}.${encodeURIComponent(s.name+'>critical')}`, id: encodeURIComponent(s.name+'>critical')})

            this._combineSubcategoryWithCategory(result, s.name, subcategory);
        });

        return result;
    }

    /** @private */
    _getActionsList(actor, tokenId, type) {
        let result = this.initializeEmptyCategory();

        let filteredActions = (actor.data.data.actions ?? []).filter(a => a.type === 'action');

        let actions = this.initializeEmptySubcategory();
        actions.actions = this._produceMap(tokenId, (filteredActions ?? []).filter(a => a.data.actionType === 'action'), 'action');

        let reactions = this.initializeEmptySubcategory();
        reactions.actions = this._produceMap(tokenId, (filteredActions ?? []).filter(a => a.data.actionType === 'reaction'), 'action');

        let free = this.initializeEmptySubcategory();
        free.actions = this._produceMap(tokenId, (filteredActions ?? []).filter(a => a.data.actionType === 'free'), 'action');

        this._combineSubcategoryWithCategory(result, 'actions', actions);
        this._combineSubcategoryWithCategory(result, 'reactions', reactions);
        this._combineSubcategoryWithCategory(result, 'free actions', free);

        return result;
    }

    /** @private */
    _getItemsList(actor, tokenId) {
        let macroType = 'item';

        let result = this.initializeEmptyCategory();

        let filter = ['weapon', 'equipment', 'consumable', 'armor'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));
        
        let weaponsList = items.filter(i => i.type === 'weapon');
        if (actor.data.type === 'character') weaponsList = weaponsList.filter(i => i.data.data.equipped.value);
        let weaponActions = this._buildItemActions(tokenId, macroType, weaponsList);
        let weapons = this.initializeEmptySubcategory();
        weapons.actions = weaponActions;

        let armourList = items.filter(i => i.type === 'armor');
        if (actor.data.type === 'character') armourList = armourList.filter(i => i.data.data.equipped.value);
        let armourActions = this._buildItemActions(tokenId, macroType, armourList);
        let armour = this.initializeEmptySubcategory();
        armour.actions = armourActions;

        let equipmentList = items.filter(i => i.type === 'equipment');
        let equipmentActions = this._buildItemActions(tokenId, macroType, equipmentList);
        let equipment = this.initializeEmptySubcategory();
        equipment.actions = equipmentActions;

        let consumablesList = items.filter(i => i.type === 'consumable');
        let consumableActions = this._buildItemActions(tokenId, macroType, consumablesList);
        let consumables = this.initializeEmptySubcategory();
        consumables.actions = consumableActions;

        this._combineSubcategoryWithCategory(result, 'weapons', weapons);
        this._combineSubcategoryWithCategory(result, 'armour', armour);
        this._combineSubcategoryWithCategory(result, 'equipment', equipment);
        this._combineSubcategoryWithCategory(result, 'consumables', consumables);

        return result;
    }

    /** @private */
    _getSpellsList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let filter = ['spell'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));

        let spellsSorted = this._sortSpellsByLevel(items);
        let spellCategories = this._categoriseSpells(actor, tokenId, spellsSorted);
        
        this._combineSubcategoryWithCategory(result, 'spells', spellCategories);

        return result;
    }

    /** @private */
    _sortSpellsByLevel(spells) {
        let result = Object.values(spells);

        result.sort((a,b) => {
            if (a.data.data.level.value === b.data.data.level.value)
                return a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {sensitivity: 'base'});
            return a.data.data.level.value - b.data.data.level.value;
        });

        return result;
    }
    
    /** @private */
    _categoriseSpells(actor, tokenId, spells) {
        let result = this.initializeEmptySubcategory();

        const macroType = 'spell';

        let dispose = spells.reduce(function (dispose, s) {
            var level = s.data.data.level.value;

            var levelName, levelKey;
                      
            levelKey = 'spell' + level;
            levelName = level === 0 ? 'Cantrips' : `Level ${level}`;

            if (!result.subcategories.hasOwnProperty(levelName)) {
                result.subcategories[levelName] = this.initializeEmptyActions();
            }
            
            let spell = this._buildItemAction(tokenId, macroType, s);
            this._addSpellInfo(s, spell);

            result.subcategories[levelName].actions.push(spell);
            
            return dispose;
        }.bind(this), {});
        
        return result;
    }

    /** @private */
    _addSpellInfo(s, spell) {
        s.data.data.components?.value.split(',').forEach(c => spell.info1 += c.trim().charAt(0).toUpperCase());
    }

    /** @private */
    _getFeatsList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let filter = ['feat'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));

        let active = this.initializeEmptySubcategory();
        active.actions = this._produceMap(tokenId, (items ?? []).filter(a => a.data.data.actionType.value !== 'passive'), 'feat');

        let passive = this.initializeEmptySubcategory();
        passive.actions = this._produceMap(tokenId, (items ?? []).filter(a => a.data.data.actionType.value === 'passive'), 'feat');

        this._combineSubcategoryWithCategory(result, 'active', active);
        this._combineSubcategoryWithCategory(result, 'passive', passive);

        return result;
    }

    /** @private */
    _getSkillsList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let actorSkills = actor.data.data.skills;
        let skillMap = Object.keys(actorSkills).map(k => { return {'_id': k, 'name': actorSkills[k].name.charAt(0).toUpperCase()+actorSkills[k].name.slice(1)}});
        let skills = this.initializeEmptySubcategory();
        skills.actions = this._produceMap(tokenId, skillMap, 'skill');

        let loreItems = actor.items.filter(i => i.data.type === 'lore');
        let lore = this.initializeEmptySubcategory();
        lore.actions = this._produceMap(tokenId, loreItems, 'lore');

        this._combineSubcategoryWithCategory(result, 'skills', skills);
        this._combineSubcategoryWithCategory(result, 'lore', lore);

        return result;
    }

    /** @private */
    _getSkillsListNpc(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let actorSkills = actor.data.data.skills;
        let skillMap = Object.keys(actorSkills).map(k => { return {'_id': k, 'name': k.charAt(0).toUpperCase()+k.slice(1)}});
        let skills = this.initializeEmptySubcategory();
        skills.actions = this._produceMap(tokenId, skillMap, 'skill');

        let loreItems = actor.items.filter(i => i.data.type === 'lore');
        let lore = this.initializeEmptySubcategory();
        lore.actions = this._produceMap(tokenId, loreItems, 'lore');

        this._combineSubcategoryWithCategory(result, 'skills', skills);
        this._combineSubcategoryWithCategory(result, 'lore', lore);

        return result;
    }

    /** @private */
    _getAbilityList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let actorAbilities = actor.data.data.abilities;
        let abilityMap = Object.keys(actorAbilities).map(k => { return {'_id': k, 'name': k.charAt(0).toUpperCase()+k.slice(1)}});

        let abilities = this.initializeEmptySubcategory();
        abilities.actions = this._produceMap(tokenId, abilityMap, 'ability');

        this._combineSubcategoryWithCategory(result, 'abilities', abilities);

        return result;
    }

    /** @private */
    _getSaveList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let actorSaves = actor.data.data.saves;
        let saveMap = Object.keys(actorSaves).map(k => { return {'_id': k, 'name': actorSaves[k].name.charAt(0).toUpperCase()+actorSaves[k].name.slice(1)}});

        let saves = this.initializeEmptySubcategory();
        saves.actions = this._produceMap(tokenId, saveMap, 'save');

        this._combineSubcategoryWithCategory(result, 'saves', saves);

        return result;
    }

    /** @private */
    _getSaveListNpc(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let actorSaves = actor.data.data.saves;
        let saveMap = Object.keys(actorSaves).map(k => { return {'_id': k, 'name': k.charAt(0).toUpperCase()+k.slice(1)}});

        let saves = this.initializeEmptySubcategory();
        saves.actions = this._produceMap(tokenId, saveMap, 'save');

        this._combineSubcategoryWithCategory(result, 'saves', saves);

        return result;
    }

    /** @private */
    _produceMap(tokenId, itemSet, type) {
        return itemSet.map(i => { return { 'name': i.name, 'encodedValue': `${type}.${tokenId}.${i._id}`, 'id': i._id };});
    }

    /** @private */
    _buildItemActions(tokenId, macroType, itemList) {
        return itemList.map(w => this._buildItemAction(tokenId, macroType, w));
    }

    /** @private */
    _buildItemAction(tokenId, macroType, item) {
        let result = { 'name': item.name, 'id': item._id, 'encodedValue': `${macroType}.${tokenId}.${item._id}` };

        result.info1 = this._getQuantityData(item);

        return result;
    }

    /** @private */
    _getQuantityData(item) {
        let result = '';
        let quantity = item.data.data.quantity?.value;
        if (quantity > 1) {
            result = quantity;
        }

        return result;
    }
}