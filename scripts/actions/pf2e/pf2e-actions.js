import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';
import { PcActionHandlerPf2e } from './pf2e-actions-pc.js';
import { NpcActionHandlerPf2e } from './pf2e-actions-npc.js';

export class ActionHandlerPf2e extends ActionHandler {
    constructor() {
        super();
        this.pcActionHandler = new PcActionHandlerPf2e(this);
        this.npcActionHandler = new NpcActionHandlerPf2e(this);
    }    

    /** @override */
    async buildActionList(token) {
        let result = this.initializeEmptyActionList();

        if (!token)
            return result;

        let tokenId = token.data._id;
        result.tokenId = tokenId;

        let actor = token.actor;
        if (!actor)
            return result;

        let legitimateActors = ['character', 'npc'];
        let actorType = actor.data.type;
        if (!legitimateActors.includes(actorType))
            return result;
        
        result.actorId = actor._id;

        if (actorType === 'character')
            await this.pcActionHandler.buildActionList(result, tokenId, actor);
        
        if (actorType === 'npc')
            await this.npcActionHandler.buildActionList(result, tokenId, actor);

        return result;
    }

    /** @private */
    _getItemsList(actor, tokenId, actorType) {
        let macroType = 'item';
        let result = this.initializeEmptyCategory();
        
        let filter = ['weapon', 'equipment', 'consumable', 'armor'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));
        
        let weaponList = items.filter(i => i.type === 'weapon');
        if (actor.data.type === 'character') weaponList = weaponList.filter(i => i.data.data.equipped.value);
        let weaponActions = this._buildItemActions(tokenId, actorType, macroType, weaponList);
        let weapons = this.initializeEmptySubcategory();
        weapons.actions = weaponActions;

        let armourList = items.filter(i => i.type === 'armor');
        if (actor.data.type === 'character') armourList = armourList.filter(i => i.data.data.equipped.value);
        let armourActions = this._buildItemActions(tokenId, actorType, macroType, armourList);
        let armour = this.initializeEmptySubcategory();
        armour.actions = armourActions;

        let equipmentList = items.filter(i => i.type === 'equipment');
        let equipmentActions = this._buildItemActions(tokenId, actorType, macroType, equipmentList);
        let equipment = this.initializeEmptySubcategory();
        equipment.actions = equipmentActions;

        let consumablesList = items.filter(i => i.type === 'consumable');
        let consumableActions = this._buildItemActions(tokenId, actorType, macroType, consumablesList);
        let consumables = this.initializeEmptySubcategory();
        consumables.actions = consumableActions;
 
        this._combineSubcategoryWithCategory(result, 'armour', armour);
        this._combineSubcategoryWithCategory(result, 'equipment', equipment);
        this._combineSubcategoryWithCategory(result, 'consumables', consumables);

