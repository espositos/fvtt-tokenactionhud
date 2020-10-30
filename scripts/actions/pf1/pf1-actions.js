import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerPf1 extends ActionHandler {
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
        
        this._addAttacksList(result, actor, tokenId);
        this._addBuffsList(result, actor, tokenId);
        this._addItemsList(result, actor, tokenId);
        this._addSpellsList(result, actor, tokenId);
        this._addFeatsList(result, actor, tokenId);
        this._addSkillsList(result, actor, tokenId);
        this._addSavesList(result, actor, tokenId);
        this._addChecksList(result, actor, tokenId);
        this._addUtilityList(result, actor, tokenId);
        
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
    
    _addAttacksList(result, actor, tokenId) {
        let attacks = this._getAttacksList(actor, tokenId);
        let attackTitle = this.i18n('tokenactionhud.attack');
        this._combineCategoryWithList(result, attackTitle, attacks);
    }
    
    _addBuffsList(result, actor, tokenId) {
        let buffs = this._getBuffsList(actor, tokenId);
        let buffsTitle = this.i18n('tokenactionhud.buffs');
        this._combineCategoryWithList(result, buffsTitle, buffs);
    }

    _addItemsList(result, actor, tokenId) {
        let items = this._getItemList(actor, tokenId);
        let itemsTitle = this.i18n('tokenactionhud.inventory');
        this._combineCategoryWithList(result, itemsTitle, items);
    }
    
    _addSpellsList(result, actor, tokenId) {
        let spells = this._getSpellsList(actor, tokenId);
        let spellsTitle = this.i18n('tokenactionhud.spells');
        this._combineCategoryWithList(result, spellsTitle, spells);
    }
    
    _addFeatsList(result, actor, tokenId) {
        let feats = this._getFeatsList(actor, tokenId);
        let featsTitle = this.i18n('tokenactionhud.features');
        this._combineCategoryWithList(result, featsTitle, feats);
    }
    
    _addSkillsList(result, actor, tokenId) {
        let skills = this._getSkillsList(actor.data.data.skills, tokenId);
        let skillsTitle = this.i18n('tokenactionhud.skills');
        this._combineCategoryWithList(result, skillsTitle, skills);
    }
    
    _addSavesList(result, actor, tokenId) {
        let savesTitle = this.i18n('tokenactionhud.saves');
        let saves = this._getSavesList(tokenId, actor, 'saves', savesTitle, 'abilitySave');
        this._combineCategoryWithList(result, savesTitle, saves);
    }
    
    _addChecksList(result, actor, tokenId) {
        let checksTitle = this.i18n('tokenactionhud.checks');
        let checks = this._getAbilityList(tokenId, actor.data.data.abilities, 'checks', checksTitle, 'abilityCheck');
        this._combineCategoryWithList(result, checksTitle, checks);
    }

    _addUtilityList(result, actor, tokenId) {
        let utility = this._getUtilityList(actor, tokenId);
        let utilityTitle = this.i18n('tokenactionhud.utility');
        this._combineCategoryWithList(result, utilityTitle, utility);
    }
    
    /** @private */
    _getAttacksList(actor, tokenId) {
        let validAttacks = actor.data.items.filter(i => i.type === 'attack');
        let sortedAttacks = this._sortByItemSort(validAttacks);
        let macroType = 'attack';

        let weaponActions = sortedAttacks.map(w => this._buildItem(tokenId, actor, macroType, w));
        let weaponsCat = this.initializeEmptySubcategory();
        weaponsCat.actions = weaponActions;
        let weaponsTitle = this.i18n('tokenactionhud.attack');
        
        let result = this.initializeEmptyCategory('attacks');
        this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat);
        
        return result;
    }
    
    /** @private */
    _getBuffsList(actor, tokenId) {
        let validBuff = actor.data.items.filter(i => i.type === 'buff');
        let sortedBuffs = this._sortByItemSort(validBuff);
        let macroType = 'buff';

        let buffActions = sortedBuffs.map(w => {
            var action = this._buildItem(tokenId, actor, macroType, w);
            action.cssClass = w.data.active ? 'active' : '';
            return action;
        });
        let buffCat = this.initializeEmptySubcategory();
        buffCat.actions = buffActions;
        let buffTitle = this.i18n('tokenactionhud.buffs');
        
        let result = this.initializeEmptyCategory('buffs');
        this._combineSubcategoryWithCategory(result, buffTitle, buffCat);
        
        return result;
    }
    
    /** ITEMS **/
    
    /** @private */
    _getItemList(actor, tokenId) {
        let validItems = actor.data.items.filter(i => i.data.quantity > 0);
        let sortedItems = this._sortByItemSort(validItems);
        let macroType = 'item';

        let equipped = sortedItems.filter(i => i.type !== 'consumable' && i.data.equipped);
        
        let weapons = equipped.filter(i => i.type == 'weapon');
        let weaponActions = weapons.map(w => this._buildItem(tokenId, actor, macroType, w));
        let weaponsCat = this.initializeEmptySubcategory();
        weaponsCat.actions = weaponActions;
    
        let equipment = equipped.filter(i => i.type == 'equipment');
        let equipmentActions = equipment.map(e => this._buildItem(tokenId, actor, macroType, e));
        let equipmentCat = this.initializeEmptySubcategory();
        equipmentCat.actions = equipmentActions;
        
        let other = equipped.filter(i => i.type != 'weapon' && i.type != 'equipment')
        let otherActions = other.map(o => this._buildItem(tokenId, actor, macroType, o));
        let otherCat = this.initializeEmptySubcategory();
        otherCat.actions = otherActions;
    
        let allConsumables = sortedItems.filter(i => i.type == 'consumable');
        
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

    /** SPELLS **/
    
    /** @private */
    _getSpellsList(actor, tokenId) {
        let validSpells = actor.data.items.filter(i => i.type === 'spell');
        validSpells = this._filterExpendedItems(validSpells);

        let spells = this._categoriseSpells(actor, tokenId, validSpells);
    
        return spells;
    }
    
    /** @private */
    _categoriseSpells(actor, tokenId, spells) {
        const macroType = 'spell';
        let result = this.initializeEmptySubcategory('spells');

        const spellbooks = [...new Set(spells.map(i => i.data.spellbook))].sort();

        spellbooks.forEach(sb => {
            if (!sb)
                return;
            
            let spellbookName = sb.charAt(0).toUpperCase() + sb.slice(1);
            
            const sbSpells = spells.filter(s => s.data.spellbook === sb)
                .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {sensitivity: 'base'}))
                .sort((a, b) => a.data.level - b.data.level);

            const spellsByLevel = sbSpells.reduce((arr, s) => {
                if (!arr.hasOwnProperty(s.data.level))
                    arr[s.data.level] = [];

                arr[s.data.level].push(s);

                return arr;
            }, {});

            var firstLevelOfBook = true;
            Object.entries(spellsByLevel).forEach(level => {
                var category = this.initializeEmptySubcategory();
                var categoryName = level[0] > 0 ? `${this.i18n('tokenactionhud.level')} ${level[0]}` : this.i18n('tokenactionhud.cantrips');
                
                if (firstLevelOfBook) {
                    categoryName = `${spellbookName} - ${categoryName}`;
                    firstLevelOfBook = false;
                }

                level[1].forEach(spell => {
                    let name = spell.name;
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                    let id = spell._id;
                    let encodedValue = [macroType, tokenId, id].join(this.delimiter);
                    var action = { name: name, id: id, encodedValue: encodedValue, info1: '', info2: '' }; 
                    action.img = this._getImage(spell);
                    this._addSpellInfo(spell, action);

                    category.actions.push(action);
                });

                this._combineSubcategoryWithCategory(result, categoryName, category);
            })
        });

        return result;
    }

    /** @private */
    _addSpellInfo(s, spell) {
        let c = s.data.components;

        if (c?.verbal)
            spell.info1 += this.i18n('PF1.SpellComponentVerbal').charAt(0).toUpperCase();

        if (c?.somatic)
            spell.info1 += this.i18n('PF1.SpellComponentSomatic').charAt(0).toUpperCase();
        
        if (c?.material)
            spell.info1 += this.i18n('PF1.SpellComponentMaterial').charAt(0).toUpperCase();

        if (c?.focus)
            spell.info2 += this.i18n('PF1.SpellComponentFocus').charAt(0).toUpperCase();
    }
    
    /** FEATS **/

    /** @private */
    _getFeatsList(actor, tokenId) {
        let validFeats = actor.data.items.filter(i => i.type == 'feat');
        let sortedFeats = this._sortByItemSort(validFeats);
        let feats = this._categoriseFeats(tokenId, actor, sortedFeats);
    
        return feats;
    }
    
    /** @private */
    _categoriseFeats(tokenId, actor, feats) {
        let active = this.initializeEmptySubcategory();
        let passive = this.initializeEmptySubcategory();

        let dispose = feats.reduce(function (dispose, f) {
            const activationType = f.data.activation.type;
            const macroType = 'feat';

            let feat = this._buildItem(tokenId, actor, macroType, f);
            
            if (!activationType || activationType === '') {
                passive.actions.push(feat);
                return;
            } 

            active.actions.push(feat);

            return;
        }.bind(this), {});
    
        let result = this.initializeEmptyCategory('feats')

        let activeTitle = this.i18n('tokenactionhud.active');
        this._combineSubcategoryWithCategory(result, activeTitle, active);

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
            let name = abbr ? e[0] : CONFIG.PF1.skills[e[0]];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
            let info1 = this._getSkillRankInfo(e[1].rank);
            return { name: name, id: e[0], encodedValue: encodedValue, info1: info1 }; 
        });
        let skillsCategory = this.initializeEmptySubcategory();
        skillsCategory.actions = skillsActions;

        let skillsTitle = this.i18n('tokenactionhud.skills');
        this._combineSubcategoryWithCategory(result, skillsTitle, skillsCategory);

        return result;
    }

    _getSkillRankInfo(rank) {
        if (rank <= 0)
            return '';

        return `R${rank}`;
    }

    _addMultiSkills(list, tokenId) {
        let result = this.initializeEmptyCategory('skills');
        let macroType = 'skill';
        
        let abbr = settings.get('abbreviateSkills');
        
        let skillsActions = Object.entries(CONFIG.PF1.skills).map(e => {
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
        
        let actions = Object.entries(CONFIG.PF1.abilities).map(e => {
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

    /** @private */
    _getSavesList(tokenId, actor, categoryId, categoryName, macroType) {
       let result = this.initializeEmptyCategory(categoryId);
       
       let abbr = settings.get('abbreviateSkills');
       
       let actions = Object.entries(CONFIG.PF1.savingThrows).map(e => {
           let name = abbr ? e[0] : e[1];
           name = name.charAt(0).toUpperCase() + name.slice(1);
           let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);

           return { name: name, id: e[0], encodedValue: encodedValue }; 
       });
       let savesCategory = this.initializeEmptySubcategory();
       savesCategory.actions = actions.filter(a => !!a);

       this._combineSubcategoryWithCategory(result, categoryName, savesCategory);

       return result;
   }

    _addMultiAbilities(list, tokenId, categoryId, categoryName, macroType) {        
        let cat = this.initializeEmptyCategory(categoryId);
        
        let abbr = settings.get('abbreviateSkills');
        
        let actions = Object.entries(CONFIG.PF1.abilities).map(e => {
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
            // let longRestValue = [macroType, tokenId, 'longRest'].join(this.delimiter);
            // rests.actions.push({id:'longRest', encodedValue: longRestValue, name: this.i18n('tokenactionhud.longRest')})
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

        if (actors.every(a => a.data.type === 'character')) {          
            let shortRestValue = [macroType, tokenId, 'shortRest'].join(this.delimiter);
            rests.actions.push({id:'shortRest', encodedValue: shortRestValue, name: this.i18n('tokenactionhud.shortRest')})
            let longRestValue = [macroType, tokenId, 'longRest'].join(this.delimiter);
            rests.actions.push({id:'longRest', encodedValue: longRestValue, name: this.i18n('tokenactionhud.longRest')})
        }
        
        this._combineSubcategoryWithCategory(category, this.i18n('tokenactionhud.rests'), rests);
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
                let target = getProperty(actor, `data.data.${consumeId}`);

                if (target) {
                    let parent = getProperty(actor, `data.data.${parentId}`)
                    result = target;
                    if (!!parent.max)
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
            //standard: `<i class="fas fa-fist-raised"></i>`,
            immediate: `<i class="fas fa-plus"></i>`,
            swift: `<i class="fas fa-bolt"></i>`,
            full: `<i class="far fa-circle"></i>`,
            round: `<i class="fas fa-hourglass-start"></i>`,
            minute: `<i class="fas fa-hourglass-half"></i>`,
            hour: `<i class="fas fa-hourglass-end"></i>`
        };
        return img[action];
    }
}