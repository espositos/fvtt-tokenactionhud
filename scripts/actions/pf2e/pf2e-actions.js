import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

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
        let actorType = actor.data.type;
        if (!legitimateActors.includes(actorType))
            return result;
        
        result.actorId = actor._id;

        let strikes, actions, skills, saves, attributes, abilities;
        if (actorType === 'character') {
            strikes = this._getStrikesList(actor, tokenId, actorType); // ??? profit
            actions = this._getActionsList(actor, tokenId, actorType); // actions, reactions, free actions
            skills = this._getSkillsList(actor, tokenId, actorType); // skills and lore
            saves = this._getSaveList(actor, tokenId, actorType);
            attributes = this._getAttributeList(actor, tokenId, actorType);
            abilities = this._getAbilityList(actor, tokenId, actorType);
        }

        if (actorType === 'npc') {
            strikes = this._getStrikesListNpc(actor, tokenId, actorType); // ??? profit
            skills = this._getSkillsListNpc(actor, tokenId, actorType);
            saves = this._getSaveListNpc(actor, tokenId, actorType);
            attributes = this._getAttributeListNpc(actor, tokenId, actorType);
            actions = this._getActionsListNpc(actor, tokenId, actorType);
        }

        let items = this._getItemsList(actor, tokenId, actorType); // weapons, consumables, other?
        let spells = this._getSpellsList(actor, tokenId, actorType);
        let feats = this._getFeatsList(actor, tokenId, actorType); // active and passive

        this._combineCategoryWithList(result, 'strikes', strikes);
        this._combineCategoryWithList(result, 'actions', actions);
        this._combineCategoryWithList(result, 'items', items);
        this._combineCategoryWithList(result, 'spells', spells);
        this._combineCategoryWithList(result, 'feats', feats);
        this._combineCategoryWithList(result, 'skills', skills);
        this._combineCategoryWithList(result, 'abilities', abilities);
        this._combineCategoryWithList(result, 'saves', saves);
        this._combineCategoryWithList(result, 'attributes', attributes);

        return result;
    }

    /** @private */
    _getStrikesList(actor, tokenId, actorType) {
        let macroType = 'strike';
        let result = this.initializeEmptyCategory();

        let strikes = actor.data.data.actions.filter(a => a.type === macroType);

        strikes.forEach(s => {
            let subcategory = this.initializeEmptySubcategory();

            let variantsMap = s.variants.map(function (v) {
                let name = v.label.lastIndexOf('+') >= 0 ? v.label.slice(v.label.lastIndexOf('+')-1) : v.label.slice(v.label.lastIndexOf('-')-1);
                return {_id: encodeURIComponent(this.name+`>${this.variants.indexOf(v)}`), name: name }
            }.bind(s));
            subcategory.actions = this._produceMap(tokenId, actorType, variantsMap, macroType);
            
            subcategory.actions.push({name: 'Damage', encodedValue: `${actorType}.${macroType}.${tokenId}.${encodeURIComponent(s.name+'>damage')}`, id: encodeURIComponent(s.name+'>damage')})
            subcategory.actions.push({name: 'Critical', encodedValue: `${actorType}.${macroType}.${tokenId}.${encodeURIComponent(s.name+'>critical')}`, id: encodeURIComponent(s.name+'>critical')})

            this._combineSubcategoryWithCategory(result, s.name, subcategory);
        });

        return result;
    }

    /** @private */
    _getStrikesListNpc(actor, tokenId, actorType) {
        let macroType = 'strike';
        let result = this.initializeEmptyCategory();

        let strikes = actor.items.filter(a => a.type === 'melee');

        strikes.forEach(s => {
            let subcategory = this.initializeEmptySubcategory();

            let variantsMap = [];
            let penalty = s.data.isAgile ? 4 : 5;
            let bonusValue;
            for (let i = 0; i < 3; i++) {
                if (!bonusValue)
                    bonusValue = s.data.data.bonus.value;
                else
                    bonusValue -= penalty;

                if (bonusValue >= 0)
                    bonusValue = `+${bonusValue}`;
                else
                    bonusValue = `-${bonusValue}`;

                variantsMap.push({_id: `${s.data._id}>${i}`, name: bonusValue});
            }
                
            subcategory.actions = this._produceMap(tokenId, actorType, variantsMap, macroType);
            
            subcategory.actions.push({name: 'Damage', encodedValue: `${actorType}.${macroType}.${tokenId}.${encodeURIComponent(s.data._id+'>damage')}`, id: encodeURIComponent(s.data._id+'>damage')})
            subcategory.actions.push({name: 'Critical', encodedValue: `${actorType}.${macroType}.${tokenId}.${encodeURIComponent(s.data._id+'>critical')}`, id: encodeURIComponent(s.data._id+'>critical')})

            let attackEffects = s.data.data.attackEffects?.value;
            if (attackEffects.length > 0)
                attackEffects.forEach(a => subcategory.actions.push({name: `Plus ${a}`, encodedValue: `${actorType}.${macroType}.${tokenId}.plus>${encodeURIComponent(a)}`}));

            this._combineSubcategoryWithCategory(result, s.name, subcategory);
        });

        return result;
    }

    /** @private */
    _getActionsList(actor, tokenId, actorType) {
        let macroType = 'action';
        let result = this.initializeEmptyCategory();

        let filteredActions = (actor.data.data.actions ?? []).filter(a => a.type === macroType);

        let actions = this.initializeEmptySubcategory();
        actions.actions = this._produceMap(tokenId, actorType, (filteredActions ?? []).filter(a => a.data.actionType === 'action'), macroType);

        let reactions = this.initializeEmptySubcategory();
        reactions.actions = this._produceMap(tokenId, actorType, (filteredActions ?? []).filter(a => a.data.actionType === 'reaction'), macroType);

        let free = this.initializeEmptySubcategory();
        free.actions = this._produceMap(tokenId, actorType, (filteredActions ?? []).filter(a => a.data.actionType === 'free'), macroType);

        this._combineSubcategoryWithCategory(result, 'actions', actions);
        this._combineSubcategoryWithCategory(result, 'reactions', reactions);
        this._combineSubcategoryWithCategory(result, 'free actions', free);

        return result;
    }

    /** @private */
    _getActionsListNpc(actor, tokenId, actorType) {
        let macroType = 'action';
        let result = this.initializeEmptyCategory();

        let filteredActions = (actor.items ?? []).filter(a => a.data.type === macroType);

        let actions = this.initializeEmptySubcategory();
        actions.actions = this._produceMap(tokenId, actorType, (filteredActions ?? []).filter(a => a.data.data.actionType.value === 'action'), macroType);

        let reactions = this.initializeEmptySubcategory();
        reactions.actions = this._produceMap(tokenId, actorType, (filteredActions ?? []).filter(a => a.data.data.actionType.value === 'reaction'), macroType);

        let free = this.initializeEmptySubcategory();
        free.actions = this._produceMap(tokenId, actorType, (filteredActions ?? []).filter(a => a.data.data.actionType.value === 'free'), macroType);

        this._combineSubcategoryWithCategory(result, 'actions', actions);
        this._combineSubcategoryWithCategory(result, 'reactions', reactions);
        this._combineSubcategoryWithCategory(result, 'free actions', free);

        return result;
    }

    /** @private */
    _getItemsList(actor, tokenId, actorType) {
        let macroType = 'item';
        let result = this.initializeEmptyCategory();
        
        let filter = ['equipment', 'consumable', 'armor'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type));
        
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
        let result = '';

        let maxSlots, valueSlots, slots;
        let noSlotInfo = ['prepared', 'focus']
        console.log(firstSubcategory, spellbook, spellbook.data.data.tradition.value)
        if (firstSubcategory) {
            if (spellbook.data.data.tradition.value === 'focus') {
                let focus = spellbook.data.data.focus;
                console.log(focus);
                maxSlots = focus.pool;
                valueSlots = focus.points;
                result += `${valueSlots}/${maxSlots}`;
            } else if (!noSlotInfo.includes(spellbook.data.data.prepared.value) && level > 0) {
                slots = spellbook.data.data.slots;
                maxSlots = slots[`slot${level}`].max;
                valueSlots = slots[`slot${level}`].value;
                result += `${valueSlots}/${maxSlots}`;
            }
        } else if (!noSlotInfo.includes(spellbook.data.data.prepared.value) && level > 0) {
            slots = spellbook.data.data.slots;
            maxSlots = slots[`slot${level}`].max;
            valueSlots = slots[`slot${level}`].value;
            result += `${valueSlots}/${maxSlots}`;
        }

        return result;
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
    _getSkillsList(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();
        
        let abbr = settings.get('abbreviateSkills');

        let actorSkills = actor.data.data.skills;
        let skillMap = Object.keys(actorSkills).map(k => { 
            let name = abbr ? k.charAt(0).toUpperCase()+k.slice(1) : CONFIG.PF2E.skills[k];
            return {'_id': k, 'name': name}
        });

        let skills = this.initializeEmptySubcategory();
        skills.actions = this._produceMap(tokenId, actorType, skillMap, 'skill');

        let loreItems = actor.items.filter(i => i.data.type === 'lore');
        let lore = this.initializeEmptySubcategory();
        lore.actions = this._produceMap(tokenId, actorType, loreItems, 'lore');

        this._combineSubcategoryWithCategory(result, 'skills', skills);
        this._combineSubcategoryWithCategory(result, 'lore', lore);

        return result;
    }

    /** @private */
    _getSkillsListNpc(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();

        let abbr = settings.get('abbreviateSkills');

        let loreItems = actor.items.filter(i => i.data.type === 'lore');
        let lore = this.initializeEmptySubcategory();
        lore.actions = this._produceMap(tokenId, actorType, loreItems, 'lore');

        if (abbr)
            lore.actions.forEach(l => l.name = l.name.substr(0,4));

        this._combineSubcategoryWithCategory(result, 'skills', lore);

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
    _getSaveList(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();

        let actorSaves = actor.data.data.saves;
        let saveMap = Object.keys(actorSaves).map(k => { return {'_id': k, 'name': actorSaves[k].name.charAt(0).toUpperCase()+actorSaves[k].name.slice(1)}});

        let saves = this.initializeEmptySubcategory();
        saves.actions = this._produceMap(tokenId, actorType, saveMap, 'save');

        this._combineSubcategoryWithCategory(result, 'saves', saves);

        return result;
    }

    /** @private */
    _getSaveListNpc(actor, tokenId, actorType) {
        let result = this.initializeEmptyCategory();

        let actorSaves = actor.data.data.saves;
        let saveMap = Object.keys(actorSaves).map(k => { return {'_id': k, 'name': k.charAt(0).toUpperCase()+k.slice(1)}});

        let saves = this.initializeEmptySubcategory();
        saves.actions = this._produceMap(tokenId, actorType, saveMap, 'save');

        this._combineSubcategoryWithCategory(result, 'saves', saves);

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
    _getAttributeList(actor, tokenId, actorType) {
        let macroType = 'attribute';
        let result = this.initializeEmptyCategory();
        let attributes = this.initializeEmptySubcategory();

        let rollableAttributes = Object.entries(actor.data.data.attributes).filter(a => !!a[1].roll);
        let attributesMap = rollableAttributes.map(a => {
            let name = a[0].charAt(0).toUpperCase()+a[0].slice(1);
            return { _id: a[0], name: name } 
        });
        
        attributes.actions = this._produceMap(tokenId, actorType, attributesMap, macroType);
        
        this._combineSubcategoryWithCategory(result, 'attributes', attributes);

        return result;
    }

    /** @private */
    _getAttributeListNpc(actor, tokenId, actorType) {
        let macroType = 'attribute';
        let result = this.initializeEmptyCategory();
        let attributes = this.initializeEmptySubcategory();

        let attributesMap = [{_id: 'perception', name: 'Perception'},{_id: 'initiative', name: 'Initiative'}]
        
        attributes.actions = this._produceMap(tokenId, actorType, attributesMap, macroType);
        
        this._combineSubcategoryWithCategory(result, 'attributes', attributes);

        return result;
    }
    
    /** @private */
    _produceMap(tokenId, actorType, itemSet, type) {
        return itemSet.map(i => { return { 'name': i.name, 'encodedValue': `${actorType}.${type}.${tokenId}.${i._id}`, 'id': i._id };});
    }
}