import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';
import { Logger } from '../../logger.js';

export class ActionHandlerT20 extends ActionHandler {
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
		// let effects = this._getEffectsList(actor, tokenId);
		let conditions;
		// if (settings.get('showConditionsCategory'))
			// conditions = this._getConditionsList(actor, tokenId);

		let spells = this._getSpellsList(actor, tokenId);
		let skills = this._getSkillsList(actor.data.data.pericias, tokenId);

		let itemsTitle = this.i18n('tokenactionhud.inventory');
		let spellsTitle = this.i18n('tokenactionhud.spells');
		let featsTitle = this.i18n('tokenactionhud.features');
		let skillsTitle = this.i18n('tokenactionhud.skills');
		// let effectsTitle = this.i18n('tokenactionhud.effects');
		// let conditionsTitle = this.i18n('tokenactionhud.conditions');
		
		this._combineCategoryWithList(result, itemsTitle, items);
		this._combineCategoryWithList(result, spellsTitle, spells);
		this._combineCategoryWithList(result, featsTitle, feats);
		// this._combineCategoryWithList(result, skillsTitle, skills);
		
		let abilitiesTitle = this.i18n('tokenactionhud.abilities');
		let abilities = this._getAbilityList(tokenId, actor.data.data.atributos, 'atributos', abilitiesTitle, 'atributo');
			
		// this._combineCategoryWithList(result, abilitiesTitle, abilities);
		
		// this._combineCategoryWithList(result, effectsTitle, effects);
		// this._combineCategoryWithList(result, conditionsTitle, conditions);
		
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
		
		let abilitiesTitle = this.i18n('tokenactionhud.abilities');
		this._addMultiAbilities(list, tokenId, 'atributos', abilitiesTitle, 'atributo');
		
