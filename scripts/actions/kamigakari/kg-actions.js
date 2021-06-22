import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerKg extends ActionHandler {
    constructor (filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }
	
	/** @override */
	async doBuildActionList(token, multipleTokens) {
		let result = this.initializeEmptyActionList();
		
		if (!token)
			return result;
		let tokenId = token.id;
		result.tokenId = tokenId;
		
		let actor = token.actor;
		if (!actor)
			return result;
		result.actorId = actor.id;
		
		let actorType = actor.data.type;
		if (actorType === "enemy") {
			let attack = this._getAttackOptions(actor, tokenId);
			
			this._combineCategoryWithList(result, this.i18n('tokenactionhud.attack'), attack);
		} else if (actorType === "character") {
			let mainStat = this._getMainStat(actor, tokenId);
			let subStat = this._getSubStat(actor, tokenId);
			let spiritBurn = this._getSpiritBurn(actor, tokenId);
			let talents = this._getTalents(actor, tokenId);
			let items = this._getItems(actor, tokenId);
			
			this._combineCategoryWithList(result, this.i18n('tokenactionhud.kamigakari.mainStats'), mainStat);
			this._combineCategoryWithList(result, this.i18n('tokenactionhud.kamigakari.subStats'), subStat);
			this._combineCategoryWithList(result, this.i18n('tokenactionhud.kamigakari.spiritBurn'), spiritBurn);
			this._combineCategoryWithList(result, this.i18n('tokenactionhud.talents'), talents);
			this._combineCategoryWithList(result, this.i18n('tokenactionhud.kamigakari.items'), items);

		}
		
		return result;
	}
	
	_getAttackOptions(actor, tokenId) {
		let result = this.initializeEmptyCategory('attackOption');
		
		let attack = actor.items.filter(a => a.data.type === "attackOption");
		let attackAction = this._produceMap(tokenId, attack, "attackOption");
		
		let attackCategory = this.initializeEmptySubcategory();
		attackCategory.actions = attackAction;
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attack'), attackCategory);
		
		return result;
	}
	
	_getMainStat(actor, tokenId) {
		let result = this.initializeEmptyCategory('mainStat');
		
		let mainStat = Object.entries(actor.data.data.attributes).filter(a => a[1]?.add !== undefined && a[1]?.base === undefined);
		let mainStatMap = mainStat.map(a => { return { id: a[0], name: a[1].label } });
		let actions = this._produceMap(tokenId, mainStatMap, 'stat');
		let mainStatCategory = this.initializeEmptySubcategory();
		mainStatCategory.actions = actions;
		
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.mainStats'), mainStatCategory);
		
		return result;
	}
	
	_getSubStat(actor, tokenId) {
		let result = this.initializeEmptyCategory('subStat');
		
		let subStat = Object.entries(actor.data.data.attributes).filter(a => a[1]?.add === undefined && a[1]?.label !== undefined);
		let subStatMap = subStat.map(a => { return { id: a[0], name: a[1].label } });
		let actions = this._produceMap(tokenId, subStatMap, 'stat');
		let subStatCategory = this.initializeEmptySubcategory();
		subStatCategory.actions = actions;
		
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.subStats'), subStatCategory);
		
		return result;
	}
	
	_getSpiritBurn(actor, tokenId) {
		let result = this.initializeEmptyCategory('spiritBurn');
		
		let burns = [{id: "transcend", name: this.i18n('tokenactionhud.kamigakari.transcend')},
					{id: "vitalIgnition", name: this.i18n('tokenactionhud.kamigakari.vitalIgnition')},
					{id: "conceptDestruction", name: this.i18n('tokenactionhud.kamigakari.conceptDestruction')}];
		let actions = this._produceMap(tokenId, burns, 'burn');
		let burnCategory = this.initializeEmptySubcategory();
		burnCategory.actions = actions;
		
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.spiritBurn'), burnCategory);
		
		return result;
	}
	
	_getTalents(actor, tokenId) {
		let result = this.initializeEmptyCategory('talent');
		
		let start = this._getTalentsByTiming(actor, tokenId, 'Start');
		let prep = this._getTalentsByTiming(actor, tokenId, 'Prep');
		let attack = this._getTalentsByTiming(actor, tokenId, 'Attack');
		let defense = this._getTalentsByTiming(actor, tokenId, 'Defense');
		let end = this._getTalentsByTiming(actor, tokenId, 'End');
		let constant = this._getTalentsByTiming(actor, tokenId, 'Constant');
		let free = this._getTalentsByTiming(actor, tokenId, 'Free');
		
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.start'), start);
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.prep'), prep);
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.attack'), attack);
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.free'), free);
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.defense'), defense);
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.end'), end);
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.constant'), constant);
		
		return result;
	}
	
	_getTalentsByTiming(actor, tokenId, timing) {
		let talent = actor.items.filter(a => a.data.data.timing === timing);
		let talentAction = this._produceMap(tokenId, talent, "item");
		
		let talentCategory = this.initializeEmptySubcategory();
		talentCategory.actions = talentAction;
	
		return talentCategory;
	}
	
	
	_getItems(actor, tokenId) {
		let result = this.initializeEmptyCategory('item');
		
		let equipment = this._getItemByType(actor, tokenId, 'equipment');
		let sacraments = this._getItemByType(actor, tokenId, 'sacraments');
		let consumables = this._getItemByType(actor, tokenId, 'consumables');
		
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.equipment'), equipment);
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.sacraments'), sacraments);
		this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.kamigakari.consumables'), consumables);
		
		return result;
	}
	
	_getItemByType(actor, tokenId, type) {
		let item = actor.items.filter(a => a.data.data.class === type || a.data.type == type);
		let itemAction = this._produceMap(tokenId, item, "item");
		
		let itemCategory = this.initializeEmptySubcategory();
		itemCategory.actions = itemAction;
	
		return itemCategory;
	}
	
	/** @private */
	_produceMap(tokenId, itemSet, macroType) {
		return itemSet.filter(i => !!i).map(i => {
			let encodedValue = [macroType, tokenId, i.id].join(this.delimiter);
			let item = {name: i.name, encodedValue: encodedValue, id: i.id};
			
			if (macroType == "item" && i.data.data.quantity !== undefined)
				item.name = i.name + " X " + i.data.data.quantity;
			
			return item;
		});
	}
	
}
