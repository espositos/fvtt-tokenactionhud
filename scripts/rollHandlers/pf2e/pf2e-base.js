import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBasePf2e extends RollHandler {
    BLIND_ROLL_MODE = 'blindroll';

    constructor() {
        super();
    }
    
    async doHandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        settings.Logger.debug(encodedValue);
        if (payload.length != 3) {
            super.throwInvalidValueErr();
        }

        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        let renderable = ['item', 'feat', 'action', 'lore', 'ammo'];
        if (renderable.includes(macroType) && this.isRenderItem())
            return this.doRenderItem(tokenId, actionId);

            
        let currentRollMode;
        if (this._isBlindRollClick(event)) {
            currentRollMode = game.settings.get('core', 'rollMode');
            await this._updateRollMode(this.BLIND_ROLL_MODE);
        }

        try {
            const knownCharacters = ['character', 'familiar', 'npc'];
            if (tokenId === 'multi') {
                const controlled = canvas.tokens.controlled.filter(t => knownCharacters.includes(t.actor?.data.type));
                for (let token of controlled) {
                    let idToken = token.data._id;
                    await this._handleMacros(event, macroType, idToken, actionId);
                }
            } else {
                await this._handleMacros(event, macroType, tokenId, actionId);
            }
        } catch (e) {
            throw e;

        } finally {
            if (this._isBlindRollClick(event)) {
                if (currentRollMode) {
                    await this._updateRollMode(currentRollMode);
                }
            }
        }
    }

    async _handleMacros(event, macroType, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let charType;
        if (actor)
            charType = actor.data.type;

        let sharedActions = ['ability', 'spell', 'item', 'skill', 'lore', 'utility', 'toggle', 'strike']
        if (!sharedActions.includes(macroType)) {
            switch (charType) {
                case 'npc':
                    await this._handleUniqueActionsNpc(macroType, event, tokenId, actor, actionId);
                    break;
                case 'character':
                case 'familiar':
                    await this._handleUniqueActionsChar(macroType, event, tokenId, actor, actionId);
                    break;
            }
        }

        switch (macroType) {
            case 'ability':
                this._rollAbility(event, actor, actionId);
                break;
            case 'skill':
                await this._rollSkill(event, actor, actionId);
                break;
            case 'action':
            case 'feat':
            case 'item':
                this._rollItem(event, actor, actionId);
                break;
            case 'spell':
                this._rollSpell(event, tokenId, actor, actionId);
                break;
            case 'utility':
                this._performUtilityMacro(event, tokenId, actionId);
                break;
            case 'toggle':
                await this._performToggleMacro(event, tokenId, actionId);
                break;
            case 'strike':
                this._rollStrikeChar(event, tokenId, actor, actionId);
                break;  
        }
    }

    /** @private */
    _isBlindRollClick(event) {
        return this.isCtrl(event) && !(this.isRightClick(event) || this.isAlt(event) || this.isShift(event));
    }

    /** @private */
    async _handleUniqueActionsChar(macroType, event, tokenId, actor, actionId) {
        switch (macroType) {
            case 'save':
                this._rollSaveChar(event, actor, actionId);
                break;
            case 'attribute':
                this._rollAttributeChar(event, actor, actionId);
                break;
            case 'spellSlot':
                await this._adjustSpellSlot(event, actor, actionId);
                break;
            case 'heroPoint':
                await this._adjustAttribute(event, actor, 'heroPoints', 'rank', actionId);
                break;
            case 'doomed':
            case 'wounded':
            case 'dying':
                await this._adjustAttribute(event, actor, macroType, 'value', actionId);
                break;
            case 'familiarAttack':
                this._rollFamiliarAttack(event, actor);
                break;
        }
    }

    /** @private */
    async _handleUniqueActionsNpc(macroType, event, tokenId, actor, actionId) {
        switch (macroType) {
            case 'save':
                this._rollSaveNpc(event, actor, actionId);
                break;
            case 'npcStrike':
                this._rollStrikeNpc(event, tokenId, actor, actionId);
                break;  
            case 'attribute':
                await this._rollAttributeNpc(event, tokenId, actor, actionId);
                break;
        }
    }

    /** @private */
    _rollSkill(event, actor, actionId) {
        let skill = actor.data.data.skills[actionId];

        if (!skill || !skill.roll) {
            actor.rollSkill(event, actionId);
        }
        else {
            var abilityBased = `${skill.ability}-based`;
            const opts = actor.getRollOptions(['all', 'skill-check', abilityBased, CONFIG.PF2E.skills[actionId] ?? actionId]);
            skill.roll(event, opts);
        }
    }    

    /** @private */
    _rollAbility(event, actor, actionId) {
        actor.rollAbility(event, actionId);
    }

    /** @private */
    _rollAttributeChar(event, actor, actionId) {
        let attribute = actor.data.data.attributes[actionId];
        if (!attribute) {
            actor.rollAttribute(event, actionId);
        }
        else {
            const opts = actor.getRollOptions(['all', attribute]);
            attribute.roll(event, opts);
        }
    }

    /** @private */
    async _rollAttributeNpc(event, tokenId, actor, actionId) {
        if (actionId === 'initiative')
            await actor.rollInitiative({createCombatants:true});
        else
            actor.rollAttribute(event, actionId);
    }

    /** @private */
    _rollSaveChar(event, actor, actionId) {
        let save = actor.data.data.saves[actionId];
        if (!save) {
            actor.rollSave(event, actionId);
        }
        else {
            const opts = actor.getRollOptions(['all', 'saving-throw', save]);
            save.roll(event, opts);
        }
    }

    async _adjustSpellSlot(event, actor, actionId) {
        let actionParts = decodeURIComponent(actionId).split('>');

        let spellbookId = actionParts[0];
        let slot = actionParts[1];
        let effect = actionParts[2];

        let spellbook = actor.getOwnedItem(spellbookId);

        let value, max;
        if (slot === 'focus') {
            value = spellbook.data.data.focus.points;
            max = spellbook.data.data.focus.pool;
        } else {
            let slots = spellbook.data.data.slots;
            value = slots[slot].value;
            max = slots[slot].max;
        }

        switch (effect) {
            case 'slotIncrease':
                if (value >= max)
                    break;
                
                value++;
                break;
            case 'slotDecrease':
                if (value <= 0)
                    break;
                    
                value--;
        }

        let update;
        if (slot === 'focus')
            update = {_id: spellbook._id, data: { focus: {points: value}}};
        else
            update = {_id: spellbook._id, data: {slots: {[slot]: {value: value}}}};

        await actor.updateEmbeddedEntity("OwnedItem", update);
    }

    /** @private */
    _rollSaveNpc(event, actor, actionId) {
        actor.data.data.saves[actionId].roll(event);
    }

    async _updateRollMode(rollMode) {
        await game.settings.set('core', 'rollMode', rollMode);
    }

    /** @private */
    _rollStrikeChar(event, tokenId, actor, actionId) {
        let actionParts = decodeURIComponent(actionId).split('>');

        let strikeName = actionParts[0];
        let strikeType = actionParts[1];

        if (this.isRenderItem()) {
            let item = actor.items.find(i => strikeName.toUpperCase().localeCompare(i.name.toUpperCase(), undefined, {sensitivity: 'base'}) === 0);
            if (item)
                return this.doRenderItem(tokenId, item.data._id);
        }

        let strike = actor.data.data.actions.filter(a => a.type === 'strike').find(s => s.name === strikeName);

        let options;
        switch (strikeType) {
            case 'damage':
                options = actor.getRollOptions(['all', 'damage-roll']);
                strike.damage(event, options);
                break;
            case 'critical':
                options = actor.getRollOptions(['all', 'damage-roll']);
                strike.critical(event, options);
                break;
            default:
                options = actor.getRollOptions(['all', 'attack-roll']);
                strike.variants[strikeType]?.roll(event, options);
                this._consumeAmmo(actor, strike);
                break;
        }
    }

    /** @private */
    _consumeAmmo(actor, strike) {
        if (!strike.selectedAmmoId)
            return;
            
        const ammo = actor.getOwnedItem(strike.selectedAmmoId);

        if (ammo.quantity < 1) {
            ui.notifications.error(game.i18n.localize('PF2E.ErrorMessage.NotEnoughAmmo'));
            return;
        }
            
        ammo.consume();
    }

    /** @private */
    _rollStrikeNpc(event, tokenId, actor, actionId) {
        let actionParts = decodeURIComponent(actionId).split('>');

        let strikeId = actionParts[0];
        let strikeType = actionParts[1];

        if (strikeId === 'plus') {
            let item = actor.items.find(i => strikeType.toUpperCase().localeCompare(i.name.toUpperCase(), undefined, {sensitivity: 'base'}) === 0);
            
            if (this.isRenderItem())
                return this.doRenderItem(tokenId, item._id);

            item.roll();
            return;
        }
        
        if (this.isRenderItem())
            return this.doRenderItem(tokenId, strikeId);

        let strike = actor.getOwnedItem(strikeId);

        switch (strikeType) {
            case 'damage':
                strike.rollNPCDamage(event);
                break;
            case 'critical':
                strike.rollNPCDamage(event, true);
                break;
            case '0':
                strike.rollNPCAttack(event);
                break;
            case '1':            
                strike.rollNPCAttack(event, 2);
                break;
            case '2':
                strike.rollNPCAttack(event, 3);
                break;
        }
    }

    /** @private */
    _rollItem(event, actor, actionId) {
        let item = actor.getOwnedItem(actionId);
        
        item.roll();
    }

    /** @private */
    _rollFamiliarAttack(event, actor) {
        const options = actor.getRollOptions(['all', 'attack']);
        actor.data.data.attack.roll(event, options);
    }

    /** @private */
    _rollSpell(event, tokenId, actor, actionId) {
        let actionParts = decodeURIComponent(actionId).split('>');

        let spellbookId = actionParts[0];
        let level = actionParts[1];
        let spellId = actionParts[2];
        let expend = actionParts[3] ?? false;

        if (expend) {
            this._expendSpell(actor, spellbookId, level, spellId);
            return;
        }

        let printCard = settings.get('printSpellCard');
        if (this.isRenderItem() && printCard)
            return this.doRenderItem(tokenId, spellId);

        let spell = actor.getOwnedItem(spellId);

        if (printCard) {
            this._rollHeightenedSpell(actor, spell, level); 
            return;
        }

        let damageRoll = this.rightClick;

        if (damageRoll) {
            if (spell.data.data.damage.value)
                spell.rollSpellDamage(event);
            else if (this.isRenderItem())
                this.doRenderItem(tokenId, spellId);
            else if (spell.data.data.spellType.value === 'attack') {
                spell.rollSpellAttack(event);
            } else {
                this._rollHeightenedSpell(actor, spell, level); 
            }
        } else {
            if (spell.data.data.spellType.value === 'attack') {
                spell.rollSpellAttack(event);
            } else if (spell.data.data.damage.value) {
                spell.rollSpellDamage(event);
            } else {
                this._rollHeightenedSpell(actor, spell, level); 
            }
        }
    }
    
    _expendSpell(actor, spellbookId, level, spellId) {    
        let spellbook = actor.getOwnedItem(spellbookId);
        let spellSlot = Object.entries(spellbook.data.data.slots[`slot${level}`].prepared)
            .find(s => s[1].id === spellId && (s[1].expended === false || !s[1].expended))[0];

        if (spellSlot === -1)
            return;

        const key = `data.slots.slot${level}.prepared.${spellSlot}`;
        const options = {
          _id: spellbookId,
        };
        options[key] = {
          expended: true,
        };
        actor.updateEmbeddedEntity('OwnedItem', options);
    }

    async _rollHeightenedSpell(actor, item, spellLevel) {

        let data = item.getChatData();
        let token = canvas.tokens.placeables.find(p => p.actor?._id === actor._id);
        let castLevel = parseInt(spellLevel);
        if (item.data.data.level.value < castLevel) {
            data.properties.push(`Heightened: +${castLevel - item.data.data.level.value}`);
            if (!item.data.hasOwnProperty('contextualData'))
                item.data.contextualData = {};
            item.data.contextualData.spellLvl = castLevel;
            data.spellLvl = castLevel;
        }

        const template = `systems/pf2e/templates/chat/${item.data.type}-card.html`;
        const templateData = {
            actor: actor,
            tokenId: token ? `${token.scene._id}.${token.id}` : null,
            item: item.data,
            data: data,
          };
      
          // Basic chat message data
          const chatData = {
            user: game.user._id,
            speaker: {
              actor: actor._id,
              token: actor.token,
              alias: actor.name,
            },
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
          };
      
          // Toggle default roll mode
          const rollMode = game.settings.get('core', 'rollMode');
          if (['gmroll', 'blindroll'].includes(rollMode)) chatData.whisper = ChatMessage.getWhisperRecipients('GM').map(u => u._id);
          if (rollMode === 'blindroll') chatData.blind = true;
      
          // Render the template
          chatData.content = await renderTemplate(template, templateData);
      
          // Create the chat message
          return ChatMessage.create(chatData, { displaySheet: false });
    }

    _performUtilityMacro(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let token = super.getToken(tokenId);

        switch(actionId) {
            case 'treatWounds':
                this._executeMacroByName('Treat Wounds');
                break;
            case 'longRest':
                this._executeMacroByName('Rest for the Night');
                break;
            case 'takeABreather':
                this._executeMacroByName('Take a Breather');
                break;
            case 'toggleCombat':
                token.toggleCombat();
                Hooks.callAll('forceUpdateTokenActionHUD')
                break;
            case 'toggleVisibility':
                token.toggleVisibility();
                break;
        }
    }

    async _executeMacroByName(name) {
        let pack = game.packs.get('pf2e.pf2e-macros');
        pack.getIndex().then(index => {
            let id = index.find(e => e.name === name)?._id;

            if (id)
                pack.getEntity(id).then(e => e.execute()
        )});
    }

    async _adjustAttribute(event, actor, property, valueName, actionId) {
        let value = actor.data.data.attributes[property][valueName];
        let max = actor.data.data.attributes[property]['max'];

        if (this.rightClick){
            if (value <= 0)
                return;
            value--;
        } else {
            if (value >= max)
                return;    
            value++;
        }

        let update = {data: {attributes: {[property]: {[valueName]: value}}}};

        await actor.update(update);
    }

    async _performToggleMacro(event, tokenId, actionId) {
        const actor = super.getActor(tokenId);

        const input = actionId.split('.');

        if (input?.length !== 2)
            return;

        const rollName = input[0];
        const optionName = input[1];

        await actor.toggleRollOption(rollName, optionName);
    }
}