		// if (settings.get('showConditionsCategory'))
			// this._addMultiConditions(list, tokenId);
	}
	
	/** ITEMS **/
	
	/** @private */
	_getItemList(actor, tokenId) {
		let validItems = this._filterLongerActions(actor.data.items.filter(i => i.data.qtd > 0));
		let sortedItems = this._sortByItemSort(validItems);
		let macroType = 'item';

		let equipped;
		// if (actor.data.type === 'npc' && settings.get('showAllNpcItems')) {
			// equipped = sortedItems.filter(i => i.type !== 'consumivel' && i.type !== 'magia' && i.type !== 'poder');
		// } else {
			// equipped = sortedItems.filter(i => i.type !== 'consumivel' && i.data.equipped);
		// }
		equipped = sortedItems.filter(i => i.type !== 'consumivel');
		let activeEquipped = this._getActiveEquipment(equipped);
		
		let weapons = activeEquipped.filter(i => i.type == 'arma');
		let weaponActions = weapons.map(w => this._buildEquipmentItem(tokenId, actor, macroType, w));
		let weaponsCat = this.initializeEmptySubcategory();
		weaponsCat.actions = weaponActions;
	
		let equipment = activeEquipped.filter(i => i.type == 'equip');
		let equipmentActions = equipment.map(e => this._buildEquipmentItem(tokenId, actor, macroType, e));
		let equipmentCat = this.initializeEmptySubcategory();
		equipmentCat.actions = equipmentActions;
		
		let other = activeEquipped.filter(i => i.type != 'arma' && i.type != 'equip')
		let otherActions = other.map(o => this._buildEquipmentItem(tokenId, actor, macroType, o));
		let otherCat = this.initializeEmptySubcategory();
		otherCat.actions = otherActions;
	
		let allConsumables = this._getActiveEquipment(sortedItems.filter(i => i.type == 'consumivel'));
		
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

		this._combineSubcategoryWithCategory(result, weaponsTitle, weaponsCat);
		this._combineSubcategoryWithCategory(result, equipmentTitle, equipmentCat);
		this._combineSubcategoryWithCategory(result, otherTitle, otherCat);
		this._combineSubcategoryWithCategory(result, consumablesTitle, consumablesCat);
		this._combineSubcategoryWithCategory(result, toolsTitle, toolsCat);
		
		return result;
	}

	/** @private */
	_getActiveEquipment(equipment) {
		const activationTypes = Object.keys(game.tormenta20.config.listaAtivacao).filter(at => at !== 'none');
		const includeList = ["poder", "magia", "consumivel"]
		
		let activeEquipment = equipment.filter(e => {
			if (!includeList.includes(e.type)) return true;
			let activation = e.data.ativacao;
			if (!activation)
				return false;
	
			return activationTypes.includes(e.data.ativacao.execucao);
		});
	
		return activeEquipment;
	}

	/** SPELLS **/
	
	/** @private */
	_getSpellsList(actor, tokenId) {
		let validSpells = this._filterLongerActions(actor.data.items.filter(i => i.type === 'magia'));
		validSpells = this._filterExpendedItems(validSpells);
		
		// if (actor.data.type === 'character' || !settings.get('showAllNpcItems'))
			// validSpells = this._filterNonpreparedSpells(validSpells);

		let spellsSorted = this._sortSpellsByLevel(validSpells);
		let spells = this._categoriseSpells(actor, tokenId, spellsSorted);
	
		return spells;
	}

	/** @private */
	_sortSpellsByLevel(spells) {
		let result = Object.values(spells);

		result.sort((a,b) => {
			if (a.data.circulo === b.data.circulo)
				return a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {sensitivity: 'base'});
			return a.data.circulo - b.data.circulo;
		});

		return result;
	}
	
	/** @private */
	_categoriseSpells(actor, tokenId, spells) {
		const powers = this.initializeEmptySubcategory();
		const book = this.initializeEmptySubcategory();
		const macroType = 'magia';

		let dispose = spells.reduce(function (dispose, s) {
			let prep = s.data.preparada;
			var level = s.data.circulo;

			var levelName, levelKey;
						
			if (prep) {
				levelKey = prep;
			}
			else {
				levelKey = 'magia' + level;
				levelName = `${this.i18n('tokenactionhud.level')} ${level}`;
			}

			let spell = this._buildItem(tokenId, actor, macroType, s);
			
			// if (settings.get('showSpellInfo'))
				// this._addSpellInfo(s, spell);

			// Initialise subcategory if non-existant.
			let subcategory = book.subcategories.find(cat => cat.name === levelName);

			if (!subcategory) {
				subcategory = this.initializeEmptySubcategory();
				// subcategory.info1 = `${actor.data.data.attributes.pm.value}/${actor.data.data.attributes.pm.max}`;
			}
			
			subcategory.actions.push(spell);

			if (book.subcategories.indexOf(subcategory) < 0)
					this._combineSubcategoryWithCategory(book, levelName, subcategory);
			
			return dispose;
		}.bind(this), {});
	
		let result = this.initializeEmptyCategory('magias');

		let powersTitle = this.i18n('tokenactionhud.powers');
		let booksTitle = this.i18n('tokenactionhud.books');

		this._combineSubcategoryWithCategory(result, powersTitle, powers)
		this._combineSubcategoryWithCategory(result, booksTitle, book)

		return result;
	}

	/** @private */
	_addSpellInfo(s, spell) {
		let c = s.data.duracao;

		spell.info1 = '';
		spell.info2 = '';
		spell.info3 = '';
		if (c?.unidade === "sust")
			spell.info1 += "S";
	}
	
	/** FEATS **/

	/** @private */
	_getFeatsList(actor, tokenId) {
		let validFeats = this._filterLongerActions(actor.data.items.filter(i => i.type == 'poder'));
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
			const activationType = f.data.ativacao.execucao;
			const macroType = 'poder';

			let feat = this._buildEquipmentItem(tokenId, actor, macroType, f);
			
			if (!activationType || activationType === '' || activationType === "Livre") {
				passive.actions.push(feat);
				return;
			} 

			active.actions.push(feat);

			return;
		}.bind(this), {});
	
		let result = this.initializeEmptyCategory('poderes')

		let activeTitle = this.i18n('tokenactionhud.active');
		this._combineSubcategoryWithCategory(result, activeTitle, active);

		// if (!settings.get('ignorePassiveFeats')) {
			let passiveTitle = this.i18n('tokenactionhud.passive');
			this._combineSubcategoryWithCategory(result, passiveTitle, passive);
		// }

		
		return result;
	}

	/** @private */
	_getSkillsList(skills, tokenId) {
		let result = this.initializeEmptyCategory('pericia');
		let macroType = 'pericia';
		
		let abbr = false; //settings.get('abbreviateSkills');
		
		let skillsActions = Object.entries(skills).map(e => {
			try {
					let skillId = e[0];
					let name = abbr ? skillId : game.tormenta20.config.pericias[skillId];
					name = name.charAt(0).toUpperCase() + name.slice(1);
					let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
					let icon = this._getProficiencyIcon(skills[skillId].treinado);
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
		let result = this.initializeEmptyCategory('pericia');
		let macroType = 'pericia';
		
		let abbr = false; //settings.get('abbreviateSkills');
		
		let skillsActions = Object.entries(game.tormenta20.config.pericias).map(e => {
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
		
		let abbr = false; //settings.get('abbreviateSkills');
		
		let actions = Object.entries(game.tormenta20.config.atributos).map(e => {
			if (abilities[e[0]].value === 0)
				return;

			let name = abbr ? e[0] : e[1];
			name = name.charAt(0).toUpperCase() + name.slice(1);
			let encodedValue = [macroType, tokenId, e[0]].join(this.delimiter);
			let icon = '';

			return { name: name, id: e[0], encodedValue: encodedValue, icon: icon }; 
		});
		let abilityCategory = this.initializeEmptySubcategory();
		abilityCategory.actions = actions.filter(a => !!a);

		this._combineSubcategoryWithCategory(result, categoryName, abilityCategory);

		return result;
	}

	_addMultiAbilities(list, tokenId, categoryId, categoryName, macroType) {		
		let cat = this.initializeEmptyCategory(categoryId);
		
		let abbr = false; //settings.get('abbreviateSkills');
		
		let actions = Object.entries(game.tormenta20.config.atributos).map(e => {
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
	_getEffectsList(actor, tokenId) {
		let result = this.initializeEmptyCategory('effects');
		
		this._addEffectsSubcategories(actor, tokenId, result);

		return result;
	}

	/** @private */
	_getConditionsList(actor, tokenId) {
		let result = this.initializeEmptyCategory('conditions');
		this._addConditionsSubcategory(actor, tokenId, result);
		return result;
	}

	/** @private */
	_addEffectsSubcategories(actor, tokenId, category) {
		const macroType = 'effect';

		const effects = actor.effects.entries;

		let tempCategory = this.initializeEmptySubcategory();
		let passiveCategory = this.initializeEmptySubcategory();

		effects.forEach(e => {

			const name = e.data.label;
			const encodedValue = [macroType, tokenId, e.id].join(this.delimiter);
			const cssClass = e.data.disabled ? '' : 'active';
			const image = e.data.icon;
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
			const cssClass = actors.every(actor => actor.effects.entries.some(e => e.data.flags.core?.statusId === c.id)) ? 'active' : '';
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
			const cssClass = actor.effects.entries.some(e => e.data.flags.core?.statusId === c.id) ? 'active' : '';
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
	_buildEquipmentItem(tokenId, actor, macroType, item) {
		let action = this._buildItem(tokenId, actor, macroType, item);
		this._addItemInfo(actor, item, action);
		return action;
	}

	/** @private */
	_buildItem(tokenId, actor, macroType, item) {
		let encodedValue = [macroType, tokenId, item._id].join(this.delimiter);
		let img = this._getImage(item);
		let icon = this._getActionIcon(item.data?.ativacao?.execucao);
		let result = { name: item.name, id: item._id, encodedValue: encodedValue, img: img, icon: icon }

		return result;
	}

	/** @private */
	_addItemInfo(actor, item, action) {
		action.info1 = this._getQuantityData(item);

		action.info2 = "";

		action.info3 = "";
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
		let quantity = item.data.qtd;
		if (quantity > 1) {
			result = quantity;
		}

		return result;
	}

	/** @private */
	_filterLongerActions(items) {
		var result;

		// if (settings.get('hideLongerActions'))
			// result = items.filter(i => !i.data.ativacao);

		return result ? result : items;
	}

	/** @private */
	_filterNonpreparedSpells(spells) {
		let result = spells.filter(i => i.data.preparada);

		return result;
	}

	_filterExpendedItems(items) {
		
		// if (settings.get('showEmptyItems'))
			// return items;

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
			1: '<i class="fas fa-check"></i>'
		};
		return icons[level];
	}
	
	
	_getActionIcon(action) {
		const img = {
			//padrao: `<i class="fas fa-fist-raised"></i>`,
			movimento: `<i class="fas fa-plus"></i>`,
			reacao: `<i class="fas fa-bolt"></i>`,
			livre: `<i class="far fa-circle"></i>`,
			completa: `<i class="fas fa-star"></i>`,
			duasRodadas: `<i class="fas fa-hourglass-start"></i>`,
			verTexto: `<i class="fas fa-book"></i>`
		};
		return img[action];
	}
}