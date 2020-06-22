import {ActionHandler} from './actionHandler.js';
import * as settings from '../settings.js';
import * as checkLists from './checks-dnd5e.js';

export class ActionHandler5e extends ActionHandler {
    constructor () {
        super();
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

        result.actorId = actor._id;
        
        let items = this._getItemList(actor, tokenId);
        let spells = this._getSpellsList(actor, tokenId);
        let feats = this._getFeatsList(actor, tokenId);
        
        let checks = checkLists.buildChecksList(tokenId);
    
        if (Object.keys(items.subcategories).length > 0)
            result.categories.items = items;
    
        if (Object.keys(spells.subcategories).length > 0)
            result.categories.spells = spells;
    
        if (Object.keys(feats.subcategories).length > 0)
            result.categories.feats = feats;
    
        for (let [k, v] of Object.entries(checks)) {
            if (Object.keys(checks[k].subcategories).length > 0 && !result.categories.hasOwnProperty(k))
                result.categories[k] = v;
        }

        return result;
    }
    
    /** ITEMS **/
    
    /** @private */
    _getItemList(actor, tokenId) {
        let validItems = this._filterLongerActions(actor.data.items);
        let sortedItems = this._sortByItemSort(validItems);
        let macroType = 'item';
        var equipped;

        if (actor.data.type === 'npc' && settings.get('showAllNpcItems')) {
            settings.Logger.debug('NPC detected, showing all items.')
            equipped = sortedItems.filter(i => i.type !== 'consumable' && i.type !== 'spell' && i.type !== 'feat');
        } else {
            equipped = sortedItems.filter(i => i.type !== 'consumable' && i.data.equipped && i.data.quantity > 0);
        }
        let activeEquipped = this._getActiveEquipment(equipped);
        
        let weapons = activeEquipped.filter(i => i.type == 'weapon');
        let weaponActions = weapons.map(w => this._buildItem(tokenId, actor, macroType, w));
    
        let equipment = activeEquipped.filter(i => i.type == 'equipment');
        let equipmentActions = equipment.map(e => this._buildItem(tokenId, actor, macroType, e));
        
        let other = activeEquipped.filter(i => i.type != 'weapon' && i.type != 'equipment')
        let otherActions = other.map(o => this._buildItem(tokenId, actor, macroType, o));
    
        let allConsumables = sortedItems.filter(i => i.type == 'consumable' && i.data.quantity > 0);
        
        let consumable = allConsumables.filter(c => c.data.uses.value && c.data.uses.value > 0)
        let consumableActions = consumable.map(c => this._buildItem(tokenId, actor, macroType, c));
        
        let inconsumable = allConsumables.filter(c => !(c.data.uses.max || c.data.uses.value) && c.data.consumableType != 'ammo')
        let incomsumableActions = inconsumable.map(i => this._buildItem(tokenId, actor, macroType, i));
        
        let itemsResult = this.initializeEmptyCategory();
            
        if (weaponActions.length > 0)
            itemsResult.subcategories.weapon = { actions: weaponActions };
    
        if (equipmentActions.length > 0)
            itemsResult.subcategories.equipment = { actions: equipmentActions };
        
        if (otherActions.length > 0)
            itemsResult.subcategories.other = { actions: otherActions };
        
        if (consumableActions.length > 0)
            itemsResult.subcategories.consumables = { actions: consumableActions };
        
        if (incomsumableActions.length > 0)
            itemsResult.subcategories.inconsumables = { actions: incomsumableActions };
        
        return itemsResult;
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
    _getSpellsList(actor, tokenId) {
        let validSpells = this._filterLongerActions(actor.data.items.filter(i => i.type == 'spell' && i.data.preparation.prepared));
        let spellsSorted = this._sortSpellsByLevel(validSpells);
        let spells = this._categoriseSpells(actor, tokenId, spellsSorted);
    
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
    _categoriseSpells(actor, tokenId, spells) {
        const powers = this.initializeEmptyCategory();
        const book = this.initializeEmptyCategory();
        const macroType = 'spell';
        const spellSlots = actor.data.data.spells;

        let dispose = spells.reduce(function (dispose, s) {
            let spell = this._buildItem(tokenId, actor, macroType, s);
            var level = s.data.level;
            let prep = s.data.preparation.mode;
            const prepType = game.dnd5e.config.spellPreparationModes[prep];
            let power = (prep === 'pact' || prep === 'atwill' || prep === 'innate')
            var max, slots, levelName;
    
            if (power) {
                if (!powers.subcategories.hasOwnProperty(prepType)) {
                    powers.subcategories[prepType] = this.initializeEmptyActions();
                    
                    if (spellSlots[prep] && spellSlots[prep].max > 0) {
                        max = spellSlots[prep].max;
                        slots = spellSlots[prep].value;
                        powers.subcategories[prepType].info = `${slots}/${max}`;
                    }
                }
            } else {                
                if (level === 0) {
                    levelName = 'Cantrips';
                } else {
                    levelName = `Level ${level}`;
                }
                
                if (!book.subcategories.hasOwnProperty(levelName)) {
                    book.subcategories[levelName] = this.initializeEmptyActions();
                }
                
                let spellLevelKey = 'spell' + level;
                if (spellSlots[spellLevelKey] && spellSlots[spellLevelKey].max > 0) {
                    max = spellSlots[spellLevelKey].max;
                    slots = spellSlots[spellLevelKey].value;
                    book.subcategories[levelName].info = `${spellSlots[spellLevelKey].value}/${spellSlots[spellLevelKey].max}`;
                }
            }

            if (!max || slots > 0) {
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
    
    /** FEATS **/

    /** @private */
    _getFeatsList(actor, tokenId) {
        let validFeats = this._filterLongerActions(actor.data.items.filter(i => i.type == 'feat'));
        let sortedFeats = this._sortByItemSort(validFeats);
        let feats = this._categoriseFeats(tokenId, actor, sortedFeats);
    
        return feats;
    }
    
    /** @private */
    _categoriseFeats(tokenId, actor, feats) {
        let active = this.initializeEmptyActions();
        let passive = this.initializeEmptyActions();
        let lair = this.initializeEmptyActions();
        let legendary = this.initializeEmptyActions();

        let dispose = feats.reduce(function (dispose, f) {
            const activationTypes = game.dnd5e.config.abilityActivationTypes;
            const activationType = f.data.activation.type;
            const macroType = 'feat';

            let feat = this._buildItem(tokenId, actor, macroType, f);
            
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
    _buildItem(tokenId, actor, macroType, item) {
        let result = { 'name': item.name, 'id': item._id, 'encodedValue': `${macroType}.${tokenId}.${item._id}` }
        
        if (item.data.recharge && !item.data.recharge.charged && item.data.recharge.value) {
            result.name += ' (Recharge)';
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
            if (consumeType === 'attribute') {
                let target = getProperty(actor, `actor.data.data.${consumeId}`);

                if (target?.value) {
                    result = target.value;
                    if (target.max)
                        result += `/${target.max}`
                }
            }

            if (consumeType !== 'attribute') {
                let consumeId = item.data.consume.target;
                let target = actor.getOwnedItem(consumeId);

                if (target?.data.data.quantity) {
                    result = target.data.data.quantity;
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
    _sortByItemSort(items) {
        let result = Object.values(items);

        result.sort((a,b) => a.sort - b.sort);

        return result;
    }

    /** @private */
    _sortAlphabetically(items) {
        let result = Object.values(items);

        result.sort((a,b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {sensitivity: 'base'}));
        
        return result;
    }
}