        return result;
    }

    /** @private */
    _getSpellsList(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();

        let filter = ['spell'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));

        let spellsSorted = this._sortSpellsByLevel(items);
        let spellCategories = this._categoriseSpells(actor, tokenId, actorType, spellsSorted);
        
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
    _categoriseSpells(actor, tokenId, actorType, spells) {
        const macroType = 'spell';
        let result = this.initializeEmptySubcategory();
        
        let spellbooks = actor.items.filter(i => i.data.type === 'spellcastingEntry');
        
        // get prepared spellbooks first, get spells from those, then turn to other spells
        spellbooks.forEach(s => {
            if (s.data.data.prepared.value !== 'prepared')
                return;

            let bookName = s.data.name;
            Object.entries(s.data.data.slots).forEach(slot => {
                if (slot[1].prepared.length === 0 || slot[1].prepared.max <= 0)
                    return;
                
                let levelKey = slot[0];
                let level = levelKey.substr(4);
                let levelName = 'Level ' + level;

                levelName = level === 0 ? 'Cantrips' : levelName;
                
                let items = Object.values(slot[1].prepared).map(spell => { if (!spell.expended) return spells.find(sp => sp.data._id === spell.id) });
                items = items.filter(i => !!i);

                if (items.length > 0) {
                    if (!result.subcategories.hasOwnProperty(bookName))
                        result.subcategories[bookName] = this.initializeEmptySubcategory();
                    
                    let levelSubcategory = this.initializeEmptySubcategory();
                    levelSubcategory.actions = this._produceMap(tokenId, actorType, items, 'spell');

                    if (Object.keys(result.subcategories[bookName].subcategories).length === 0) {
                        levelName = `${bookName} - ${levelName}`;
                        if (actorType === 'character')
                            levelSubcategory.info1 = this._getSpellSlotInfo(s, level, true);

                        levelSubcategory.info2 = this._getSpellDcInfo(s);
                    }

                    this._combineSubcategoryWithCategory(result.subcategories[bookName], levelName, levelSubcategory);
                }
            });
        })

        spells.forEach( function(s) {
            var level = s.data.data.level.value;
            var spellbookId = s.data.data.location?.value;

            let spellbook;
            if (spellbookId)
                spellbook = spellbooks.find(s => s.data._id === spellbookId);
            
            // return if 'prepared' because it should already have been handled above
            if (!spellbook || spellbook.data.data.prepared.value === 'prepared')
                return;

            let bookName = spellbook.data.name;
            
            if (!result.subcategories.hasOwnProperty(bookName)) {
                result.subcategories[bookName] = this.initializeEmptySubcategory();
            }
            let category = result.subcategories[bookName];
            
            let levelName = level == 0 ? 'Cantrips' : `Level ${level}`;
            let levelNameWithBook = `${bookName} - ${levelName}`;

            // On first subcategory, include bookName, attack bonus, and spell DC.
            if (Object.keys(category.subcategories).length === 0) {                
                category.subcategories[levelNameWithBook] = this.initializeEmptySubcategory();
                
                if (actorType === 'character')
                    category.subcategories[levelNameWithBook].info1 = this._getSpellSlotInfo(spellbook, level, true);

                category.subcategories[levelNameWithBook].info2 = this._getSpellDcInfo(spellbook);
            }
            
            // If there's only one subcategory, check if it's the same as the current
            let stillFirstSubcategory = Object.keys(category.subcategories).length === 1 && category.subcategories.hasOwnProperty(levelNameWithBook);
            
            if (!(stillFirstSubcategory || category.subcategories.hasOwnProperty(levelName))) {
                category.subcategories[levelName] = this.initializeEmptySubcategory();
                if (actorType === 'character')
                    category.subcategories[levelName].info1 = this._getSpellSlotInfo(spellbook, level, false);
            }

            let spell = { 'name': s.name, 'encodedValue': `${actorType}.${macroType}.${tokenId}.${s.data._id}`, 'id': s.data._id };
            this._addSpellInfo(s, spell);
            if (stillFirstSubcategory)
                category.subcategories[levelNameWithBook].actions.push(spell);
            else
                category.subcategories[levelName].actions.push(spell);
            
        }.bind(this));
        
        return result;
    }

    /** @private */
    _getSpellDcInfo(spellbook) {
        let result = '';
        
        let spelldc = spellbook.data.data.spelldc;
        let attackBonus = spelldc.value >= 0 ? `Atk +${spelldc.value}` : `Atk -${spelldc.value}`;
        let dcInfo = `DC${spellbook.data.data.spelldc.dc}`;

        result = `${attackBonus} ${dcInfo}`;

        return result;
    }

    /** @private */
    _getSpellSlotInfo(spellbook, level, firstSubcategory) {
        let tradition = spellbook.data.data.tradition.value;
        let prepType = spellbook.data.data.prepared.value;

        let slotInfo = !['prepared', 'focus'].includes(prepType);

        let slots = spellbook.data.data.slots;
        let maxSlots = slots[`slot${level}`].max;
        let valueSlots = slots[`slot${level}`].value;

        if (firstSubcategory && tradition === 'focus') {
            let focus = spellbook.data.data.focus;
            maxSlots = focus.pool;
            valueSlots = focus.points;
            return `${valueSlots}/${maxSlots}`;
        }
        
        if (slotInfo && level > 0)
            return `${valueSlots}/${maxSlots}`;
    }

    /** @private */
    _addSpellInfo(s, spell) {
        let components = s.data.data.components?.value.split(',');
        let spellInfo = components.map(c => c.trim().charAt(0).toUpperCase()).join('');
        spell.info1 = spellInfo;
    }

    /** @private */
    _getFeatsList(actor, tokenId, actorType) {
        let macroType = 'feat';

        let result = this.initializeEmptyCategory();

        let filter = [macroType];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));

        let active = this.initializeEmptySubcategory();
        active.actions = this._produceMap(tokenId, actorType, (items ?? []).filter(a => a.data.data.actionType.value !== 'passive'), macroType);

        let passive = this.initializeEmptySubcategory();
        passive.actions = this._produceMap(tokenId, actorType, (items ?? []).filter(a => a.data.data.actionType.value === 'passive'), macroType);

        this._combineSubcategoryWithCategory(result, 'active', active);
        this._combineSubcategoryWithCategory(result, 'passive', passive);

        return result;
    }

    /** @private */
    _getSaveList(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();

        let actorSaves = actor.data.data.saves;
        let saveMap = Object.keys(actorSaves).map(k => { return {'_id': k, 'name': CONFIG.PF2E.saves[k]}});

        let saves = this.initializeEmptySubcategory();
        saves.actions = this._produceMap(tokenId, actorType, saveMap, 'save');

        this._combineSubcategoryWithCategory(result, 'saves', saves);

        return result;
    }

    /** @private */
    _getAbilityList(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();

        let abbr = settings.get('abbreviateSkills');

        let actorAbilities = actor.data.data.abilities;
        let abilityMap = Object.keys(actorAbilities).map(k => { 
            let name = abbr ? k.charAt(0).toUpperCase() + k.slice(1) : CONFIG.PF2E.abilities[k];
            return {'_id': k, 'name': name}});

        let abilities = this.initializeEmptySubcategory();
        abilities.actions = this._produceMap(tokenId, actorType, abilityMap, 'ability');

        this._combineSubcategoryWithCategory(result, 'abilities', abilities);

        return result;
    }

    /** @private */
    _buildItemActions(tokenId, actorType, macroType, itemList) {
        let result = this._produceMap(tokenId, actorType, itemList, macroType);

        result.forEach(i => this._addItemInfo( itemList.find(item => item.data._id === i.id), i));

        return result;
    }

    /** @private */
    _addItemInfo(item, itemAction) {
        itemAction.info1 = this._getQuantityData(item);
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
    
    /** @private */
    _produceMap(tokenId, actorType, itemSet, type) {
        return itemSet.map(i => { return { 'name': i.name, 'encodedValue': `${actorType}.${type}.${tokenId}.${i._id}`, 'id': i._id };});
    }
}