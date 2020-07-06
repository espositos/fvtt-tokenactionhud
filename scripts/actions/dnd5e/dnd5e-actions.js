import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';
import * as checkLists from './dnd5e-checks.js';

export class ActionHandler5e extends ActionHandler {
    constructor () {
        super();
    }

    /** @override */
    async buildActionList(token) {
        let result = this.initializeEmptyActionList();
        await this.addCompendiums(result);

        if (!token)
            return result;

        let tokenId = token.data._id;

        result.tokenId = tokenId;

        let actor = token.actor;

        if (!actor)
            return result;

        result.actorId = actor._id;
        let actorType = actor.data.type;
        let items = this._getItemList(actor, tokenId, actorType);
        let spells = this._getSpellsList(actor, tokenId, actorType);
        let feats = this._getFeatsList(actor, tokenId, actorType);
        
        let checks = checkLists.buildChecksList(tokenId, actorType);
    
        this._combineCategoryWithList(result, this.i18n('DND5E.Inventory'), items);
        this._combineCategoryWithList(result, this.i18n('DND5E.ItemTypeSpellPl'), spells);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.dnd5e.feats'), feats);
        for (let [k, v] of Object.entries(checks)) {
            this._combineCategoryWithList(result, k, v);
        }

        return result;
    }
    
    /** ITEMS **/
    
    /** @private */
    _getItemList(actor, tokenId, actorType) {
        let validItems = this._filterLongerActions(actor.data.items.filter(i => i.data.quantity > 0));
        let sortedItems = this._sortByItemSort(validItems);
        let macroType = 'item';
        var equipped;

        if (actor.data.type === 'npc' && settings.get('showAllNpcItems')) {
            equipped = sortedItems.filter(i => i.type !== 'consumable' && i.type !== 'spell' && i.type !== 'feat');
        } else {
            equipped = sortedItems.filter(i => i.type !== 'consumable' && i.data.equipped);
        }
        let activeEquipped = this._getActiveEquipment(equipped);
        
        let weapons = activeEquipped.filter(i => i.type == 'weapon');
        let weaponActions = weapons.map(w => this._buildItem(tokenId, actorType, actor, macroType, w));
        let weaponsCat = this.initializeEmptySubcategory();
        weaponsCat.actions = weaponActions;
    
        let equipment = activeEquipped.filter(i => i.type == 'equipment');
        let equipmentActions = equipment.map(e => this._buildItem(tokenId, actorType, actor, macroType, e));
        let equipmentCat = this.initializeEmptySubcategory();
        equipmentCat.actions = equipmentActions;
        
        let other = activeEquipped.filter(i => i.type != 'weapon' && i.type != 'equipment')
        let otherActions = other.map(o => this._buildItem(tokenId, actorType, actor, macroType, o));
        let otherCat = this.initializeEmptySubcategory();
        otherCat.actions = otherActions;
    
        let allConsumables = sortedItems.filter(i => i.type == 'consumable');
        
        let consumable = allConsumables.filter(c => c.data.uses.value && c.data.uses.value > 0)
        let consumableActions = consumable.map(c => this._buildItem(tokenId, actorType, actor, macroType, c));
        let consumablesCat = this.initializeEmptySubcategory();
        consumablesCat.actions = consumableActions;
        
        let inconsumable = allConsumables.filter(c => !(c.data.uses.max || c.data.uses.value) && c.data.consumableType != 'ammo')
        let incomsumableActions = inconsumable.map(i => this._buildItem(tokenId, actorType, actor, macroType, i));
        let inconsumablesCat = this.initializeEmptySubcategory();
        inconsumablesCat.actions = incomsumableActions;
        
        let result = this.initializeEmptyCategory();
            
        this._combineSubcategoryWithCategory(result, this.i18n('DND5E.ItemTypeWeaponPl'), weaponsCat);
        this._combineSubcategoryWithCategory(result, this.i18n('DND5E.ItemTypeEquipmentPl'), equipmentCat);
        this._combineSubcategoryWithCategory(result, this.i18n('DND5E.ActionOther'), otherCat);
        this._combineSubcategoryWithCategory(result, this.i18n('DND5E.ItemTypeConsumablePl'), consumablesCat);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.dnd5e.inconsumables'), inconsumablesCat);
        
        return result;
    }

    /** @private */
    _getActiveEquipment(equipment) {
        const activationTypes = Object.keys(game.dnd5e.config.abilityActivationTypes);
    
        let activeEquipment = equipment.filter(e => {
            if (!e.data.activation)
                return false;
    
            for (let key of activationTypes) {
                if (e.data.activation.type === key)
                    return true;
            }
            
            return false;
        });
    
        return activeEquipment;
    }

    /** SPELLS **/
    
