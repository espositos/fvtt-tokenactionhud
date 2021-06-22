import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';
import { Logger } from '../../logger.js';

export class ActionHandler5e extends ActionHandler {
    constructor (filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    /** @override */
    doBuildActionList(token, multipleTokens) {
        if (token) {
            return this._buildSingleTokenList(token);
        } else if (multipleTokens) {
            return this._buildMultipleTokenList();
        }
        return this.initializeEmptyActionList();
    }

    async _buildSingleTokenList(token) {
        const list = this.initializeEmptyActionList();
        list.tokenId = token?.id;
        list.actorId = token?.actor?.id;
        if (!list.tokenId || !list.actorId) {
            return list;
        }

        if (settings.get('showHudTitle')) {
            list.hudTitle = token.data?.name;
        }

        const cats = await this._buildCategories(token);
        cats.flat().filter(c => c).forEach(c => {
            this._combineCategoryWithList(list, c.name, c);
        });

        return list;
    }

    _buildCategories(token) {
        return [
            this._buildItemsCategory(token),
            this._buildSpellsCategory(token),
            this._buildFeaturesCategory(token),
            this._buildSkillsCategory(token),
            this._buildAbilitiesCategory(token),
            this._buildEffectsCategory(token),
            this._buildConditionsCategory(token),
            this._buildUtilityCategory(token),
        ];
    }

    _buildAbilitiesCategory(token) {
        const actor = token.actor;
        const abilities = actor.data.data.abilities;

        if (settings.get('splitAbilities')) {
            const savesTitle = this.i18n('tokenactionhud.saves');
            const savesCat = this._getAbilityList(
                token.id, abilities, 'saves', savesTitle, 'abilitySave'
            );
            savesCat.name = savesTitle

            const checksTitle = this.i18n('tokenactionhud.checks');
            const checksCat = this._getAbilityList(
                token.id, abilities, 'checks',
                this.i18n('tokenactionhud.checks'),
                'abilityCheck'
            );
            checksCat.name = checksTitle;

            return [savesCat, checksCat];
        }

        return this._getAbilityList(
            token.id, abilities, 'abilities',
            this.i18n('tokenactionhud.abilities'),
            'ability'
        );
    }

    _buildMultipleTokenList() {
        const list = this.initializeEmptyActionList();
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

        if (settings.get('showConditionsCategory'))
            this._addMultiConditions(list, tokenId);

        this._addMultiUtilities(list, tokenId, actors);

        return list
    }

    /** ITEMS **/

    /** @private */
    _buildItemsCategory(token) {
        const actor = token.actor;
        const tokenId = token.id;

        let validItems = this._filterLongerActions(actor.data.items.filter(i => this._getEntityData(i).quantity > 0));
        let sortedItems = this._sortByItemSort(validItems);
        let macroType = 'item';

        let equipped;
        if (actor.data.type === 'npc' && settings.get('showAllNpcItems')) {
            equipped = sortedItems.filter(i => i.type !== 'consumable' && i.type !== 'spell' && i.type !== 'feat');
        } else {
            equipped = sortedItems.filter(i => i.type !== 'consumable' && this._getEntityData(i).equipped);
        }
        let activeEquipped = this._getActiveEquipment(equipped);

        let weapons = activeEquipped.filter(i => i.type == 'weapon');
        let weaponActions = weapons.map(w => this._buildEquipmentItem(tokenId, actor, macroType, w));
        let weaponsCat = this.initializeEmptySubcategory();
        weaponsCat.actions = weaponActions;

        let equipment = activeEquipped.filter(i => i.type == 'equipment');
        let equipmentActions = equipment.map(e => this._buildEquipmentItem(tokenId, actor, macroType, e));
        let equipmentCat = this.initializeEmptySubcategory();
        equipmentCat.actions = equipmentActions;

        let other = activeEquipped.filter(i => i.type != 'weapon' && i.type != 'equipment')
        let otherActions = other.map(o => this._buildEquipmentItem(tokenId, actor, macroType, o));
        let otherCat = this.initializeEmptySubcategory();
        otherCat.actions = otherActions;

        let allConsumables = this._getActiveEquipment(sortedItems.filter(i => i.type == 'consumable'));

        let expendedFiltered = this._filterExpendedItems(allConsumables);
        let consumable = expendedFiltered;
        let consumableActions = consumable.map(c => this._buildEquipmentItem(tokenId, actor, macroType, c));
        let consumablesCat = this.initializeEmptySubcategory();
        consumablesCat.actions = consumableActions;

        let tools = validItems.filter(t => t.type === 'tool');
        let toolsActions = tools.map(i => this._buildEquipmentItem(tokenId, actor, macroType, i));
        let toolsCat = this.initializeEmptySubcategory();
        toolsCat.actions = toolsActions;

        let weaponsTitle = this.i18n('tokenactionhud.weapons');
        let equipmentTitle = this.i18n('tokenactionhud.equipment');
        let otherTitle = this.i18n('tokenactionhud.other');
        let consumablesTitle = this.i18n('tokenactionhud.consumables');
        let toolsTitle = this.i18n('tokenactionhud.tools');

        let result = this.initializeEmptyCategory('inventory');
        result.name = this.i18n('tokenactionhud.inventory');

        this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat);
        this._combineSubcategoryWithCategory(result, equipmentTitle, equipmentCat);
        this._combineSubcategoryWithCategory(result, otherTitle, otherCat);
        this._combineSubcategoryWithCategory(result, consumablesTitle, consumablesCat);
        this._combineSubcategoryWithCategory(result, toolsTitle, toolsCat);

        return result;
    }

