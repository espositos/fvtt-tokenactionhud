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

        if (multipleTokens) {
            this._buildMultipleTokenList(result);
            return result;
        }

        if (!token)
            return result;

        let tokenId = token.data._id;
        result.tokenId = tokenId;

        let actor = token.actor;
        if (!actor)
            return result;

        let knownActors = ['character', 'npc', 'familiar'];
        let actorType = actor.data.type;
        if (!knownActors.includes(actorType))
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

    _buildMultipleTokenList(list) {
        list.tokenId = 'multi';
        list.actorId = 'multi';

        const allowedTypes = ['npc', 'character', 'familiar'];
        let actors = canvas.tokens.controlled.map(t => t.actor).filter(a => allowedTypes.includes(a.data.type));

        const tokenId = list.tokenId;

        this._addMultiSkills(list, tokenId, actors);
        this._addMultiSaves(list, tokenId, actors);
        this._addMultiAbilities(list, tokenId, actors);
        this._addMultiAttributes(list, tokenId, actors);
        this._addMultiUtilities(list, tokenId, actors);
    }

    _addMultiSkills(list, tokenId, actors) {
        const macroType = 'skill';
        const category = this.initializeEmptyCategory(macroType);
        const subcategory = this.initializeEmptySubcategory(macroType);

        const allSkillSets = actors.map(a => Object.entries(a.data.data.skills)
            .filter(s => !!s[1].roll));
        const minSkillSetSize = Math.min(...allSkillSets.map(s => s.length));
        const smallestSkillSet = allSkillSets.find(set => set.length === minSkillSetSize);
        const finalSharedSkills = smallestSkillSet.filter(skill => allSkillSets.every(set => set.some(setSkill => setSkill[0] === skill[0])));

        finalSharedSkills.forEach(skill => {
            const key = skill[0];
            const data = skill[1];

            let name = CONFIG.PF2E.skills[key];
            if (!name)
                name = data.name;

            const encodedValue = [macroType, tokenId, key].join(this.delimiter);
            const action = {name: name, encodedValue: encodedValue, id: key};
            subcategory.actions.push(action);
        })

        const skillsName = this.i18n('tokenactionhud.commonSkills');
        this._combineSubcategoryWithCategory(category, skillsName, subcategory);
        this._combineCategoryWithList(list, skillsName, category);
    }

    _addMultiAbilities(list, tokenId, actors) {
        const macroType = 'ability';
        const category = this.initializeEmptyCategory(macroType);
        const subcategory = this.initializeEmptySubcategory(macroType);

        Object.entries(CONFIG.PF2E.abilities).forEach(ability => {
            const key = ability[0];
            const name = ability[1];
            const encodedValue = [macroType, tokenId, key].join(this.delimiter);
            const action = {name: name, encodedValue: encodedValue, id: key};
            subcategory.actions.push(action);
        })

        const skillsName = this.i18n('tokenactionhud.abilities');
        this._combineSubcategoryWithCategory(category, skillsName, subcategory);
        this._combineCategoryWithList(list, skillsName, category);
    }

    _addMultiSaves(list, tokenId, actors) {
        const macroType = 'save';
        const category = this.initializeEmptyCategory(macroType);
        const subcategory = this.initializeEmptySubcategory(macroType);

        Object.entries(CONFIG.PF2E.saves).forEach(save => {
            const key = save[0];
            const name = save[1];
            const encodedValue = [macroType, tokenId, key].join(this.delimiter);
            const action = {name: name, encodedValue: encodedValue, id: key};
            subcategory.actions.push(action);
        })

        const skillsName = this.i18n('tokenactionhud.saves');
        this._combineSubcategoryWithCategory(category, skillsName, subcategory);
        this._combineCategoryWithList(list, skillsName, category);
    }

    _addMultiAttributes(list, tokenId, actors) {
        let macroType = 'attribute';
        let result = this.initializeEmptyCategory('attributes');
        let attributes = this.initializeEmptySubcategory();

        let attributesMap = [{_id: 'perception', name: 'Perception'},{_id: 'initiative', name: 'Initiative'}]
        
        attributes.actions = this._produceActionMap(tokenId, attributesMap, macroType);
        
        const attributesName = this.i18n('tokenactionhud.attributes');
        this._combineSubcategoryWithCategory(result, attributesName, attributes);
        this._combineCategoryWithList(list, attributesName, result);
    }

    _addMultiUtilities(list, tokenId, actors) {
        if (!actors.every(actor => actor.data.type === 'character'))
            return;
        
        let result = this.initializeEmptyCategory('utility');
        let macroType = 'utility';
        
        let rests = this.initializeEmptySubcategory();

        let restActions = [];
        let treatWoundsValue = ['utility', tokenId, 'treatWounds'].join(this.delimiter);
        let treatWoundsAction = {id: 'treatWounds', name: this.i18n('tokenactionhud.treatWounds'), encodedValue: treatWoundsValue}
        restActions.push(treatWoundsAction)

        let longRestValue = ['utility', tokenId, 'longRest'].join(this.delimiter);
        let longRestAction = {id: 'longRest', name: this.i18n('tokenactionhud.restNight'), encodedValue: longRestValue}
        restActions.push(longRestAction)

        if (game.settings.get('pf2e', 'staminaVariant')) {
            let takeBreatherValue = ['utility', tokenId, 'takeABreather'].join(this.delimiter);
            let takeBreatherAction = {id: 'takeABreather', name: this.i18n('tokenactionhud.takeBreather'), encodedValue: takeBreatherValue};

            restActions.push(takeBreatherAction);
        }

        rests.actions = restActions;

        const utilityName = this.i18n('tokenactionhud.utility');
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.rests'), rests);
        this._combineCategoryWithList(list, utilityName, result);
    }

    /** @private */
    _getItemsList(actor, tokenId) {
        let macroType = 'item';
        let result = this.initializeEmptyCategory('items');
        
        let filter = ['weapon', 'equipment', 'consumable', 'armor', 'backpack'];
        let items = (actor.items ?? []).filter(a => a.data.data.equipped?.value && !a.data.data.containerId?.value.length)
            .filter(i => filter.includes(i.data.type)).sort(this._foundrySort);
        
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

        let equipmentList = items.filter(i => i.type === 'equipment' || i.type === 'backpack');
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
        this._addContainerSubcategories(tokenId, macroType, result, actor, items);

        return result;
    }

    /** @private */
    _addContainerSubcategories(tokenId, macroType, category, actor, items) {
        const allContainerIds = [...new Set(actor.items.filter(i => i.data.data.containerId?.value).map(i => i.data.data.containerId.value))];
        const containers = (items ?? []).filter(i => allContainerIds.includes(i._id));

        containers.forEach(container => {
            const containerId = container._id;
            const contents = actor.items.filter(i => i.data.data.containerId?.value === containerId).sort(this._foundrySort);
            if (contents.length === 0)
                return;
                
            const containerCategory = this.initializeEmptySubcategory(containerId);
            let containerActions = this._buildItemActions(tokenId, macroType, contents);
            containerCategory.actions = containerActions;
            containerCategory.info1 = container.data.data.bulkCapacity.value;

            this._combineSubcategoryWithCategory(category, container.name, containerCategory);
        })
    }

    /** @private */
    _getEffectsList(actor, tokenId) {
        let macroType = 'item';
        let result = this.initializeEmptyCategory('effects');
        
        let filter = ['effect'];
        let items = (actor.items ?? []).filter(i => filter.includes(i.data.type)).sort(this._foundrySort);
        
        let effectsList = items.filter(i => i.type === 'effect');
        let effectActions = this._buildItemActions(tokenId, macroType, effectsList);
        let effects = this.initializeEmptySubcategory();
        effects.actions = effectActions;

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.weapons'), effects);

        return result;
    }

    /** @private */
    _addStrikesCategories(actor, tokenId, category) {
        let macroType = 'strike';
        let strikes = actor.data.data.actions?.filter(a => a.type === macroType);
        if (actor.data.type === 'character')
            strikes = strikes.filter(s => s.ready);

        if (!strikes)
            return;
        
        let calculateAttackPenalty = settings.get('calculateAttackPenalty');

        strikes.forEach(s => {
            let subcategory = this.initializeEmptySubcategory();
            let glyph = s.glyph;
            if (glyph)
                subcategory.icon = `<span style='font-family: "Pathfinder2eActions"'>${glyph}</span>`

            let map = Math.abs(parseInt(s.variants[1].label.split(' ')[1]));
            let attackMod = s.totalModifier;
            
            let currentMap = 0;
            let currentBonus = attackMod;
            let calculatePenalty = calculateAttackPenalty;

            let variantsMap = s.variants.map(function (v) {
                let name;
                if (currentBonus === attackMod || calculatePenalty) {
                    name = currentBonus >= 0 ? `+${currentBonus}` : `${currentBonus}`;
                }
                else {
                    name = currentMap >= 0 ? `+${currentMap}` : `${currentMap}`;
                }
                currentMap -= map;
                currentBonus -= map;
                return {_id: encodeURIComponent(`${this.name}>${this.variants.indexOf(v)}`), name: name }
            }.bind(s));

            variantsMap[0].img = s.imageUrl;
            subcategory.actions = this._produceActionMap(tokenId, variantsMap, macroType);
            
            let damageEncodedValue = [macroType, tokenId, encodeURIComponent(s.name+'>damage')].join(this.delimiter);
            let critEncodedValue = [macroType, tokenId, encodeURIComponent(s.name+'>critical')].join(this.delimiter);
            subcategory.actions.push({name: this.i18n('tokenactionhud.damage'), encodedValue: damageEncodedValue, id: encodeURIComponent(s.name+'>damage')})
            subcategory.actions.push({name: this.i18n('tokenactionhud.critical'), encodedValue: critEncodedValue, id: encodeURIComponent(s.name+'>critical')})
            
            let ammoAction = this._ammoInfo(tokenId, actor, s);
            if (!!ammoAction) {
                subcategory.actions.push(ammoAction);   
            }
            
            this._combineSubcategoryWithCategory(category, s.name, subcategory);
        });
    }

    /** @private */
    _ammoInfo(tokenId, actor, strike) {
        if (!strike.selectedAmmoId)
            return;
        
        const item = actor.getOwnedItem(strike.selectedAmmoId);

        if (!item) {
            return {name: this.i18n('tokenactionhud.noammo'), encodedValue: 'noammo', id: 'noammo'};
        }

        let encodedValue = ['ammo', tokenId, item._id].join(this.delimiter);
        let img = this._getImage(item);
        let action = { name: item.name, encodedValue: encodedValue, id: item._id, img: img };
        action.info1 = item.data.data.quantity?.value

        return action;
    }

    /** @private */
    _getActionsList(actor, tokenId) {
        let macroType = 'action';
        let result = this.initializeEmptyCategory('actions');

        let filteredActions = (actor.items ?? [])
            .filter(a => a.type === macroType || a.type === 'feat').sort(this._foundrySort);

        if (settings.get('ignorePassiveActions'))
            filteredActions = filteredActions.filter(a => a.data.data.actionType.value !== 'passive');

        let actions = this.initializeEmptySubcategory();
        actions.actions = this._produceActionMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.actionType?.value === 'action' && this._actionIsShort(a)), macroType);

        let reactions = this.initializeEmptySubcategory();
        reactions.actions = this._produceActionMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.actionType?.value === 'reaction' && this._actionIsShort(a)), macroType);
        
        let free = this.initializeEmptySubcategory();
        free.actions = this._produceActionMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.actionType?.value === 'free' && this._actionIsShort(a)), macroType);
        
        let passive = this.initializeEmptySubcategory();
        passive.actions = this._produceActionMap(tokenId, (filteredActions ?? [])
            .filter(a => a.data.data.actionType?.value === 'passive' && this._actionIsShort(a) && a.type !== 'feat'), macroType);

        let exploration = this.initializeEmptySubcategory();
        exploration.actions = this._produceActionMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.traits?.value.includes('exploration')), macroType);

        let downtime = this.initializeEmptySubcategory();
        downtime.actions = this._produceActionMap(tokenId, (filteredActions ?? []).filter(a => a.data.data.traits?.value.includes('downtime')), macroType);
        

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.actions'), actions);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.reactions'), reactions);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.free'), free);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.passive'), passive);
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
            if (this._getSpellLevel(a) === this._getSpellLevel(b))
                return a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {sensitivity: 'base'});
            return this._getSpellLevel(a) - this._getSpellLevel(b);
        });

        return result;
    }    

    _getSpellLevel(spellItem) {
        return !!spellItem.data.data.heightenedLevel?.value ? parseInt(spellItem.data.data.heightenedLevel.value) : parseInt(spellItem.data.data.level.value);
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
            var level = this._getSpellLevel(s);
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
        let items = (actor.items ?? []).filter(a => filter.includes(a.type)).sort(this._foundrySort);

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
            let attributeActions = [];

            let heroPoints = actor.data.data.attributes?.heroPoints;
            if (heroPoints)
                attributeActions.push(this._getAttributeAction(tokenId, 'heroPoint', this.i18n('tokenactionhud.heroPoints'), heroPoints.rank, heroPoints.max));

            let doomedPoints = actor.data.data.attributes?.doomed;
            let dyingPoints = actor.data.data.attributes?.dying;
            if (dyingPoints) {
                let dyingVal = dyingPoints.value;
                let dyingMax = dyingPoints.max;
                if (doomedPoints)
                    dyingMax -= doomedPoints.value;
                attributeActions.push(this._getAttributeAction(tokenId, 'dying', this.i18n('tokenactionhud.dying'), dyingVal, dyingMax));
            }
            
            let woundedPoints = actor.data.data.attributes?.wounded;
            if (woundedPoints)
                attributeActions.push(this._getAttributeAction(tokenId, 'wounded', this.i18n('tokenactionhud.wounded'), woundedPoints.value, woundedPoints.max));

            if (doomedPoints)
                attributeActions.push(this._getAttributeAction(tokenId, 'doomed', this.i18n('tokenactionhud.doomed'), doomedPoints.value, doomedPoints.max));

            attributes.actions = attributeActions;

            this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attributes'), attributes);
            
            let rests = this.initializeEmptySubcategory();

            let restActions = [];
            let treatWoundsValue = ['utility', tokenId, 'treatWounds'].join(this.delimiter);
            let treatWoundsAction = {id: 'treatWounds', name: this.i18n('tokenactionhud.treatWounds'), encodedValue: treatWoundsValue}
            restActions.push(treatWoundsAction)
    
            let longRestValue = ['utility', tokenId, 'longRest'].join(this.delimiter);
            let longRestAction = {id: 'longRest', name: this.i18n('tokenactionhud.restNight'), encodedValue: longRestValue}
            restActions.push(longRestAction)

            if (game.settings.get('pf2e', 'staminaVariant')) {
                let takeBreatherValue = ['utility', tokenId, 'takeABreather'].join(this.delimiter);
                let takeBreatherAction = {id: 'takeABreather', name: this.i18n('tokenactionhud.takeBreather'), encodedValue: takeBreatherValue};

                restActions.push(takeBreatherAction);
            }

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
        let actionType = item.data?.data?.actionType?.value;
        if (['free', 'reaction', 'passive'].includes(actionType)) {
            icon = this._getActionIcon(actionType);
        } else if (actions && !isPassive) {
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
          reaction: `<span style='font-family: "Pathfinder2eActions"'>R</span>`,
          passive: ``
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