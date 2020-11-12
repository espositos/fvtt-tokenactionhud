import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandler5e extends ActionHandler {
    constructor (filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    

    /** @override */
    doBuildActionList(token, multipleTokens) {
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
        
        result.actorId = actor._id;

        let items = this._getItemList(actor, tokenId);
        let feats = this._getFeatsList(actor, tokenId);
        let utility = this._getUtilityList(actor, tokenId);

        let spells, skills;
        if (actor.data.type !== 'vehicle') {
            spells = this._getSpellsList(actor, tokenId);
            skills = this._getSkillsList(actor.data.data.skills, tokenId);
        }

        let itemsTitle = this.i18n('tokenactionhud.inventory');
        let spellsTitle = this.i18n('tokenactionhud.spells');
        let featsTitle = this.i18n('tokenactionhud.features');
        let skillsTitle = this.i18n('tokenactionhud.skills');
        
        this._combineCategoryWithList(result, itemsTitle, items);
        this._combineCategoryWithList(result, spellsTitle, spells);
        this._combineCategoryWithList(result, featsTitle, feats);
        this._combineCategoryWithList(result, skillsTitle, skills);
        
        if (settings.get('splitAbilities')) {
            let savesTitle = this.i18n('tokenactionhud.saves');
            let checksTitle = this.i18n('tokenactionhud.checks');
            let saves = this._getAbilityList(tokenId, actor.data.data.abilities, 'saves', savesTitle, 'abilitySave');
            let checks = this._getAbilityList(tokenId, actor.data.data.abilities, 'checks', checksTitle, 'abilityCheck');
            
            this._combineCategoryWithList(result, savesTitle, saves);
            this._combineCategoryWithList(result, checksTitle, checks);
        } else {
            let abilitiesTitle = this.i18n('tokenactionhud.abilities');
            let abilities = this._getAbilityList(tokenId, actor.data.data.abilities, 'abilities', abilitiesTitle, 'ability');
            
            this._combineCategoryWithList(result, abilitiesTitle, abilities);
        }
        
        let utilityTitle = this.i18n('tokenactionhud.utility');
        this._combineCategoryWithList(result, utilityTitle, utility);
        
        if (settings.get('showHudTitle'))
            result.hudTitle = token.data?.name;
        
        return result;
    }

    _buildMultipleTokenList(list) {
        list.tokenId = 'multi';
        list.actorId = 'multi';

        const allowedTypes = ['npc', 'character'];
        let actors = canvas.tokens.controlled.map(t => t.actor).filter(a => allowedTypes.includes(a.data.type));

        const tokenId = list.tokenId;

        this._addMultiSkills(list, tokenId);

        if (settings.get('splitAbilities')) {
            let savesTitle = this.i18n('tokenactionhud.saves');
            let checksTitle = this.i18n('tokenactionhud.checks');
            this._addMultiAbilities(list, tokenId, 'saves', savesTitle, 'abilitySave');
            this._addMultiAbilities(list, tokenId, 'checks', checksTitle, 'abilityCheck');
        } else {
            let abilitiesTitle = this.i18n('tokenactionhud.abilities');
            this._addMultiAbilities(list, tokenId, 'abilities', abilitiesTitle, 'ability');
        }

        this._addMultiUtilities(list, tokenId, actors);
    }
    
    /** ITEMS **/
    
    /** @private */
    _getItemList(actor, tokenId) {
        let validItems = this._filterLongerActions(actor.data.items.filter(i => i.data.quantity > 0));
        let sortedItems = this._sortByItemSort(validItems);
        let macroType = 'item';

        let equipped;
        if (actor.data.type === 'npc' && settings.get('showAllNpcItems')) {
            equipped = sortedItems.filter(i => i.type !== 'consumable' && i.type !== 'spell' && i.type !== 'feat');
        } else {
            equipped = sortedItems.filter(i => i.type !== 'consumable' && i.data.equipped);
        }
        let activeEquipped = this._getActiveEquipment(equipped);
        
        let weapons = activeEquipped.filter(i => i.type == 'weapon');
        let weaponActions = weapons.map(w => this._buildItem(tokenId, actor, macroType, w));
        let weaponsCat = this.initializeEmptySubcategory();
        weaponsCat.actions = weaponActions;
    
        let equipment = activeEquipped.filter(i => i.type == 'equipment');
        let equipmentActions = equipment.map(e => this._buildItem(tokenId, actor, macroType, e));
        let equipmentCat = this.initializeEmptySubcategory();
        equipmentCat.actions = equipmentActions;
        
        let other = activeEquipped.filter(i => i.type != 'weapon' && i.type != 'equipment')
        let otherActions = other.map(o => this._buildItem(tokenId, actor, macroType, o));
        let otherCat = this.initializeEmptySubcategory();
        otherCat.actions = otherActions;
    
        let allConsumables = this._getActiveEquipment(sortedItems.filter(i => i.type == 'consumable'));
        
        let expendedFiltered = this._filterExpendedItems(allConsumables);
        let consumable = expendedFiltered.filter(c => (c.data.uses?.value && c.data.uses?.value >= 0) || (c.data.uses?.max && c.data.uses?.max >= 0) );
        let consumableActions = consumable.map(c => this._buildItem(tokenId, actor, macroType, c));
        let consumablesCat = this.initializeEmptySubcategory();
        consumablesCat.actions = consumableActions;
        
        let inconsumable = allConsumables.filter(c => !(c.data.uses?.max || c.data.uses?.value) && c.data.consumableType != 'ammo')
        let incomsumableActions = inconsumable.map(i => this._buildItem(tokenId, actor, macroType, i));
        let inconsumablesCat = this.initializeEmptySubcategory();
        inconsumablesCat.actions = incomsumableActions;

        let tools = validItems.filter(t => t.type === 'tool');
        let toolsActions = tools.map(i => this._buildItem(tokenId, actor, macroType, i));
        let toolsCat = this.initializeEmptySubcategory();
        toolsCat.actions = toolsActions;
        
        let weaponsTitle = this.i18n('tokenactionhud.weapons');
        let equipmentTitle = this.i18n('tokenactionhud.equipment');
        let otherTitle = this.i18n('tokenactionhud.other');
        let consumablesTitle = this.i18n('tokenactionhud.consumables');
        let incomsumablesTitle = this.i18n('tokenactionhud.inconsumables');
        let toolsTitle = this.i18n('tokenactionhud.tools');

        let result = this.initializeEmptyCategory('inventory');

        this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat);
        this._combineSubcategoryWithCategory(result, equipmentTitle, equipmentCat);
        this._combineSubcategoryWithCategory(result, otherTitle, otherCat);
        this._combineSubcategoryWithCategory(result, consumablesTitle, consumablesCat);
        this._combineSubcategoryWithCategory(result, incomsumablesTitle, inconsumablesCat);
        this._combineSubcategoryWithCategory(result, toolsTitle, toolsCat);
        
        return result;
    }

    /** @private */
    _getActiveEquipment(equipment) {
        const activationTypes = Object.keys(game.dnd5e.config.abilityActivationTypes).filter(at => at !== 'none');
    
        let activeEquipment = equipment.filter(e => {
            let activation = e.data.activation;
            if (!activation)
                return false;
    
            return activationTypes.includes(e.data.activation.type);
        });
    
        return activeEquipment;
    }

    /** SPELLS **/
    
    /** @private */
    _getSpellsList(actor, tokenId) {
        let validSpells = this._filterLongerActions(actor.data.items.filter(i => i.type === 'spell'));
        validSpells = this._filterExpendedItems(validSpells);
        
        if (actor.data.type === 'character' || !settings.get('showAllNpcItems'))
            validSpells = this._filterNonpreparedSpells(validSpells);

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
        const powers = this.initializeEmptySubcategory();
        const book = this.initializeEmptySubcategory();
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
                if (!s[1])
                    s[1] = {}

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
                levelName = level ? `${this.i18n('tokenactionhud.level')} ${level}` : this.i18n('tokenactionhud.cantrips');
            }

            levelInfo = spellSlotInfo.find(lvl => lvl[0] === levelKey)?.[1];
            slots = levelInfo?.value;
            max = levelInfo?.max;

            let ignoreSlotsAvailable = settings.get('showEmptyItems');
            if (max && !(levelInfo?.slotsAvailable || ignoreSlotsAvailable))
                return;

            let spell = this._buildItem(tokenId, actor, macroType, s);
            
            if (settings.get('showSpellInfo'))
                this._addSpellInfo(s, spell);

            // Initialise subcategory if non-existant.
            let subcategory;
            if (power) {
                subcategory = powers.subcategories.find(cat => cat.name === prepType);
            } else {
                subcategory = book.subcategories.find(cat => cat.name === levelName);
            }

            if (!subcategory) {
                subcategory = this.initializeEmptySubcategory();
                if (max > 0) {
                    subcategory.info1 = `${slots}/${max}`;
                }
            }
            
            subcategory.actions.push(spell);

            if (power && powers.subcategories.indexOf(subcategory) < 0)
                this._combineSubcategoryWithCategory(powers, prepType, subcategory);
            else if (!power && book.subcategories.indexOf(subcategory) < 0)
                this._combineSubcategoryWithCategory(book, levelName, subcategory);
            
            return dispose;
        }.bind(this), {});
    
        let result = this.initializeEmptyCategory('spells');

        let powersTitle = this.i18n('tokenactionhud.powers');
        let booksTitle = this.i18n('tokenactionhud.books');

        this._combineSubcategoryWithCategory(result, powersTitle, powers)
        this._combineSubcategoryWithCategory(result, booksTitle, book)

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
    _getFeatsList(actor, tokenId) {
        let validFeats = this._filterLongerActions(actor.data.items.filter(i => i.type == 'feat'));
        let sortedFeats = this._sortByItemSort(validFeats);
        let feats = this._categoriseFeats(tokenId, actor, sortedFeats);
    
        return feats;
    }
    
    /** @private */
    _categoriseFeats(tokenId, actor, feats) {
        let active = this.initializeEmptySubcategory();
        let passive = this.initializeEmptySubcategory();
        let lair = this.initializeEmptySubcategory();
        let legendary = this.initializeEmptySubcategory();

        let dispose = feats.reduce(function (dispose, f) {
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
    
        let result = this.initializeEmptyCategory('feats')

        let activeTitle = this.i18n('tokenactionhud.active');
        let legendaryTitle = this.i18n('tokenactionhud.legendary');
        let lairTitle = this.i18n('tokenactionhud.lair');
        this._combineSubcategoryWithCategory(result, activeTitle, active);
        this._combineSubcategoryWithCategory(result, legendaryTitle, legendary);
        this._combineSubcategoryWithCategory(result, lairTitle, lair);

        if (!settings.get('ignorePassiveFeats')) {
            let passiveTitle = this.i18n('tokenactionhud.passive');
            this._combineSubcategoryWithCategory(result, passiveTitle, passive);
        }

        
        return result;
    }

    /** @private */
    _getSkillsList(skills, tokenId) {
        let result = this.initializeEmptyCategory('skills');
        let macroType = 'skill';
        
        let abbr = settings.get('abbreviateSkills');
        
        let skillsActions = Object.entries(skills).map(e => {
            let skillId = e[0];
            let name = abbr ? skillId : game.dnd5e.config.skills[skillId];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
            let icon = this._getProficiencyIcon(skills[skillId].value);
            return { name: name, id: e[0], encodedValue: encodedValue, icon: icon }; 
        });
        let skillsCategory = this.initializeEmptySubcategory();
        skillsCategory.actions = skillsActions;

        let skillsTitle = this.i18n('tokenactionhud.skills');
        this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);

        return result;
    }

    _addMultiSkills(list, tokenId) {
        let result = this.initializeEmptyCategory('skills');
        let macroType = 'skill';
        
        let abbr = settings.get('abbreviateSkills');
        
        let skillsActions = Object.entries(game.dnd5e.config.skills).map(e => {
            let name = abbr ? e[0] : e[1];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
            return { name: name, id: e[0], encodedValue: encodedValue }; 
        });
        let skillsCategory = this.initializeEmptySubcategory();
        skillsCategory.actions = skillsActions;

        let skillsTitle = this.i18n('tokenactionhud.skills');
        this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);
        this._combineCategoryWithList(list, skillsTitle, result, true);
    }

     /** @private */
     _getAbilityList(tokenId, abilities, categoryId, categoryName, macroType) {
        let result = this.initializeEmptyCategory(categoryId);
        
        let abbr = settings.get('abbreviateSkills');
        
        let actions = Object.entries(game.dnd5e.config.abilities).map(e => {
            if (abilities[e[0]].value === 0)
                return;

            let name = abbr ? e[0] : e[1];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
            let icon;
            if (categoryId === 'checks')
                icon = '';
            else
                icon = this._getProficiencyIcon(abilities[e[0]].proficient);

            return { name: name, id: e[0], encodedValue: encodedValue, icon: icon }; 
        });
        let abilityCategory = this.initializeEmptySubcategory();
        abilityCategory.actions = actions.filter(a => !!a);

        this._combineSubcategoryWithCategory(result, categoryName, abilityCategory);

        return result;
    }

    _addMultiAbilities(list, tokenId, categoryId, categoryName, macroType) {        
        let cat = this.initializeEmptyCategory(categoryId);
        
        let abbr = settings.get('abbreviateSkills');
        
        let actions = Object.entries(game.dnd5e.config.abilities).map(e => {
            let name = abbr ? e[0] : e[1];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);

            return { name: name, id: e[0], encodedValue: encodedValue }; 
        });
        let abilityCategory = this.initializeEmptySubcategory();
        abilityCategory.actions = actions;

        this._combineSubcategoryWithCategory(cat, categoryName, abilityCategory);
        this._combineCategoryWithList(list, categoryName, cat, true);
    }

    /** @private */
    _getUtilityList(actor, tokenId) {
        let result = this.initializeEmptyCategory('utility');
        let macroType = 'utility';
        
        let rests = this.initializeEmptySubcategory()
        let utility = this.initializeEmptySubcategory();

        if (actor.data.type === 'character') {          
            let shortRestValue = [macroType, tokenId, 'shortRest'].join(this.delimiter);
            rests.actions.push({id:'shortRest', encodedValue: shortRestValue, name: this.i18n('tokenactionhud.shortRest')})
            let longRestValue = [macroType, tokenId, 'longRest'].join(this.delimiter);
            rests.actions.push({id:'longRest', encodedValue: longRestValue, name: this.i18n('tokenactionhud.longRest')})
            
            if (actor.data.data.attributes.hp.value <= 0) {
                let deathSaveValue = [macroType, tokenId, 'deathSave'].join(this.delimiter);
                let deathSaveAction = {id:'deathSave', encodedValue: deathSaveValue, name: this.i18n('tokenactionhud.deathSave')};
                utility.actions.push(deathSaveAction)
            }
            
            let inspirationValue = [macroType, tokenId, 'inspiration'].join(this.delimiter);
            let inspirationAction = {id:'inspiration', encodedValue: inspirationValue, name: this.i18n('tokenactionhud.inspiration')};
            inspirationAction.cssClass = actor.data.data.attributes?.inspiration ? 'active' : '';
            utility.actions.push(inspirationAction)
        }
        
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.rests'), rests);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.utility'), utility);
        
        return result;
    }

    /** @private */
    _addMultiUtilities(list, tokenId, actors) {
        let category = this.initializeEmptyCategory('utility');
        let macroType = 'utility';
        
        let rests = this.initializeEmptySubcategory();
        let utility = this.initializeEmptySubcategory();

        if (actors.every(a => a.data.type === 'character')) {          
            let shortRestValue = [macroType, tokenId, 'shortRest'].join(this.delimiter);
            rests.actions.push({id:'shortRest', encodedValue: shortRestValue, name: this.i18n('tokenactionhud.shortRest')})
            let longRestValue = [macroType, tokenId, 'longRest'].join(this.delimiter);
            rests.actions.push({id:'longRest', encodedValue: longRestValue, name: this.i18n('tokenactionhud.longRest')})
                        
            let inspirationValue = [macroType, tokenId, 'inspiration'].join(this.delimiter);
            let inspirationAction = {id:'inspiration', encodedValue: inspirationValue, name: this.i18n('tokenactionhud.inspiration')};
            inspirationAction.cssClass = actors.every(a => a.data.data.attributes?.inspiration) ? 'active' : '';
            utility.actions.push(inspirationAction)
        }
        
        this._combineSubcategoryWithCategory(category, this.i18n('tokenactionhud.rests'), rests);
        this._combineSubcategoryWithCategory(category, this.i18n('tokenactionhud.utility'), utility);
        this._combineCategoryWithList(list, this.i18n('tokenactionhud.utility'), category)
    }


    /** @private */
    _buildItem(tokenId, actor, macroType, item) {
        let encodedValue = [macroType, tokenId, item._id].join(this.delimiter);
        let img = this._getImage(item);
        let icon = this._getActionIcon(item.data?.activation?.type);
        let result = { name: item.name, id: item._id, encodedValue: encodedValue, img: img, icon: icon }
        
        if (item.data.recharge && !item.data.recharge.charged && item.data.recharge.value) {
            result.name += ` (${this.i18n('tokenactionhud.recharge')})`;
        }

        result.info1 = this._getQuantityData(item);

        result.info2 = this._getUsesData(item);

        result.info3 = this._getConsumeData(item, actor)

        return result;
    }

    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
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

        let uses = item.data.uses;
        if (!uses)
            return result;

        if (!(uses.max || uses.value))
            return result;

        result = uses.value ?? 0;

        if (uses.max > 0) {
            result += `/${uses.max}`
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
                let target = getProperty(actor, `data.data.${parentId}`);

                if (target) {
                    result = target.value ?? 0;
                    if (!!target.max)
                        result += `/${target.max}`
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

    _filterExpendedItems(items) {
        if (settings.get('showEmptyItems'))
            return items;

        return items.filter(i => {
            let uses = i.data.uses;
            // Assume something with no uses is unlimited in its use.
            if (!uses) return true;

            // if it has a max but value is 0, don't return.
            if (uses.max > 0 && !uses.value)
                return false;

            return true;
        });
    }

    /** @private */
    _sortByItemSort(items) {
        let result = Object.values(items);

        result.sort((a,b) => a.sort - b.sort);

        return result;
    }

    /** @private */
    _getProficiencyIcon(level) {
        const icons = {
          0: '',
          0.5: '<i class="fas fa-adjust"></i>',
          1: '<i class="fas fa-check"></i>',
          2: '<i class="fas fa-check-double"></i>'
        };
        return icons[level];
    }
    
    
    _getActionIcon(action) {
        const img = {
            //action: `<i class="fas fa-fist-raised"></i>`,
            bonus: `<i class="fas fa-plus"></i>`,
            crew: `<i class="fas fa-users"></i>`,
            legendary: `<i class="fas fa-dragon"></i>`,
            reaction: `<i class="fas fa-bolt"></i>`,
            //none: `<i class="far fa-circle"></i>`,
            special: `<i class="fas fa-star"></i>`,
            lair: `<i class="fas fa-home"></i>`,
            minute: `<i class="fas fa-hourglass-start"></i>`,
            hour: `<i class="fas fa-hourglass-half"></i>`,
            day: `<i class="fas fa-hourglass-end"></i>`
        };
        return img[action];
    }
}