    /** @private */
    _getActiveEquipment(equipment) {
        const activationTypes = Object.keys(game.dnd5e.config.abilityActivationTypes).filter(at => at !== 'none');

        let activeEquipment = equipment.filter(e => {
            const equipmentData = this._getEntityData(e);
            let activation = equipmentData.activation;
            if (!activation)
                return false;

            return activationTypes.includes(equipmentData.activation.type);
        });

        return activeEquipment;
    }

    /** SPELLS **/

    /** @private */
    _buildSpellsCategory(token) {
        const actor = token.actor;
        if (actor.data.type !== 'vehicle') return;

        let validSpells = this._filterLongerActions(actor.data.items.filter(i => i.type === 'spell'));
        validSpells = this._filterExpendedItems(validSpells);

        if (actor.data.type === 'character' || !settings.get('showAllNpcItems'))
            validSpells = this._filterNonpreparedSpells(validSpells);

        let spellsSorted = this._sortSpellsByLevel(validSpells);
        return this._categoriseSpells(actor, token.id, spellsSorted);
    }

    /** @private */
    _sortSpellsByLevel(spells) {
        let result = Object.values(spells);

        result.sort((a,b) => {
            const aData = this._getEntityData(a);
            const bData = this._getEntityData(b);
            if (aData.level === bData.level)
                return a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {sensitivity: 'base'});
            return aData.level - bData.level;
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
            const spellData = this._getEntityData(s);
            let prep = spellData.preparation.mode;
            const prepType = game.dnd5e.config.spellPreparationModes[prep];

            var level = spellData.level;
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
        result.name = this.i18n('tokenactionhud.spells');

        let powersTitle = this.i18n('tokenactionhud.powers');
        let booksTitle = this.i18n('tokenactionhud.books');

        this._combineSubcategoryWithCategory(result, powersTitle, powers)
        this._combineSubcategoryWithCategory(result, booksTitle, book)

        return result;
    }

    /** @private */
    _addSpellInfo(s, spell) {
        const spellData = this._getEntityData(s);
        let c = spellData.components;

        spell.info1 = '';
        spell.info2 = '';
        spell.info3 = '';
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
    _buildFeaturesCategory(token) {
        let validFeats = this._filterLongerActions(token.actor.data.items.filter(i => i.type == 'feat'));
        let sortedFeats = this._sortByItemSort(validFeats);
        return this._categoriseFeats(token.id, token.actor, sortedFeats);
    }

    /** @private */
    _categoriseFeats(tokenId, actor, feats) {
        let active = this.initializeEmptySubcategory();
        let passive = this.initializeEmptySubcategory();
        let lair = this.initializeEmptySubcategory();
        let legendary = this.initializeEmptySubcategory();

        let dispose = feats.reduce(function (dispose, f) {
            const featData = this._getEntityData(f);
            const activationType = featData.activation.type;
            const macroType = 'feat';

            let feat = this._buildEquipmentItem(tokenId, actor, macroType, f);

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
        result.name = this.i18n('tokenactionhud.features');

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
    _buildSkillsCategory(token) {
        const actor = token.actor;
        if (actor.data.type !== 'vehicle') return;

        const skills = actor.data.data.skills;

        let result = this.initializeEmptyCategory('skills');
        result.name = this.i18n('tokenactionhud.skills');
        let macroType = 'skill';

        let abbr = settings.get('abbreviateSkills');

        let skillsActions = Object.entries(skills).map(e => {
            try {
                    let skillId = e[0];
                    let name = abbr ? skillId : game.dnd5e.config.skills[skillId];
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                    let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
                    let icon = this._getProficiencyIcon(skills[skillId].value);
                    return { name: name, id: e[0], encodedValue: encodedValue, icon: icon };
            } catch (error) {
                Logger.error(e);
                return null;
            }
        }).filter(s => !!s);
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
        result.name = categoryName;

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
    _buildUtilityCategory(token) {
        const actor = token.actor;

        let result = this.initializeEmptyCategory('utility');
        result.name = this.i18n('tokenactionhud.utility');
        let macroType = 'utility';

        let rests = this.initializeEmptySubcategory()
        let utility = this.initializeEmptySubcategory();

        this._addIntiativeSubcategory(macroType, result, token.id);

        if (actor.data.type === 'character') {
            let shortRestValue = [macroType, token.id, 'shortRest'].join(this.delimiter);
            rests.actions.push({id:'shortRest', encodedValue: shortRestValue, name: this.i18n('tokenactionhud.shortRest')})
            let longRestValue = [macroType, token.id, 'longRest'].join(this.delimiter);
            rests.actions.push({id:'longRest', encodedValue: longRestValue, name: this.i18n('tokenactionhud.longRest')})

            if (actor.data.data.attributes.hp.value <= 0) {
                let deathSaveValue = [macroType, token.id, 'deathSave'].join(this.delimiter);
                let deathSaveAction = {id:'deathSave', encodedValue: deathSaveValue, name: this.i18n('tokenactionhud.deathSave')};
                utility.actions.push(deathSaveAction)
            }

            let inspirationValue = [macroType, token.id, 'inspiration'].join(this.delimiter);
            let inspirationAction = {id:'inspiration', encodedValue: inspirationValue, name: this.i18n('tokenactionhud.inspiration')};
            inspirationAction.cssClass = actor.data.data.attributes?.inspiration ? 'active' : '';
            utility.actions.push(inspirationAction)
        }

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.rests'), rests);
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.utility'), utility);

        return result;
    }

    /** @private */
    _buildEffectsCategory(token) {
        let result = this.initializeEmptyCategory('effects');
        result.name = this.i18n('tokenactionhud.effects');
        this._addEffectsSubcategories(token.actor, token.id, result);
        return result;
    }

    /** @private */
    _buildConditionsCategory(token) {
        if (!settings.get('showConditionsCategory')) return;
        let result = this.initializeEmptyCategory('conditions');
        result.name = this.i18n('tokenactionhud.conditions');
        this._addConditionsSubcategory(token.actor, token.id, result);
        return result;
    }

    /** @private */
    _addEffectsSubcategories(actor, tokenId, category) {
        const macroType = 'effect';

        const effects = 'find' in actor.effects.entries ? actor.effects.entries : actor.effects;

        let tempCategory = this.initializeEmptySubcategory();
        let passiveCategory = this.initializeEmptySubcategory();

        effects.forEach(e => {
            const effectData = this._getEntityData(e);
            const name = effectData.label;
            const encodedValue = [macroType, tokenId, e.id].join(this.delimiter);
            const cssClass = effectData.disabled ? '' : 'active';
            const image = effectData.icon;
            let action = {name: name, id: e.id, encodedValue: encodedValue, img: image, cssClass: cssClass}

            e.isTemporary ? tempCategory.actions.push(action) : passiveCategory.actions.push(action);
        });

        this._combineSubcategoryWithCategory(category, this.i18n('tokenactionhud.temporary'), tempCategory);
        this._combineSubcategoryWithCategory(category, this.i18n('tokenactionhud.passive'), passiveCategory);
    }

    /** @private */
    _addMultiConditions(list, tokenId) {
        const category = this.initializeEmptyCategory('conditions');
        const macroType = 'condition';

        const availableConditions = CONFIG.statusEffects.filter(condition => condition.id !== '');
        const actors = canvas.tokens.controlled.filter(t => !!t.actor).map(t => t.actor);

        if (!availableConditions)
            return;

        let conditions = this.initializeEmptySubcategory();

        availableConditions.forEach(c => {
            const name = this.i18n(c.label);
            const encodedValue = [macroType, tokenId, c.id].join(this.delimiter);
            const cssClass = actors.every(actor => {
                const effects = 'some' in actor.effects.entries ? actor.effects.entries : actor.effects;
                effects.some(e => e.data.flags.core?.statusId === c.id)
            }) ? 'active' : '';
            const image = c.icon;
            const action = {name: name, id: c.id, encodedValue: encodedValue, img: image, cssClass: cssClass}

            conditions.actions.push(action);
        });

        const conName = this.i18n('tokenactionhud.conditions');
        this._combineSubcategoryWithCategory(category, conName, conditions);
        this._combineCategoryWithList(list, conName, category);
    }

    /** @private */
    _addConditionsSubcategory(actor, tokenId, category) {
        const macroType = 'condition';

        const availableConditions = CONFIG.statusEffects.filter(condition => condition.id !== '');

        if (!availableConditions)
            return;

        let conditions = this.initializeEmptySubcategory();

        availableConditions.forEach(c => {
            const name = this.i18n(c.label);
            const encodedValue = [macroType, tokenId, c.id].join(this.delimiter);
            const effects = 'some' in actor.effects.entries ? actor.effects.entries : actor.effects;
            const cssClass = effects.some(e => e.data.flags.core?.statusId === c.id) ? 'active' : '';
            const image = c.icon;
            const action = {name: name, id: c.id, encodedValue: encodedValue, img: image, cssClass: cssClass}

            conditions.actions.push(action);
        });

        this._combineSubcategoryWithCategory(category, this.i18n('tokenactionhud.conditions'), conditions);
    }

    /** @private */
    _addIntiativeSubcategory(macroType, category, tokenId) {
        const combat = game.combat;
        let combatant, currentInitiative;
        if (combat) {
            combatant = combat.combatants.find(c => c.tokenId === tokenId);
            currentInitiative = combatant?.initiative;
        }

        let initiative = this.initializeEmptySubcategory();

        let initiativeValue = [macroType, tokenId, 'initiative'].join(this.delimiter);
        let initiativeName = `${this.i18n('tokenactionhud.rollInitiative')}`;

        let initiativeAction = {id:'rollInitiative', encodedValue: initiativeValue, name: initiativeName};

        if (currentInitiative)
            initiativeAction.info1 = currentInitiative;
        initiativeAction.cssClass = currentInitiative ? 'active' : '';

        initiative.actions.push(initiativeAction);

        this._combineSubcategoryWithCategory(category, this.i18n('tokenactionhud.initiative'), initiative);
    }

    /** @private */
    _addMultiIntiativeSubcategory(macroType, tokenId, category) {
        const combat = game.combat;

        let initiative = this.initializeEmptySubcategory();

        let initiativeValue = [macroType, tokenId, 'initiative'].join(this.delimiter);
        let initiativeName = `${this.i18n('tokenactionhud.rollInitiative')}`;

        let initiativeAction = {id:'rollInitiative', encodedValue: initiativeValue, name: initiativeName};

        let isActive;
        if (combat) {
            let tokenIds = canvas.tokens.controlled.map(t => t.id);
            let tokenCombatants = tokenIds.map(id => combat.combatants.find(c => c.tokenId === id));
            isActive = tokenCombatants.every(c => !!c?.initiative)
        }

        initiativeAction.cssClass = isActive ? 'active' : '';

        initiative.actions.push(initiativeAction);

        this._combineSubcategoryWithCategory(category, this.i18n('tokenactionhud.initiative'), initiative);
    }

    /** @private */
    _addMultiUtilities(list, tokenId, actors) {
        let category = this.initializeEmptyCategory('utility');
        let macroType = 'utility';

        this._addMultiIntiativeSubcategory(macroType, tokenId, category);

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
    _buildEquipmentItem(tokenId, actor, macroType, item) {
        let action = this._buildItem(tokenId, actor, macroType, item);
        this._addItemInfo(actor, item, action);
        return action;
    }

    /** @private */
    _buildItem(tokenId, actor, macroType, item) {
        const itemData = this._getEntityData(item);
        const itemId = item.id ?? item._id;
        let encodedValue = [macroType, tokenId, itemId].join(this.delimiter);
        let img = this._getImage(item);
        let icon = this._getActionIcon(item.data?.activation?.type);
        let result = { name: item.name, id: itemId, encodedValue: encodedValue, img: img, icon: icon }

        if (itemData.recharge && !itemData.recharge.charged && itemData.recharge.value) {
            result.name += ` (${this.i18n('tokenactionhud.recharge')})`;
        }

        return result;
    }

    /** @private */
    _addItemInfo(actor, item, action) {
        action.info1 = this._getQuantityData(item);

        action.info2 = this._getUsesData(item);

        action.info3 = this._getConsumeData(item, actor)
    }

    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }

    /** @private */
    _getQuantityData(item) {
        const itemData = this._getEntityData(item);
        let result = '';
        let quantity = itemData.quantity;
        if (quantity > 1) {
            result = quantity;
        }

        return result;
    }

    /** @private */
    _getUsesData(item) {
        const itemData = this._getEntityData(item);
        let result = '';

        let uses = itemData.uses;
        if (!uses)
            return result;

        result = uses.value === 0 && uses.max ? '0' : uses.value;

        if (uses.max > 0) {
            result += `/${uses.max}`
        }

        return result;
    }

    /** @private */
    _getConsumeData(item, actor) {
        const itemData = this._getEntityData(item);
        let result = '';

        let consumeType = itemData.consume?.type;
        if (consumeType && consumeType !== '') {
            let consumeId = itemData.consume.target;
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
                let consumeId = itemData.consume.target;
                let target = actor.getOwnedItem(consumeId);
                let uses = target?.data.data.uses;
                if (uses?.value) {
                    result = uses.value;
                    if (uses.max)
                        result += `/${uses.max}`
                }
            }

            if (!(consumeType === 'attribute' || consumeType === 'charges')) {
                let consumeId = itemData.consume.target;
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
            result = items.filter(i => {
                const iData = this._getEntityData(i);
                return !iData.activation || !(iData.activation.type === 'minute' || iData.activation.type === 'hour' || iData.activation.type === 'day');
            });

        return result ? result : items;
    }

    /** @private */
    _filterNonpreparedSpells(spells) {
        const nonpreparableSpells = Object.keys(game.dnd5e.config.spellPreparationModes).filter(p => p != 'prepared');
        let result = spells;

        if (settings.get('showAllNonpreparableSpells')) {
            result = spells.filter(i => {
                const iData = this._getEntityData(i);
                return iData.preparation.prepared || nonpreparableSpells.includes(iData.preparation.mode) || iData.level === 0;
            });
        } else {
            result = spells.filter(i => this._getEntityData(i).preparation.prepared);
        }

        return result;
    }

    _filterExpendedItems(items) {
        if (settings.get('showEmptyItems'))
            return items;

        return items.filter(i => {
            const iData = this._getEntityData(i);
            let uses = iData.uses;
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

    _getEntityData(entity) {
        return entity.data.data ?? entity.data;
    }
}
