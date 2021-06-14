import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerD35E extends ActionHandler {
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

        let savesTitle = this.i18n('tokenactionhud.saves');
        let checksTitle = this.i18n('tokenactionhud.checks');

        this._addMultiSaves(list, tokenId, 'saves', savesTitle, 'abilitySave');
        this._addMultiAbilities(list, tokenId, 'checks', checksTitle, 'abilityCheck');

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
        
        let result = this.initializeEmptyCategory('attacks');

        let cmbCat = this.initializeEmptySubcategory();
        let cmbMacro = 'cmb';
        let name = this.i18n('tokenactionhud.d35e.grapple');
        let encodedValue = [cmbMacro, tokenId, cmbMacro].join(this.delimiter);
        let cmbAction = [{ name: name, encodedValue: encodedValue, id: cmbMacro }]
        cmbCat.actions = cmbAction;
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.d35e.grapple'), cmbCat);

        let weaponActions = sortedAttacks.map(w => this._buildItem(tokenId, actor, macroType, w));
        let weaponsCat = this.initializeEmptySubcategory();
        weaponsCat.actions = weaponActions;
        let weaponsTitle = this.i18n('tokenactionhud.attack');
        
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
            action.cssClass = w.data.data.active ? 'active' : '';
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
        let validItems = actor.data.items.filter(i => i.data.data.quantity > 0);
        let sortedItems = this._sortByItemSort(validItems);
        let macroType = 'item';

        let equipped = sortedItems.filter(i => i.type !== 'consumable' && i.data.data.equipped);
        
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
        let consumable = expendedFiltered.filter(c => (c.data.data.uses?.value && c.data.data.uses?.value >= 0) || (c.data.data.uses?.max && c.data.data.uses?.max >= 0) );
        let consumableActions = consumable.map(c => this._buildItem(tokenId, actor, macroType, c));
        let consumablesCat = this.initializeEmptySubcategory();
        consumablesCat.actions = consumableActions;
        
        let inconsumable = allConsumables.filter(c => !(c.data.data.uses?.max || c.data.data.uses?.value) && c.data.data.consumableType != 'ammo')
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
        let concentrationSubcategory = this.initializeEmptySubcategory('concentration');
        concentrationSubcategory.name = this.i18n('tokenactionhud.concentration');

        const spellbooks = [...new Set(spells.map(i => i.data.data.spellbook))].sort();

        spellbooks.forEach(sb => {
            const isSpontaneous = actor.data.data.attributes.spells.spellbooks[sb].spontaneous;
            let spellbookName = sb.charAt(0).toUpperCase() + sb.slice(1);

            concentrationSubcategory.actions.push(this._createConcentrationAction(tokenId, spellbookName))

            const sbSpells = spells.filter(s => s.data.data.spellbook === sb)
                .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {sensitivity: 'base'}))
                .sort((a, b) => a.data.data.level - b.data.data.level);

            const spellsByLevel = sbSpells.reduce((arr, s) => {
                if (!arr.hasOwnProperty(s.data.data.level))
                    arr[s.data.data.level] = [];

                arr[s.data.data.level].push(s);

                return arr;
            }, {});

            var firstLevelOfBook = true;
            Object.entries(spellsByLevel).forEach(level => {
                var category = this.initializeEmptySubcategory();

                var categoryName = level[0] > 0 ? `${this.i18n('tokenactionhud.level')} ${level[0]}` : this.i18n('tokenactionhud.cantrips');
                var spellInfo = actor.data.data.attributes?.spells?.spellbooks[sb]['spells']['spell'+level[0]];
                if (spellInfo && spellInfo.max > 0) {
                    var categoryInfo = `${spellInfo.value ? spellInfo.value + '/' : ''}${spellInfo.max}`;
                    category.info1 = categoryInfo;
                }
                
                if (firstLevelOfBook) {
                    categoryName = `${spellbookName} - ${categoryName}`;
                    firstLevelOfBook = false;
                }

                level[1].forEach(spell => {
                    if (!this._isSpellCastable(actor, spell))
                        return;

                    let name = spell.name;
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                    let id = spell._id;
                    let encodedValue = [macroType, tokenId, id].join(this.delimiter);
                    var action = { name: name, id: id, encodedValue: encodedValue, info2: '' }; 
                    action.img = this._getImage(spell);
                    this._addSpellInfo(spell, isSpontaneous, action);

                    category.actions.push(action);
                });

                this._combineSubcategoryWithCategory(result, categoryName, category);
            })
        });

        if (concentrationSubcategory.actions?.length > 0)
            result.subcategories.unshift(concentrationSubcategory);

        return result;
    }

    /** @private */
    _addSpellInfo(spell, isSpontaneous, spellAction) {

        let c = spell.data.data.components;

        if (!isSpontaneous && spell.data.data.preparation) {
            let prep = spell.data.data.preparation;
            if (prep.maxAmount || prep.preparedAmount)
                spellAction.info1 = `${prep.preparedAmount}/${prep.maxAmount}`;
        }

        if (c?.verbal)
            spellAction.info2 += this.i18n('D35E.SpellComponentVerbal').charAt(0).toUpperCase();

        if (c?.somatic)
            spellAction.info2 += this.i18n('D35E.SpellComponentSomatic').charAt(0).toUpperCase();
        
        if (c?.material)
            spellAction.info2 += this.i18n('D35E.SpellComponentMaterial').charAt(0).toUpperCase();

        if (c?.focus)
            spellAction.info3 = this.i18n('D35E.SpellComponentFocus').charAt(0).toUpperCase();
    }

    /** @private */
    _isSpellCastable(actor, spell) {
        const spellbook = spell.data.data.spellbook;
        const isSpontaneous = actor.data.data.attributes.spells.spellbooks[spellbook].spontaneous;
        
        if (spell.data.data.atWill)
        return true;
        
        if (isSpontaneous)
            return true;

        if (spell.data.data.preparation.preparedAmount === 0)
            return false;

        return true;
    }

    _createConcentrationAction(tokenId, school) {
        let concentrationMacro = 'concentration';
        let name = school;
        let encodedValue = [concentrationMacro, tokenId, school.toLowerCase()].join(this.delimiter);
        return { name: name, encodedValue: encodedValue, id: concentrationMacro }
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
            const activationType = f.data.data.activation.type;
            const macroType = 'feat';

            let feat = this._buildItem(tokenId, actor, macroType, f);
            
            if (!activationType || activationType === '' || activationType === 'passive') {
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

        let allSkills = new Set();
        
        Object.entries(skills).forEach(s => {
            if (s[0].startsWith('skill'))
                s[1].isCustomSkill = true;
            if (s[1].rt && !s[1].rank && !s[1].subSkills) return;
            if (!s[1].subSkills)
                allSkills.add(s);

            if (s[1].subSkills) {
                Object.entries(s[1].subSkills).forEach(ss => {
                    if (ss[1].rt && !ss[1].rank) return;
                    ss[1].isCustomSkill = true;
                    ss[1].mainSkill = s[0];
                    ss[1].name = `${CONFIG.D35E.skills[s[0]]} - ${ss[1].name}`;
                    allSkills.add(ss);
                })
            }
        });
        
        let skillsActions = [...allSkills].map(e => {
            let id = e[0];
            let data = e[1];
            let name = abbr ? id : CONFIG.D35E.skills[id];

            if (data.isCustomSkill || !name) {
                name = data.name ?? '?';
                id = `${data.mainSkill}.subSkills.${id}`
            }
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let encodedValue = [macroType, tokenId, id].join(this.delimiter);
            let info1 = this._getSkillRankInfo(data.rank);
            let info2 = [data.rt ? 'RT' : '', data.acp ? 'ACP' : ''].filter(a => a !== '').join(",");
            return { name: name, id: id, encodedValue: encodedValue, info1: info1, info2: info2 }; 
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
        
        let skillsActions = Object.entries(CONFIG.D35E.skills).map(e => {
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
        
        let actions = Object.entries(CONFIG.D35E.abilities).map(e => {
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
       
       let actions = Object.entries(CONFIG.D35E.savingThrows).map(e => {
           let name = abbr ? e[0] : e[1];
           name = name.charAt(0).toUpperCase() + name.slice(1);
           let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);

           return { name: name, id: e[0], encodedValue: encodedValue }; 
       });
       let savesCategory = this.initializeEmptySubcategory();
       savesCategory.actions = actions.filter(a => !!a);

       this._combineSubcategoryWithCategory(result, categoryName, savesCategory);
       
       let defensesCat = this.initializeEmptySubcategory();
       let defensesMacro = 'defenses';
       let defensesName = this.i18n('tokenactionhud.defenses');
       let defensesValue = [defensesMacro, tokenId, defensesMacro].join(this.delimiter);
       let defensesAction = [{ name: defensesName, encodedValue: defensesValue, id: defensesMacro }]
       defensesCat.actions = defensesAction;
       this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.defenses'), defensesCat);

       return result;
   }

    _addMultiAbilities(list, tokenId, categoryId, categoryName, macroType) {        
        let cat = this.initializeEmptyCategory(categoryId);
        
        let abbr = settings.get('abbreviateSkills');
        
        let actions = Object.entries(CONFIG.D35E.abilities).map(e => {
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

    _addMultiSaves(list, tokenId, categoryId, categoryName, macroType) {
        let cat = this.initializeEmptyCategory(categoryId);
        let savesCategory = this.initializeEmptySubcategory();

        let abbr = settings.get('abbreviateSkills');

        let actions = Object.entries(CONFIG.D35E.savingThrows).map(e => {
            let name = abbr ? e[0] : e[1];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
 
            return { name: name, id: e[0], encodedValue: encodedValue }; 
        });

        savesCategory.actions = actions.filter(a => !!a);
        
        this._combineSubcategoryWithCategory(cat, categoryName, savesCategory);
        this._combineCategoryWithList(list, categoryName, cat, true);
    }

    /** @private */
    _getUtilityList(actor, tokenId) {
        let result = this.initializeEmptyCategory('utility');
        let macroType = 'utility';
        
        let rests = this.initializeEmptySubcategory()

        if (actor.data.type === 'character') {       
            let longRestValue = [macroType, tokenId, 'rest'].join(this.delimiter);
            rests.actions.push({id:'rest', encodedValue: longRestValue, name: this.i18n('tokenactionhud.rest')})
        }
        
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.rests'), rests);
        
        return result;
    }

    /** @private */
    _addMultiUtilities(list, tokenId, actors) {
        let category = this.initializeEmptyCategory('utility');
        let macroType = 'utility';
        
        let rests = this.initializeEmptySubcategory();

        if (actors.every(a => a.data.type === 'character')) {       
            let longRestValue = [macroType, tokenId, 'rest'].join(this.delimiter);
            rests.actions.push({id:'rest', encodedValue: longRestValue, name: this.i18n('tokenactionhud.rest')})
        }
        
        this._combineSubcategoryWithCategory(category, this.i18n('tokenactionhud.rests'), rests);
    }


    /** @private */
    _buildItem(tokenId, actor, macroType, item) {
        let encodedValue = [macroType, tokenId, item._id].join(this.delimiter);
        let img = this._getImage(item);
        let icon = this._getActionIcon(item.data?.activation?.type);
        let name = this._getItemName(item);
        let result = { name: name, id: item._id, encodedValue: encodedValue, img: img, icon: icon }
        
        if (item.data.data.recharge && !item.data.data.recharge.charged && item.data.data.recharge.value) {
            result.name += ` (${this.i18n('tokenactionhud.recharge')})`;
        }

        result.info1 = this._getQuantityData(item);

        result.info2 = this._getUsesData(item);

        result.info3 = this._getConsumeData(item, actor)

        return result;
    }

    _getItemName(item) {
        let name;
        
        if (item.data.data.identified || game.user.isGM)
            name = item.data.data.identifiedName
        else
            name = item.data.data.unidentified?.name;
        
        if (!name)
            name = item.name;

        return name;
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
        if (item.data.data.quantity > 1) {
            result = item.data.data.quantity;
        }

        return result;
    }

    /** @private */
    _getUsesData(item) {
        let result = '';

        let uses = item.data.data.uses;
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

        let consumeType = item.data.data.consume?.type;
        if (consumeType && consumeType !== '') {
            let consumeId = item.data.data.consume.target;
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
                let consumeId = item.data.data.consume.target;
                let target = actor.getOwnedItem(consumeId);
                let uses = target?.data.data.uses;
                if (uses?.value) {
                    result = uses.value;
                    if (uses.max)
                        result += `/${uses.max}`
                }
            }

            if (!(consumeType === 'attribute' || consumeType === 'charges')) {
                let consumeId = item.data.data.consume.target;
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
            let uses = i.data.data.uses;
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
            immediate: `<i class="fas fa-bolt"></i>`,
            swift: `<i class="fas fa-plus"></i>`,
            full: `<i class="far fa-circle"></i>`,
            round: `<i class="fas fa-hourglass-start"></i>`,
            minute: `<i class="fas fa-hourglass-half"></i>`,
            hour: `<i class="fas fa-hourglass-end"></i>`
        };
        return img[action];
    }
}