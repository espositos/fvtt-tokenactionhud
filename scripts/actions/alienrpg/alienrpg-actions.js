import { ActionHandler } from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerAlienrpg extends ActionHandler {
  constructor(filterManager, categoryManager) {
    super(filterManager, categoryManager);
  }

  /** @override */
  async doBuildActionList(token, multipleTokens) {
    let attributes = {};
    let skills = {};
    let weapons = {};
    let inventory = {};
    let talents = {};
    let agenda = {};
    let consumables = {};
    let power = {};
    let conditions = {};
    let utility = {};
    let attack = {};

    let result = this.initializeEmptyActionList();

    if (multipleTokens) {
      this._buildMultipleTokenList(result);
      return result;
    }

    if (!token) return result;

    let tokenId = token.data._id;
    result.tokenId = tokenId;

    let actor = token.actor;

    if (!actor) return result;

    let legitimateActors = ['character', 'synthetic', 'creature'];
    let actorType = actor.data.type;
    if (!legitimateActors.includes(actorType)) return result;

    result.actorId = actor._id;
    if (actorType === 'character' || actorType === 'synthetic') {
      attributes = this._getAttributes(actor, tokenId);
      skills = this._getSkills(actor, tokenId);
      weapons = this._getWeaponsList(actor, tokenId);
      inventory = this._getItemsList(actor, tokenId);
      talents = this._getTalentsList(actor, tokenId);
      agenda = this._getAgendaList(actor, tokenId);
      consumables = this._getConsumablesList(actor, tokenId);
      power = this._getPowerList(actor, tokenId);
      conditions = this._getConditionsList(actor, tokenId);
      utility = this._getUtilityList(actor, tokenId);
    } else {
      attributes = this._getCreatureAttributes(actor, tokenId);
      attack = this._getAttackList(actor, tokenId);
      utility = this._getUtilityList(actor, tokenId);
    }
    // // console.log('ActionHandlerAlienRPG -> doBuildActionList -> utility', utility);
    switch (actor.data.type) {
      case 'character':
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.attributes'), attributes);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.skills'), skills);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.weapons'), weapons);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.inventory'), inventory);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.talents'), talents);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.settings.alienrpg.agenda'), agenda);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.settings.alienrpg.consumables'), consumables);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.settings.alienrpg.power'), power);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.settings.alienrpg.conditions'), conditions);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.utility'), utility);
        this._setFilterSuggestions(actor);
        if (settings.get('showHudTitle')) result.hudTitle = token.data?.name;
        break;
      case 'synthetic':
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.attributes'), attributes);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.skills'), skills);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.weapons'), weapons);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.inventory'), inventory);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.talents'), talents);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.settings.alienrpg.agenda'), agenda);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.settings.alienrpg.power'), power);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.utility'), utility);
        this._setFilterSuggestions(actor);
        if (settings.get('showHudTitle')) result.hudTitle = token.data?.name;
        break;
      case 'creature':
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.attributes'), attributes);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.attack'), attack);
        this._combineCategoryWithList(result, this.i18n('tokenactionhud.utility'), utility);
        this._setFilterSuggestions(actor);
        if (settings.get('showHudTitle')) result.hudTitle = token.data?.name;
        break;

      default:
        break;
    }

    return result;
  }

  _getWeaponsList(actor, tokenId) {
    let macroType = 'weapon';
    let result = this.initializeEmptyCategory('items');

    let subcategory = this.initializeEmptySubcategory();
    subcategory.actions = this._produceMap(
      tokenId,
      actor.items.filter((i) => i.type == macroType),
      macroType
    );

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.weapons'), subcategory);

    return result;
  }

  _getItemsList(actor, tokenId) {
    let macroType = 'item';
    let result = this.initializeEmptyCategory('items');
    let filter = ['item', 'armor'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this._foundrySort);

    let armourList = items.filter((i) => i.type === 'armor');
    let armourActions = this._buildItemActions(tokenId, 'armor', armourList);
    let armour = this.initializeEmptySubcategory();
    armour.actions = armourActions;

    let itemList = items.filter((i) => i.type === 'item');
    let itemActions = this._buildItemActions(tokenId, macroType, itemList);
    let item = this.initializeEmptySubcategory();
    item.actions = itemActions;

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.armour'), armour);
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.equipment'), item);

    return result;
  }
  _getTalentsList(actor, tokenId) {
    let macroType = 'item';
    let result = this.initializeEmptyCategory('items');
    let filter = ['talent'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this._foundrySort);

    let talentList = items.filter((i) => i.type === 'talent');
    let talentActions = this._buildItemActions(tokenId, macroType, talentList);
    let talent = this.initializeEmptySubcategory();
    talent.actions = talentActions;
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.talents'), talent);

    return result;
  }
  _getAgendaList(actor, tokenId) {
    let macroType = 'item';
    let result = this.initializeEmptyCategory('items');
    let filter = ['agenda'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this._foundrySort);

    let agendaList = items.filter((i) => i.type === 'agenda');
    let agendaActions = this._buildItemActions(tokenId, macroType, agendaList);
    let agenda = this.initializeEmptySubcategory();
    agenda.actions = agendaActions;
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.settings.alienrpg.agenda'), agenda);

    return result;
  }

  _getConsumablesList(actor, tokenId) {
    let result = this.initializeEmptyCategory('consumables');
    let consumables = this.initializeEmptySubcategory();
    let powConsumables = this.initializeEmptySubcategory();
    let macroType = 'consumables';

    let rollableConsumables = Object.entries(actor.data.data.consumables);
    // remove Power from the list
    rollableConsumables.splice(1, 1);
    let consumablesMap = rollableConsumables.map((c) => {
      let name = this.i18n('tokenactionhud.settings.alienrpg.consumables' + c[0]);
      let id = c[0];
      let encodedValue = [macroType, tokenId, id, name].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });
    consumables.actions = this._produceMap(tokenId, consumablesMap, macroType);
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.settings.alienrpg.consumables'), consumables);

    return result;
  }
  _getPowerList(actor, tokenId) {
    let result = this.initializeEmptyCategory('power');
    let power = this.initializeEmptySubcategory();
    let powConsumables = this.initializeEmptySubcategory();
    let macroType = 'power';
    // Power consumables
    let filter = ['item'];
    let items = (actor.items ?? []).filter((a) => filter.includes(a.type)).sort(this._foundrySort);
    let powerList = items.filter((i) => i.data.totalPower > 0);

    let powerMap = powerList.map((c) => {
      let name = c.data.name;
      let id = c.data._id;
      let pencodedValue = [macroType, tokenId, name, id].join(this.delimiter);
      return { name: name, encodedValue: pencodedValue, id: id };
    });
    powConsumables.actions = this._produceMap(tokenId, powerMap, macroType);

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.settings.alienrpg.power'), powConsumables);

    return result;
  }

  /** @private */
  _buildItemActions(tokenId, macroType, itemList, isPassive = false) {
    let result = this._produceMap(tokenId, itemList, macroType, isPassive);

    result.forEach((i) =>
      this._addItemInfo(
        itemList.find((item) => item.data._id === i.id),
        i
      )
    );

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

  _getAttributes(actor, tokenId) {
    let result = this.initializeEmptyCategory('attributes');
    let attributes = this.initializeEmptySubcategory();
    let macroType = 'attribute';

    let rollableAttributes = Object.entries(actor.data.data.attributes);
    let attributesMap = rollableAttributes.map((c) => {
      let name = this.i18n('tokenactionhud.settings.alienrpg.attribute' + c[0]);
      let id = c[0];
      let encodedValue = [macroType, tokenId, id].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });

    attributes.actions = this._produceMap(tokenId, attributesMap, macroType);

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attributes'), attributes);

    return result;
  }

  _getCreatureAttributes(actor, tokenId) {
    let result = this.initializeEmptyCategory('attributes');
    let attributes = this.initializeEmptySubcategory();
    let battributes = this.initializeEmptySubcategory();
    let macroType = 'creatureattribute';

    let rollableAttributes = Object.entries(actor.data.data.attributes);
    let attributesMap = rollableAttributes.map((c) => {
      let name = this.i18n('tokenactionhud.settings.alienrpg.attribute' + c[0]);
      let id = c[0];
      let encodedValue = [macroType, tokenId, id].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });
    let rollableGeneral = Object.entries(actor.data.data.general);
    rollableGeneral.splice(2, 3);

    let generalMap = rollableGeneral.map((c) => {
      let name = this.i18n('tokenactionhud.settings.alienrpg.attribute' + c[0]);
      let id = c[0];
      let encodedValue = [macroType, tokenId, id].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });

    attributes.actions = this._produceMap(tokenId, attributesMap, macroType);
    battributes.actions = this._produceMap(tokenId, generalMap, macroType);

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attributes'), attributes);
    this._combineSubcategoryWithCategory(result, '', battributes);

    return result;
  }

  _getSkills(actor, tokenId) {
    let result = this.initializeEmptyCategory('skills');
    let attributes = this.initializeEmptySubcategory();
    let macroType = 'skill';

    let rollableSkills = Object.entries(actor.data.data.skills);
    let skillMap = rollableSkills.map((c) => {
      let name = this.i18n('tokenactionhud.settings.alienrpg.skill' + c[0]);
      let id = c[0];
      let encodedValue = [macroType, tokenId, id].join(this.delimiter);
      return { name: name, encodedValue: encodedValue, id: id };
    });

    attributes.actions = this._produceMap(tokenId, skillMap, macroType);

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.skills'), attributes);

    return result;
  }

  _buildMultipleTokenList(list) {
    list.tokenId = 'multi';
    list.actorId = 'multi';

    const allowedTypes = ['monster', 'character'];
    let actors = canvas.tokens.controlled.map((t) => t.actor).filter((a) => allowedTypes.includes(a.data.type));

    this._addMultiUtilities(list, list.tokenId, actors);
  }

  _getAttackList(actor, tokenId) {
    let result = this.initializeEmptyCategory('attack');
    let attack = this.initializeEmptySubcategory();
    let macroType = 'attack';

    if (actor.data.type === 'creature') {
      let header = this.initializeEmptySubcategory();

      let creatureAttack = [];
      let cAttackValue = ['creatureAttack', tokenId, 'creatureAttack', ''].join(this.delimiter);
      creatureAttack = { id: 'creatureAttack', name: this.i18n('tokenactionhud.settings.alienrpg.creatureAttack'), encodedValue: cAttackValue };
      header.actions.push(creatureAttack);

      let acidSplash = [];
      let aSplashValue = ['acidSplash', tokenId, 'acidSplash', ''].join(this.delimiter);
      acidSplash = { id: 'acidSplash', name: this.i18n('tokenactionhud.settings.alienrpg.attributeacidSplash'), encodedValue: aSplashValue };
      header.actions.push(acidSplash);
      this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.settings.alienrpg.attributeacidSplash'), header);
    }

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.attack'), attack);

    return result;
  }

  _getUtilityList(actor, tokenId) {
    let result = this.initializeEmptyCategory('utility');
    let utility = this.initializeEmptySubcategory();
    let macroType = 'utility';
    let header = this.initializeEmptySubcategory();
    let headerActions = [];
    let health = 0;
    switch (actor.data.type) {
      case 'character':
        health = actor.data.data.header?.health;
        if (health) headerActions.push(this._getHeaderActions(tokenId, 'health', this.i18n('tokenactionhud.settings.alienrpg.health'), health.value, '10'));
        header.actions = headerActions;

        let stress = actor.data.data.header?.stress;
        if (stress) headerActions.push(this._getHeaderActions(tokenId, 'stress', this.i18n('tokenactionhud.settings.alienrpg.stresspoints'), stress.value, '10'));
        header.actions = headerActions;
        let stressActions = [];
        let stressValue = ['rollStress', tokenId, 'rollStress', ''].join(this.delimiter);
        stressActions = { id: 'rollStress', name: this.i18n('tokenactionhud.settings.alienrpg.rollStress'), encodedValue: stressValue };
        header.actions.push(stressActions);

        let rollCritActions = [];
        let rollCrit = ['rollCrit', tokenId, 'rollCrit', ''].join(this.delimiter);
        rollCritActions = { id: 'rollCrit', name: this.i18n('tokenactionhud.settings.alienrpg.rollCrit'), encodedValue: rollCrit };
        header.actions.push(rollCritActions);

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.settings.alienrpg.health'), header);
        break;

      case 'creature':
        health = actor.data.data.header?.health;
        if (health) headerActions.push(this._getHeaderActions(tokenId, 'health', this.i18n('tokenactionhud.settings.alienrpg.health'), health.value, '10'));
        header.actions = headerActions;
        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.settings.alienrpg.health'), header);
        break;

      case 'synthetic':
        health = actor.data.data.header?.health;
        if (health) headerActions.push(this._getHeaderActions(tokenId, 'health', this.i18n('tokenactionhud.settings.alienrpg.health'), health.value, '10'));
        header.actions = headerActions;

        let rollSynCritActions = [];
        let rollSynCrit = ['rollCrit', tokenId, 'rollCrit', ''].join(this.delimiter);
        rollSynCritActions = { id: 'rollCrit', name: this.i18n('tokenactionhud.settings.alienrpg.rollCrit'), encodedValue: rollSynCrit };
        header.actions.push(rollSynCritActions);

        this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.settings.alienrpg.health'), header);
        if (actor.data.data.header.synthstress) {
          let stressActions = [];
          let stressValue = ['rollStress', tokenId, 'rollStress', 0].join(this.delimiter);
          stressActions = { id: 'rollStress', name: this.i18n('tokenactionhud.settings.alienrpg.rollStress'), encodedValue: stressValue };
          header.actions.push(stressActions);
        }
        break;

      default:
        break;
    }

    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.utility'), utility);

    return result;
  }

  _getConditionsList(actor, tokenId) {
    let result = this.initializeEmptyCategory('conditions');
    let conditions = this.initializeEmptySubcategory();
    let macroType = 'conditions';

    if (actor.data.type === 'character') {
      let general = this.initializeEmptySubcategory();
      let generalActions = [];

      let starvingStateValue = [macroType, tokenId, 'toggleStarving', ''].join(this.delimiter);
      generalActions = { id: 'toggleStarving', encodedValue: starvingStateValue, name: this.i18n('tokenactionhud.settings.alienrpg.starving') };
      generalActions.cssClass = actor.data.data.general.starving.value ? 'active' : '';
      general.actions.push(generalActions);

      let dehydratedStateValue = [macroType, tokenId, 'toggleDehydrated', ''].join(this.delimiter);
      generalActions = { id: 'toggleDehydrated', encodedValue: dehydratedStateValue, name: this.i18n('tokenactionhud.settings.alienrpg.dehydrated') };
      generalActions.cssClass = actor.data.data.general.dehydrated.value ? 'active' : '';
      general.actions.push(generalActions);

      let exhaustedStateValue = [macroType, tokenId, 'toggleExhausted', ''].join(this.delimiter);
      generalActions = { id: 'toggleExhausted', encodedValue: exhaustedStateValue, name: this.i18n('tokenactionhud.settings.alienrpg.exhausted') };
      generalActions.cssClass = actor.data.data.general.exhausted.value ? 'active' : '';
      general.actions.push(generalActions);

      let freezingStateValue = [macroType, tokenId, 'toggleFreezing', ''].join(this.delimiter);
      generalActions = { id: 'toggleFreezing', encodedValue: freezingStateValue, name: this.i18n('tokenactionhud.settings.alienrpg.freezing') };
      generalActions.cssClass = actor.data.data.general.freezing.value ? 'active' : '';
      general.actions.push(generalActions);

      let panicStateValue = [macroType, tokenId, 'togglePanic', ''].join(this.delimiter);
      generalActions = { id: 'togglePanic', encodedValue: panicStateValue, name: this.i18n('tokenactionhud.settings.alienrpg.panic') };
      generalActions.cssClass = actor.data.data.general.panic.value ? 'active' : '';
      general.actions.push(generalActions);

      this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.settings.alienrpg.conditions'), general);
    }
    this._combineSubcategoryWithCategory(result, this.i18n('tokenactionhud.utility'), conditions);

    return result;
  }

  _getHeaderActions(tokenId, macroType, attrName, attrVal, attrMax) {
    let id = attrName.slugify({ replacement: '_', strict: true });
    let labelValue = [macroType, tokenId, id, attrVal].join(this.delimiter);
    let headerActions = { name: attrName, encodedValue: labelValue, id: id };
    headerActions.info1 = `${attrVal}/${attrMax}`;

    return headerActions;
  }

  _addMultiUtilities(list, tokenId, actors) {
    let category = this.initializeEmptyCategory('utility');
    let macroType = 'utility';

    let utility = this.initializeEmptySubcategory();

    // if (actors.every((actor) => actor.data.type === 'character')) {
    //   let shortRestValue = [macroType, tokenId, 'stress', ''].join(this.delimiter);
    //   stress.actions.push({ id: 'stress', encodedValue: shortRestValue, name: this.i18n('tokenactionhud.settings.alienrpg.stresspoints') });
    // }

    this._combineSubcategoryWithCategory(category, this.i18n('tokenactionhud.utility'), utility);
    this._combineCategoryWithList(list, this.i18n('tokenactionhud.utility'), category);
  }

  /** @override */
  _setFilterSuggestions(id, items) {
    let suggestions = items?.map((s) => {
      return { id: s._id, value: s.name };
    });
    if (suggestions?.length > 0) this.filterManager.setSuggestions(id, suggestions);
  }

  _filterElements(categoryId, skills) {
    let filteredNames = this.filterManager.getFilteredNames(categoryId);
    let result = skills.filter((s) => !!s);
    if (filteredNames.length > 0) {
      if (this.filterManager.isBlocklist(categoryId)) {
        result = skills.filter((s) => !filteredNames.includes(s.name));
      } else {
        result = skills.filter((s) => filteredNames.includes(s.name));
      }
    }

    return result;
  }

  _produceMap(tokenId, itemSet, type) {
    return itemSet.map((i) => {
      let encodedValue = [type, tokenId, i.id, i.name.toLowerCase()].join(this.delimiter);
      let img = this._getImage(i);
      let result = { name: i.name, encodedValue: encodedValue, id: i.id, img: img };

      if (type === 'talent') result.info2 = this._getUsesData(i);

      return result;
    });
  }

  _getImage(item) {
    let result = '';
    if (settings.get('showIcons')) result = item.img ?? '';

    return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
  }

  _getUsesData(item) {
    let result = '';

    let uses = item.data.data.uses;
    if (!uses) return result;

    if (!(uses.max || uses.value)) return result;

    result = uses.value ?? 0;

    if (uses.max > 0) {
      result += `/${uses.max}`;
    }

    return result;
  }
  /** @protected */
  _foundrySort(a, b) {
    if (!(a?.data?.sort || b?.data?.sort)) return 0;

    return a.data.sort - b.data.sort;
  }
}