    /** @private */
    _getSpellsList(actor, tokenId, actorType) {
        let validSpells = this._filterLongerActions(actor.data.items.filter(i => i.type === 'spell' && i.data.uses.value >= i.data.uses.max));
        validSpells = this._filterNonpreparedSpells(validSpells);
        let spellsSorted = this._sortSpellsByLevel(validSpells);
        let spells = this._categoriseSpells(actor, tokenId, actorType, spellsSorted);
    
        return spells;
    }

    /** @private */
    _sortSpellsByLevel(spells) {
        let result = Object.values(spells);

        result.sort((a,b) => {
            if (a.data.level === b.data.level)
                return a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {sensitivity: 'base'});
            return a.data.level - b.data.level;
        });

        return result;
    }
    
    /** @private */
    _categoriseSpells(actor, tokenId, actorType, spells) {
        const powers = this.initializeEmptyCategory();
        const book = this.initializeEmptyCategory();
        const macroType = 'spell';

        // Reverse sort spells by level
        const spellSlotInfo = Object.entries(actor.data.data.spells).sort((a,b) => {
            return b[0].toUpperCase().localeCompare(a[0].toUpperCase(), undefined, {sensitivity: 'base'});
        });

        // Go through spells and if higher available slots exist, mark spell slots available at lower levels.
        var pactInfo = spellSlotInfo.find(s => s[0] === 'pact');
        
        var slotsAvailable = false;
        spellSlotInfo.forEach(s => {
            if (s[0].startsWith('spell')) {
                if (!slotsAvailable && s[1].max > 0 && s[1].value > 0)
                    slotsAvailable = true;

                if (!slotsAvailable && s[0] === 'spell'+pactInfo[1]?.level) {
                    if (pactInfo[1].max > 0 && pactInfo[1].value > 0)
                        slotsAvailable = true;
                }
    
                s[1].slotsAvailable = slotsAvailable;
            } else {
                s[1].slotsAvailable = !s[1].max || s[1].value > 0;
            }
        })

        let pactIndex = spellSlotInfo.findIndex(p => p[0] ==='pact');
        if (!spellSlotInfo[pactIndex][1].slotsAvailable) {
            var pactSpellEquivalent = spellSlotInfo.findIndex(s => s[0] === 'spell'+pactInfo[1].level);
            spellSlotInfo[pactIndex][1].slotsAvailable = spellSlotInfo[pactSpellEquivalent][1].slotsAvailable;
        }

        let dispose = spells.reduce(function (dispose, s) {
            let prep = s.data.preparation.mode;
            const prepType = game.dnd5e.config.spellPreparationModes[prep];

            var level = s.data.level;
            let power = (prep === 'pact' || prep === 'atwill' || prep === 'innate')
            var max, slots, levelName, levelKey, levelInfo;
                      
            if (power) {
                levelKey = prep;
            }
            else {
                levelKey = 'spell' + level;
                levelName = level === 0 ? 'Cantrips' : `Level ${level}`;
            }

            levelInfo = spellSlotInfo.find(lvl => lvl[0] === levelKey)?.[1];
            slots = levelInfo?.value;
            max = levelInfo?.max;

            // Initialise subcategory if non-existant.
            if (power) {
                if (!powers.subcategories.hasOwnProperty(prepType)) {
                    powers.subcategories[prepType] = this.initializeEmptyActions();
                    if (max > 0) {
                        powers.subcategories[prepType].info1 = `${slots}/${max}`;
                    }
                }
            } else {                                
                if (!book.subcategories.hasOwnProperty(levelName)) {
                    book.subcategories[levelName] = this.initializeEmptyActions();
                    if (max > 0) {
                        book.subcategories[levelName].info1 = `${slots}/${max}`;
                    }
                }
            }
            
            let spell = this._buildItem(tokenId, actorType, actor, macroType, s);
            
            if (settings.get('showSpellInfo'))
                this._addSpellInfo(s, spell);

            if (!max || levelInfo?.slotsAvailable) {
                if (power) {
                    powers.subcategories[prepType].actions.push(spell);
                } else {
                    book.subcategories[levelName].actions.push(spell);
                }
            }
            
            return dispose;
        }.bind(this), {});
    
        let result = this.initializeEmptyCategory();
        
        if (Object.keys(powers.subcategories).length > 0)
            result.subcategories.powers = powers;
    
        if (Object.keys(book.subcategories).length > 0)
            result.subcategories.books = book;
        
        return result;
    }

    /** @private */
    _addSpellInfo(s, spell) {
        let c = s.data.components;

        if (c?.vocal)
            spell.info1 += this.i18n('DND5E.ComponentVerbal').charAt(0).toUpperCase();

        if (c?.somatic)
            spell.info1 += this.i18n('DND5E.ComponentSomatic').charAt(0).toUpperCase();
        
        if (c?.material)
            spell.info1 += this.i18n('DND5E.ComponentMaterial').charAt(0).toUpperCase();

        if (c?.concentration)
            spell.info2 += this.i18n('DND5E.Concentration').charAt(0).toUpperCase();

        if (c?.ritual)
            spell.info3 += this.i18n('DND5E.Ritual').charAt(0).toUpperCase();
    }
    
    /** FEATS **/

    /** @private */
    _getFeatsList(actor, tokenId, actorType) {
        let validFeats = this._filterLongerActions(actor.data.items.filter(i => i.type == 'feat'));
        let sortedFeats = this._sortByItemSort(validFeats);
        let feats = this._categoriseFeats(tokenId, actor, actorType, sortedFeats);
    
        return feats;
    }
    
    /** @private */
    _categoriseFeats(tokenId, actor, actorType, feats) {
        let active = this.initializeEmptyActions();
        let passive = this.initializeEmptyActions();
        let lair = this.initializeEmptyActions();
        let legendary = this.initializeEmptyActions();

        let dispose = feats.reduce(function (dispose, f) {
            const activationTypes = game.dnd5e.config.abilityActivationTypes;
            const activationType = f.data.activation.type;
            const macroType = 'feat';

            let feat = this._buildItem(tokenId, actorType, actor, macroType, f);
            
            if (!activationType || activationType === '') {
                passive.actions.push(feat);
                return;
            } 
            
            if (activationType == 'lair') {
                lair.actions.push(feat);
                return;
            }

            if (activationType == 'legendary') {
                legendary.actions.push(feat)
                return;
            } 

            active.actions.push(feat);

            return;
        }.bind(this), {});
    
        let result = this.initializeEmptyCategory()
    
        if (active.actions.length > 0)
            result.subcategories.active = active;
    
        if (legendary.actions.length > 0)
            result.subcategories.legendary = legendary;
    
        if (lair.actions.length > 0)
            result.subcategories.lair = lair;
    
        if (passive.actions.length > 0 && !settings.get('ignorePassiveFeats'))
            result.subcategories.passive = passive;
        
        return result;
    }

    /** @private */
    _buildItem(tokenId, actorType, actor, macroType, item) {
        let encodedValue = [actorType, macroType, tokenId, item._id].join(this.delimiter);
        let result = { 'name': item.name, 'id': item._id, 'encodedValue': encodedValue }
        
        if (item.data.recharge && !item.data.recharge.charged && item.data.recharge.value) {
            result.name += ` (${this.i18n('tokenactionhud.dnd5e.rechargeHint')})`;
        }

        result.info1 = this._getQuantityData(item);

        result.info2 = this._getUsesData(item);

        result.info3 = this._getConsumeData(item, actor)

        return result;
    }

    /** @private */
    _getQuantityData(item) {
        let result = '';
        if (item.data.quantity > 1) {
            result = item.data.quantity;
        }

        return result;
    }

    /** @private */
    _getUsesData(item) {
        let result = '';
        if (item.data.uses?.value) {
            result = item.data.uses.value;

            if (item.data.uses.max) {
                result += `/${item.data.uses.max}`
            }
        }

        return result;
    }

    /** @private */
    _getConsumeData(item, actor) {
        let result = '';

        let consumeType = item.data.consume?.type;
        if (consumeType && consumeType !== '') {
            let consumeId = item.data.consume.target;
            let parentId = consumeId.substr(0, consumeId.lastIndexOf('.'));
            if (consumeType === 'attribute') {
                let target = getProperty(actor, `data.data.${consumeId}`);

                if (target) {
                    let parent = getProperty(actor, `data.data.${parentId}`)
                    result = target;
                    if (parent.max)
                        result += `/${parent.max}`
                }
            }

            if (consumeType === 'charges') {
                let consumeId = item.data.consume.target;
                let target = actor.getOwnedItem(consumeId);
                let uses = target?.data.data.uses;
                if (uses?.value) {
                    result = uses.value;
                    if (uses.max)
                        result += `/${uses.max}`
                }
            }

            if (!(consumeType === 'attribute' || consumeType === 'charges')) {
                let consumeId = item.data.consume.target;
                let target = actor.getOwnedItem(consumeId);
                let quantity = target?.data.data.quantity;
                if (quantity) {
                    result = quantity;
                }
            }
        }

        return result;
    }    

    /** @private */
    _filterLongerActions(items) {
        var result;

        if (settings.get('hideLongerActions'))
            result = items.filter(i => !i.data.activation || !(i.data.activation.type === 'minute' || i.data.activation.type === 'hour' || i.data.activation.type === 'day'));

        return result ? result : items;
    }

    /** @private */
    _filterNonpreparedSpells(spells) {
        const nonpreparableSpells = Object.keys(game.dnd5e.config.spellPreparationModes).filter(p => p != 'prepared');
        let result = spells;

        if (settings.get('showAllNonpreparableSpells')) {
            result = spells.filter(i => i.data.preparation.prepared || nonpreparableSpells.includes(i.data.preparation.mode) || i.data.level === 0)
        } else {
            result = spells.filter(i => i.data.preparation.prepared);
        }

        return result;
    }

    /** @private */
    _sortByItemSort(items) {
        let result = Object.values(items);

        result.sort((a,b) => a.sort - b.sort);

        return result;
    }
}