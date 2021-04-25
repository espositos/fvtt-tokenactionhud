import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBaseAlienrpg extends RollHandler {
  constructor() {
    super();
  }

  async doHandleActionEvent(event, encodedValue) {
    let payload = encodedValue.split('|');
    if (payload.length != 4) {
      super.throwInvalidValueErr();
    }

    let macroType = payload[0];
    let tokenId = payload[1];
    let actionId = payload[2];
    let attributename = payload[3];
    let actor = super.getActor(tokenId);
    let charType;
    if (actor) charType = actor.data.type;
    let item = actionId ? actor.getOwnedItem(actionId) : null;

    let renderable = ['item', 'armor'];
    if (renderable.includes(macroType) && this.isRenderItem()) return this.doRenderItem(tokenId, actionId);

    if (tokenId === 'multi') {
      if (macroType === 'utility' && actionId.includes('toggle')) {
        this.performMultiToggleUtilityMacro(actionId);
      } else {
        canvas.tokens.controlled.forEach((t) => {
          let idToken = t.data._id;
          this._handleMacros(event, macroType, idToken, actionId, attributename);
        });
      }
    } else {
      let sharedActions = ['utility'];

      if (!sharedActions.includes(macroType)) {
        switch (charType) {
          case 'character':
          case 'creature':
          case 'synthetic':
            await this._handleUniqueActionsChar(macroType, event, tokenId, actor, actionId);
            break;
        }
      }
      let rData = [];
      switch (macroType) {
        case 'attribute':
          rData = { roll: actor.data.data.attributes[actionId].value, label: actor.data.data.attributes[actionId].label };
          if (event.type === 'click') {
            actor.rollAbility(actor, rData);
          } else {
            actor.rollAbilityMod(actor, rData);
          }
          break;
        case 'creatureattribute':
          switch (actionId) {
            case 'mobility':
            case 'observation':
              rData = { roll: actor.data.data.general[actionId].value, label: actor.data.data.general[actionId].label };
              break;
            default:
              let clabel = attributename[0].toUpperCase() + attributename.substring(1);
              rData = { roll: actor.data.data.attributes[actionId].value, label: [clabel] };
              break;
          }
          if (event.type === 'click') {
            actor.rollAbility(actor, rData);
          } else {
            actor.rollAbilityMod(actor, rData);
          }
          break;
        case 'skill':
          rData = { roll: actor.data.data.skills[actionId].mod, label: actor.data.data.skills[actionId].label };
          if (event.type === 'click') {
            actor.rollAbility(actor, rData);
          } else {
            actor.rollAbilityMod(actor, rData);
          }
          break;
        case 'weapon':
          if (event.type === 'click') {
            actor.nowRollItem(item);
          } else {
            actor.rollItemMod(item);
          }
          break;
        case 'item':
          this._rollItem(actor, tokenId, actionId, macroType);
          break;
        case 'armor':
          rData = { roll: actor.data.data.general.armor.value, spbutt: 'armor' };
          actor.rollAbility(actor, rData);
          break;
        case 'consumables':
          const lTemp = 'ALIENRPG.' + (attributename[0].toUpperCase() + attributename.substring(1));
          const label = game.i18n.localize(lTemp) + ' ' + game.i18n.localize('ALIENRPG.Supply');
          actor.consumablesCheck(actor, actionId, label);
          break;
        case 'power':
          const pTemp = 'ALIENRPG.' + (macroType[0].toUpperCase() + macroType.substring(1));
          const plabel = game.i18n.localize(pTemp) + ' ' + game.i18n.localize('ALIENRPG.Supply');
          actor.consumablesCheck(actor, macroType, plabel, actionId);
          break;
        case 'conditions':
          this.performConditionMacro(event, tokenId, actionId);
          break;

        case 'utility':
          this.performUtilityMacro(event, tokenId, actionId);
        default:
          break;
      }
    }
  }

  /** @private */
  async _handleUniqueActionsChar(macroType, event, tokenId, actor, actionId) {
    let rData = 0;
    switch (macroType) {
      case 'stress':
        await this._adjustAttribute(event, actor, 'stress', 'value', actionId);
        break;
      case 'rollStress':
        if (actor.data.type === 'character') {
          rData = { panicroll: actor.data.data.header.stress };
        } else {
          rData = { panicroll: { value: 0, label: 'Stress' } };
        }
        if (event.type === 'click') {
          actor.rollAbility(actor, rData);
        } else {
          actor.rollAbilityMod(actor, rData);
        }
        break;
      case 'health':
        await this._adjustAttribute(event, actor, 'health', 'value', actionId);
        break;
      case 'creatureAttack':
        let rAttData = { atttype: actor.data.data.rTables };
        actor.creatureAttackRoll(actor, rAttData);
        break;
      case 'acidSplash':
        let aSplashData = { roll: actor.data.data.general.acidSplash.value, label: actor.data.data.general.acidSplash.label };
        actor.creatureAcidRoll(actor, aSplashData);
        break;
      case 'rollCrit':
        actor.rollCrit(actor.data.type);
        break;
    }
  }

  async _adjustAttribute(event, actor, property, valueName, actionId) {
    let value = actor.data.data.header[property][valueName];
    let max = '10';

    if (this.rightClick) {
      if (value <= 0) return;
      value--;
    } else {
      if (value >= max) return;
      value++;
    }

    let update = { data: { header: { [property]: { [valueName]: value } } } };

    await actor.update(update);
  }

  async togggleConditionState(event, actor, property, valueName, actionId) {
    let value = actor.data.data.general[property][valueName];
    let max = '1';

    if (this.rightClick) {
      if (value <= 0) return;
      value--;
      if (property === 'panic') {
        actor.checkAndEndPanic(actor);
      }
    } else {
      if (value >= max) return;
      value++;
      if (property === 'panic') {
        actor.checkAndEndPanic(actor);
      }
    }

    let update = { data: { general: { [property]: { [valueName]: value } } } };
    await actor.update(update);
  }

  performUtilityMacro(event, tokenId, actionId) {
    let actor = super.getActor(tokenId);
    let token = super.getToken(tokenId);

    switch (actionId) {
      case 'toggleVisibility':
        token.toggleVisibility();
        break;
      case 'toggleCombat':
        token.toggleCombat();
        Hooks.callAll('forceUpdateTokenActionHUD');
        break;
    }
  }

  async performMultiToggleUtilityMacro(actionId) {
    if (actionId === 'toggleVisibility') {
      const allVisible = canvas.tokens.controlled.every((t) => !t.data.hidden);
      canvas.tokens.controlled.forEach((t) => {
        if (allVisible) t.toggleVisibility();
        else if (t.data.hidden) t.toggleVisibility();
      });
    }

    if (actionId === 'toggleCombat') {
      const allInCombat = canvas.tokens.controlled.every((t) => t.data.inCombat);
      for (let t of canvas.tokens.controlled) {
        if (allInCombat) await t.toggleCombat();
        else if (!t.data.inCombat) await t.toggleCombat();
      }
      Hooks.callAll('forceUpdateTokenActionHUD');
    }
  }

  performConditionMacro(event, tokenId, actionId) {
    let actor = super.getActor(tokenId);
    let token = super.getToken(tokenId);

    switch (actionId) {
      case 'toggleStarving':
        this.togggleConditionState(event, actor, 'starving', 'value');
        break;
      case 'toggleDehydrated':
        this.togggleConditionState(event, actor, 'dehydrated', 'value');
        break;
      case 'toggleExhausted':
        this.togggleConditionState(event, actor, 'exhausted', 'value');
        break;
      case 'toggleFreezing':
        this.togggleConditionState(event, actor, 'freezing', 'value');
        break;
      case 'togglePanic':
        this.togggleConditionState(event, actor, 'panic', 'value');
        break;
    }
  }

  /** @private */
  _rollItem(actor, tokenId, actionId, macroType) {
    let item = actor.getOwnedItem(actionId);
    let renderable = ['item'];
    if (renderable.includes(macroType)) {
      return this.doRenderItem(tokenId, actionId);
    } else {
      console.warn('armor roll');
    }
  }
}
