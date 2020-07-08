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
    _getItemsList(actor, tokenId) {
        let macroType = 'item';
        let result = this.initializeEmptyCategory();
        
        let filter = ['weapon', 'equipment', 'consumable', 'armor'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));
        
        let weaponList = items.filter(i => i.type === 'weapon');
        if (actor.data.type === 'character') weaponList = weaponList.filter(i => i.data.data.equipped.value);
        let weaponActions = this._buildItemActions(tokenId, macroType, weaponList);
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
 
        this._combineSubcategoryWithCategory(result, this.i18n('PF2E.InventoryWeaponsHeader'), weapons);
        this._combineSubcategoryWithCategory(result, this.i18n('PF2E.InventoryArmorHeader'), armour);
        this._combineSubcategoryWithCategory(result, this.i18n('PF2E.InventoryEquipmentHeader'), equipment);
        this._combineSubcategoryWithCategory(result, this.i18n('PF2E.InventoryConsumablesHeader'), consumables);

        return result;
    }

    /** @private */
    _getActionsList(actor, tokenId) {
        let macroType = 'action';
        let result = this.initializeEmptyCategory();

        let filteredActions = (actor.items ?? []).filter(a => a.type === macroType);

        let actions = this.initializeEmptySubcategory();
        actions.actions = this._produceMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.actionType.value === 'action'), macroType);

        let reactions = this.initializeEmptySubcategory();
        reactions.actions = this._produceMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.actionType.value === 'reaction'), macroType);

        let free = this.initializeEmptySubcategory();
        free.actions = this._produceMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.actionType.value === 'free'), macroType);

        this._combineSubcategoryWithCategory(result, this.i18n('PF2E.TabActions'), actions);
        this._combineSubcategoryWithCategory(result, this.i18n('PF2E.ActionsReactionsHeader'), reactions);
        this._combineSubcategoryWithCategory(result, this.i18n('PF2E.ActionsFreeActionsHeader'), free);

        return result;
    }

    /** @private */
    _getSpellsList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let filter = ['spell'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));

        let spellsSorted = this._sortSpellsByLevel(items);
        let spellCategories = this._categoriseSpells(actor, tokenId, spellsSorted);
        
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.spells'), spellCategories);

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
                let levelName =  `${this.i18n('tokenactionhud.level')} ${level}`;

                levelName = level === 0 ? this.i18n('tokenactionhud.cantrips') : levelName;
                
                let items = Object.values(slot[1].prepared).map(spell => { if (!spell.expended) return spells.find(sp => sp.data._id === spell.id) });
                items = items.filter(i => !!i);

                if (items.length > 0) {
                    if (!result.subcategories.hasOwnProperty(bookName))
                        result.subcategories[bookName] = this.initializeEmptySubcategory();
                    
                    let levelSubcategory = this.initializeEmptySubcategory();
                    levelSubcategory.actions = this._produceMap(tokenId, items, 'spell');

                    if (Object.keys(result.subcategories[bookName].subcategories).length === 0) {
                        levelName = `${bookName} - ${levelName}`;
                        if (actor.data.type === 'character')
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
            
            let levelName = level == 0 ? this.i18n('tokenactionhud.cantrips') : `${this.i18n('tokenactionhud.level')} ${level}`;
            let levelNameWithBook = `${bookName} - ${levelName}`;

            // On first subcategory, include bookName, attack bonus, and spell DC.
            if (Object.keys(category.subcategories).length === 0) {                
                category.subcategories[levelNameWithBook] = this.initializeEmptySubcategory();
                
                if (actor.data.type === 'character')
                    category.subcategories[levelNameWithBook].info1 = this._getSpellSlotInfo(spellbook, level, true);

                category.subcategories[levelNameWithBook].info2 = this._getSpellDcInfo(spellbook);
            }
            
            // If there's only one subcategory, check if it's the same as the current
            let stillFirstSubcategory = Object.keys(category.subcategories).length === 1 && category.subcategories.hasOwnProperty(levelNameWithBook);
            
            if (!(stillFirstSubcategory || category.subcategories.hasOwnProperty(levelName))) {
                category.subcategories[levelName] = this.initializeEmptySubcategory();
                if (actor.data.type === 'character')
                    category.subcategories[levelName].info1 = this._getSpellSlotInfo(spellbook, level, false);
            }

            let encodedValue = [macroType, tokenId, s.data._id].join(this.delimiter);
            let spell = { name: s.name, encodedValue: encodedValue, id: s.data._id };
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
        let attackBonus = spelldc.value >= 0 ? `${this.i18n('tokenactionhud.atk')} +${spelldc.value}` : `${this.i18n('tokenactionhud.atk')} -${spelldc.value}`;
        let dcInfo = `${this.i18n('PF2E.DCLabel')}${spellbook.data.data.spelldc.dc}`;

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
        this._addComponentsInfo(s, spell);
        if (!settings.get('printSpellCard'))
            this._addAttackDamageInfo(s, spell);
    }

    _addComponentsInfo(s, spell) {
        let components = s.data.data.components?.value.split(',');
        let spellInfo = components.map(c => c.trim().charAt(0).toUpperCase()).join('');
        spell.info1 = spellInfo;
    }

    _addAttackDamageInfo(s, spell) {
        let info = [];
        if (s.data.data.spellType.value === 'attack')
            info.push(this.i18n('tokenactionhud.atk'));

        if (s.data.data.damage.value)
            info.push(this.i18n('tokenactionhud.dmg'));

        spell.info2 = info.join(', ');
    }

    /** @private */
    _getFeatsList(actor, tokenId) {
        let macroType = 'feat';

        let result = this.initializeEmptyCategory();

        let filter = [macroType];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));

        let active = this.initializeEmptySubcategory();
        active.actions = this._produceMap(tokenId, (items ?? []).filter(a => a.data.data.actionType.value !== 'passive'), macroType);

        let passive = this.initializeEmptySubcategory();
        passive.actions = this._produceMap(tokenId, (items ?? []).filter(a => a.data.data.actionType.value === 'passive'), macroType);

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.active'), active);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.passive'), passive);

        return result;
    }

    /** @private */
    _getSaveList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let actorSaves = actor.data.data.saves;
        let saveMap = Object.keys(actorSaves).map(k => { return {_id: k, name: CONFIG.PF2E.saves[k]}});

        let saves = this.initializeEmptySubcategory();
        saves.actions = this._produceMap(tokenId, saveMap, 'save');

        this._combineSubcategoryWithCategory(result, this.i18n('PF2E.SavesHeader'), saves);

        return result;
    }

    /** @private */
    _getAbilityList(actor, tokenId) {
        let result = this.initializeEmptyCategory();

        let abbr = settings.get('abbreviateSkills');

        let actorAbilities = actor.data.data.abilities;
        let abilityMap = Object.keys(actorAbilities).map(k => { 
            let name = abbr ? k.charAt(0).toUpperCase() + k.slice(1) : CONFIG.PF2E.abilities[k];
            return {_id: k, name: name}});

        let abilities = this.initializeEmptySubcategory();
        abilities.actions = this._produceMap(tokenId, abilityMap, 'ability');

        this._combineSubcategoryWithCategory(result, this.i18n('PF2E.AbilityTitle'), abilities);

        return result;
    }

    /** @private */
    _buildItemActions(tokenId, macroType, itemList) {
        let result = this._produceMap(tokenId, itemList, macroType);

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
    _produceMap(tokenId, itemSet, type) {
        let encodedValue = [type, tokenId, i._id].join(this.delimiter);
        return itemSet.map(i => { return { name: i.name, encodedValue: encodedValue, id: i._id };});
    }
}