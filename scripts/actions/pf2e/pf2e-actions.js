import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';
import { PcActionHandlerPf2e } from './pf2e-actions-pc.js';
import { NpcActionHandlerPf2e } from './pf2e-actions-npc.js';

export class ActionHandlerPf2e extends ActionHandler {
    constructor(filterManager, categoryManager) {
        super(filterManager, categoryManager);
        this.pcActionHandler = new PcActionHandlerPf2e(this);
        this.npcActionHandler = new NpcActionHandlerPf2e(this);
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

        let legitimateActors = ['character', 'npc', 'familiar'];
        let actorType = actor.data.type;
        if (!legitimateActors.includes(actorType))
            return result;
        
        result.actorId = actor._id;

        if (actorType === 'character' || actorType === 'familiar')
            this.pcActionHandler.buildActionList(result, tokenId, actor);
        
        if (actorType === 'npc')
            this.npcActionHandler.buildActionList(result, tokenId, actor);
        
        if (settings.get('showHudTitle'))
            result.hudTitle = token.data?.name;

        return result;
    }

    /** @private */
    _getItemsList(actor, tokenId) {
        let macroType = 'item';
        let result = this.initializeEmptyCategory('items');
        
        let filter = ['weapon', 'equipment', 'consumable', 'armor'];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type)).sort(this._foundrySort);
        
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
 
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.weapons'), weapons);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.armour'), armour);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.equipment'), equipment);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.consumables'), consumables);

        return result;
    }

    /** @private */
    _getActionsList(actor, tokenId) {
        let macroType = 'action';
        let result = this.initializeEmptyCategory('actions');

        let filteredActions = (actor.items ?? []).filter(a => a.type === macroType).sort(this._foundrySort);;

        if (settings.get('ignorePassiveActions'))
            filteredActions = filteredActions.filter(a => a.data.data.actionType.value !== 'passive');

        let actions = this.initializeEmptySubcategory();
        actions.actions = this._produceActionMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.actionType.value === 'action' && this._actionIsShort(a)), macroType);

        let reactions = this.initializeEmptySubcategory();
        reactions.actions = this._produceActionMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.actionType.value === 'reaction' && this._actionIsShort(a)), macroType);

        let free = this.initializeEmptySubcategory();
        free.actions = this._produceActionMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.actionType.value === 'free' && this._actionIsShort(a)), macroType);

        let exploration = this.initializeEmptySubcategory();
        exploration.actions = this._produceActionMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.traits?.value.includes('exploration')), macroType);

        let downtime = this.initializeEmptySubcategory();
        downtime.actions = this._produceActionMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.traits?.value.includes('downtime')), macroType);

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.actions'), actions);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.reactions'), reactions);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.free'), free);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.exploration'), exploration);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.downtime'), downtime);

        return result;
    }

    /** @private */
    _actionIsShort(action) {
        return !(action.data.data.traits?.value.includes('exploration') || action.data.data.traits?.value.includes('downtime'));
    }

    /** @private */
    _getSpellsList(actor, tokenId) {
        let result = this.initializeEmptyCategory('spells');

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
        spellbooks.forEach(spellbook => {
            if (spellbook.data.data.prepared.value !== 'prepared')
                return;

            let bookName = spellbook.data.name;
            Object.entries(spellbook.data.data.slots).forEach(slot => {
                if (slot[1].prepared.length === 0 || slot[1].prepared.max <= 0)
                    return;
                
                let levelKey = slot[0];
                let level = levelKey.substr(4);
                let levelName =  `${this.i18n('tokenactionhud.level')} ${level}`;

                levelName = level == 0 ? this.i18n('tokenactionhud.cantrips') : levelName;
                
                let items = Object.values(slot[1].prepared).map(spell => { if (!spell.expended) return spells.find(sp => sp.data._id === spell.id) });
                items = items.filter(i => !!i);

                if (items.length === 0)
                    return;
                
                let bookCategory;
                if (!result.subcategories.some(s => s.name === bookName)) {
                    bookCategory = this.initializeEmptySubcategory();
                    bookCategory.name = bookName;
                    result.subcategories.push(bookCategory);
                } else {
                    bookCategory = result.subcategories.find(b => b.name === bookName);
                }
                
                let levelSubcategory = this.initializeEmptySubcategory();

                items.forEach(s => {
                    let encodedValue = [macroType, tokenId, `${spellbook.data._id}>${level}>${s.data._id}`].join(this.delimiter);
                    let spell = { name: s.name, encodedValue: encodedValue, id: s.data._id };
                    spell.img = this._getImage(s);
                    spell.icon = this._getActionIcon(s.data.data?.time?.value)

                    this._addSpellInfo(s, spell);
                    levelSubcategory.actions.push(spell);

                    if (level > 0) {
                        let spellExpend = { name: '-', encodedValue: encodedValue+'>expend', id: s.data._id, cssClass: 'stickLeft'};
                        levelSubcategory.actions.push(spellExpend);
                    }
                });

                if (result.subcategories.find(s => s.name === bookName)?.subcategories.length === 0) {
                    levelName = `${bookName} - ${levelName}`;
                    if (actor.data.type === 'character')
                        this._setSpellSlotInfo(tokenId, levelSubcategory, spellbook, level, true);

                    levelSubcategory.info2 = this._getSpellDcInfo(spellbook);
                }

                this._combineSubcategoryWithCategory(bookCategory, levelName, levelSubcategory);
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
            
            let category;
            if (!result.subcategories.some(b => b.name === bookName)) {
                category = this.initializeEmptySubcategory(bookName);
                category.name = bookName;
                result.subcategories.push(category);
            } else {
                category = result.subcategories.find(b => b.name === bookName);
            }
            
            let levelName = level == 0 ? this.i18n('tokenactionhud.cantrips') : `${this.i18n('tokenactionhud.level')} ${level}`;
            let levelNameWithBook = `${bookName} - ${levelName}`;

            // On first subcategory, include bookName, attack bonus, and spell DC.
            let levelCategory;
            if (category.subcategories.length === 0) {
                levelCategory = this.initializeEmptySubcategory();
                levelCategory.name = levelNameWithBook;
                category.subcategories.push(levelCategory);
                
                if (actor.data.type === 'character')
                    this._setSpellSlotInfo(tokenId, levelCategory, spellbook, level, true);

                levelCategory.info2 = this._getSpellDcInfo(spellbook);
            }
            
            // If there's only one subcategory, check if it's the same as the current
            let stillFirstSubcategory = category.subcategories.length === 1 && category.subcategories.some(s => s.name === levelNameWithBook);
            
            if (!(stillFirstSubcategory || category.subcategories.some(s => s.name === levelName))) {
                levelCategory = this.initializeEmptySubcategory(levelName);
                levelCategory.name = levelName;
                category.subcategories.push(levelCategory);

                if (actor.data.type === 'character')
                    this._setSpellSlotInfo(tokenId, levelCategory, spellbook, level, false);
            }
            
            let categoryName = stillFirstSubcategory ? levelNameWithBook : levelName;
            levelCategory = category.subcategories.find(s => s.name === categoryName);

            let encodedValue = [macroType, tokenId, `${spellbook.data._id}>${level}>${s.data._id}`].join(this.delimiter);
            let spell = { name: s.name, encodedValue: encodedValue, id: s.data._id };
            spell.img = this._getImage(s);
            spell.icon = this._getActionIcon(s.data.data?.time?.value)
            this._addSpellInfo(s, spell);
            levelCategory.actions.push(spell);     
                  
        }.bind(this));
        
        return result;
    }

    /** @private */
    _getSpellDcInfo(spellbook) {
        let result = '';
        
        let spelldc = spellbook.data.data.spelldc;
        let attackBonus = spelldc.value >= 0 ? `${this.i18n('tokenactionhud.atk')} +${spelldc.value}` : `${this.i18n('tokenactionhud.atk')} -${spelldc.value}`;
        let dcInfo = `${this.i18n('tokenactionhud.dc')}${spellbook.data.data.spelldc.dc}`;

        result = `${attackBonus} ${dcInfo}`;

        return result;
    }

    /** @private */
    _setSpellSlotInfo(tokenId, category, spellbook, level, firstSubcategory) {
        let tradition = spellbook.data.data.tradition.value;
        let prepType = spellbook.data.data.prepared.value;

        let slotInfo = !['prepared', 'focus'].includes(prepType);

        let maxSlots, valueSlots, increaseId, decreaseId;
        if (firstSubcategory && tradition === 'focus') {
            let focus = spellbook.data.data.focus;
            maxSlots = focus.pool;
            valueSlots = focus.points;
            
            if (maxSlots > 0) {          
                category.info1 = `${valueSlots}/${maxSlots}`;

                increaseId = `${spellbook._id}>focus>slotIncrease`;
                let increaseEncodedValue = ['spellSlot', tokenId, increaseId].join(this.delimiter);
                category.actions.unshift({id: increaseId, name: '+', encodedValue: increaseEncodedValue, cssClass:'shrink'})
        
                decreaseId = `${spellbook._id}>focus>slotDecrease`;
                let decreaseEncodedValue = ['spellSlot', tokenId, decreaseId].join(this.delimiter);
                category.actions.unshift({id: decreaseId, encodedValue: decreaseEncodedValue, name: '-', cssClass:'shrink'})
            }
        }
        
        if (slotInfo && level > 0 && tradition !== 'focus') {
            let slots = spellbook.data.data.slots;
            let slotLevel = `slot${level}`
            maxSlots = slots[slotLevel].max;
            valueSlots = slots[slotLevel].value;

            if (maxSlots > 0) {
                category.info1 = `${valueSlots}/${maxSlots}`;

                increaseId = `${spellbook._id}>${slotLevel}>slotIncrease`;
                let increaseEncodedValue = ['spellSlot', tokenId, increaseId].join(this.delimiter);
                category.actions.unshift({encodedValue: increaseEncodedValue, name: '+', id: increaseId, cssClass:'shrink'})
    
                decreaseId = `${spellbook._id}>${slotLevel}>slotDecrease`;
                let decreaseEncodedValue = ['spellSlot', tokenId, decreaseId].join(this.delimiter);
                category.actions.unshift({encodedValue: decreaseEncodedValue, name: '-', id: increaseId, cssClass:'shrink'})
            }
        }
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

        let result = this.initializeEmptyCategory('feats');

        let filter = [macroType];
        let items = (actor.items ?? []).filter(a => filter.includes(a.type)).sort(this._foundrySort);;

        let active = this.initializeEmptySubcategory();
        active.actions = this._produceActionMap(tokenId, (items ?? []).filter(a => a.data.data.actionType.value !== 'passive'), macroType);

        let passive = this.initializeEmptySubcategory();
        passive.actions = this._produceActionMap(tokenId, (items ?? []).filter(a => a.data.data.actionType.value === 'passive'), macroType, true);

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.active'), active);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.passive'), passive);

        return result;
    }

    /** @private */
    _getSaveList(actor, tokenId) {
        let result = this.initializeEmptyCategory('saves');

        let actorSaves = actor.data.data.saves;
        let saveMap = Object.keys(actorSaves).map(k => { return {_id: k, name: CONFIG.PF2E.saves[k]}});

        let saves = this.initializeEmptySubcategory();
        saves.actions = this._produceActionMap(tokenId, saveMap, 'save');

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.saves'), saves);

        return result;
    }

    /** @private */
    _getAbilityList(actor, tokenId) {
        let result = this.initializeEmptyCategory('abilities');

        let abbr = settings.get('abbreviateSkills');

        let actorAbilities = actor.data.data.abilities;
        let abilityMap = Object.keys(actorAbilities).map(k => { 
            let name = abbr ? k.charAt(0).toUpperCase() + k.slice(1) : CONFIG.PF2E.abilities[k];
            return {_id: k, name: name}});

        let abilities = this.initializeEmptySubcategory();
        abilities.actions = this._produceActionMap(tokenId, abilityMap, 'ability');

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.abilities'), abilities);

        return result;
    }

    /** @protected */
    createSkillMap(tokenId, macroType, skillEntry, abbreviated) {
            let key = skillEntry[0];
            let data = skillEntry[1];

            let name = abbreviated ? key.charAt(0).toUpperCase()+key.slice(1) : data.name.charAt(0).toUpperCase()+data.name.slice(1);

            let value = data.value;
            let info = '';
            if (value != 0) {
                if (value > 0)
                    info = `+${value}`;
                else
                    info = `${value}`;
            }

            let action = this._produceActionMap(tokenId, [{'_id': key, 'name': name}], macroType);
            action[0].info1 = info;
            return action[0];
    }

    /** @private */
    _getUtilityList(actor, tokenId) {
        let result = this.initializeEmptyCategory('utility');
        let macroType = 'utility';
        
        if (actor.data.type === 'character') {
                        
            let attributes = this.initializeEmptySubcategory();
            let atrributeActions = [];

            let heroPoints = actor.data.data.attributes?.heroPoints;
            if (heroPoints)
                atrributeActions.push(this._getAttributeAction(tokenId, 'heroPoint', this.i18n('tokenactionhud.heroPoints'), heroPoints.rank, heroPoints.max));

            let doomedPoints = actor.data.data.attributes?.doomed;
            let dyingPoints = actor.data.data.attributes?.dying;
            if (dyingPoints) {
                let dyingVal = dyingPoints.value;
                let dyingMax = dyingPoints.max;
                if (doomedPoints)
                    dyingMax -= doomedPoints.value;
                atrributeActions.push(this._getAttributeAction(tokenId, 'dying', this.i18n('tokenactionhud.dying'), dyingVal, dyingMax));
            }
            
            let woundedPoints = actor.data.data.attributes?.wounded;
            if (woundedPoints)
                atrributeActions.push(this._getAttributeAction(tokenId, 'wounded', this.i18n('tokenactionhud.wounded'), woundedPoints.value, woundedPoints.max));

            if (doomedPoints)
                atrributeActions.push(this._getAttributeAction(tokenId, 'doomed', this.i18n('tokenactionhud.doomed'), doomedPoints.value, doomedPoints.max));

            attributes.actions = atrributeActions;

            this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attributes'), attributes);
            
            let rests = this.initializeEmptySubcategory();

            let restActions = [];
            let shortRestValue = ['utility', tokenId, 'shortRest'].join(this.delimiter);
            let shortRestAction = {id: 'shortRest', name: this.i18n('tokenactionhud.treatWounds'), encodedValue: shortRestValue}
            restActions.push(shortRestAction)
    
            let longRestValue = ['utility', tokenId, 'longRest'].join(this.delimiter);
            let longRestAction = {id: 'longRest', name: this.i18n('tokenactionhud.restNight'), encodedValue: longRestValue}
            restActions.push(longRestAction)
            rests.actions = restActions;
            
            this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.rests'), rests);
        }

        return result;
    }

    _getAttributeAction(tokenId, macroType, attrName, attrVal, attrMax) {
        
        let id = attrName.slugify({replacement: '_', strict: true});
        let labelValue = [macroType, tokenId, id].join(this.delimiter);
        let attributeAction = {name: attrName, encodedValue: labelValue, id: id}
        attributeAction.info1 = `${attrVal}/${attrMax}`;

        return attributeAction;
    }

    /** @private */
    _buildItemActions(tokenId, macroType, itemList, isPassive = false) {
        let result = this._produceActionMap(tokenId, itemList, macroType, isPassive);

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
    _produceActionMap(tokenId, itemSet, type, isPassive = false) {
        return itemSet.map(i => this._produceAction(tokenId, i, type, isPassive));
    }

    /** @private */
    _produceAction(tokenId, item, type, isPassive = false) {
        let encodedValue = [type, tokenId, item._id].join(this.delimiter);
        let icon;
        let actions = item.data?.data?.actions;
        if (actions && !isPassive) {
            let actionValue = parseInt((actions || {}).value, 10) || 1;
            icon = this._getActionIcon(actionValue);
        }
        let img = this._getImage(item);
        return { name: item.name, encodedValue: encodedValue, id: item._id, img: img, icon: icon };
    }
    
    _getActionIcon(action) {
        const img = {
          1: `<span style='font-family: "Pathfinder2eActions"'>A</span>`,
          2: `<span style='font-family: "Pathfinder2eActions"'>D</span>`,
          3: `<span style='font-family: "Pathfinder2eActions"'>T</span>`,
          free: `<span style='font-family: "Pathfinder2eActions"'>F</span>`,
          reaction: `<span style='font-family: "Pathfinder2eActions"'>R</span>`
        };
        return img[action];
    }

    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }
}