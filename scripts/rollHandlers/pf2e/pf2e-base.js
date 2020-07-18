import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBasePf2e extends RollHandler {
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

        let actor = super.getActor(tokenId);
        let charType;
        if (actor)
            charType = actor.data.type;

        let sharedActions = ['ability', 'spell', 'item', 'skill', 'lore']

        if (!sharedActions.includes(macroType)) {
            switch (charType) {
                case 'npc':
                    this._handleUniqueActionsNpc(macroType, event, actor, actionId);
                    break;
                case 'character':
                    await this._handleUniqueActionsChar(macroType, event, actor, actionId);
                    break;
            }
        }

        switch (macroType) {
            case 'ability':
                this._rollAbility(event, actor, actionId);
                break;
            case 'skill':
                this._rollSkill(event, actor, actionId);
                break;  
            case 'lore':
                this._rollLoreSkill(event, actor, actionId);
                break;
            case 'action':
            case 'feat':
            case 'item':
                this._rollItem(event, actor, actionId);
                break;
            case 'spell':
                this._rollSpell(event, actor, actionId);
        }
    }

    /** @private */
    async _handleUniqueActionsChar(macroType, event, actor, actionId) {
        switch (macroType) {
            case 'save':
                this._rollSaveChar(event, actor, actionId);
                break;
            case 'strike':
                this._rollStrikeChar(event, actor, actionId);
                break;  
            case 'attribute':
                this._rollAttributeChar(event, actor, actionId);
                break;
            case 'spellSlot':
                await this._adjustSpellSlot(event, actor, actionId);
                break;
        }
    }

    /** @private */
    _handleUniqueActionsNpc(macroType, event, actor, actionId) {
        switch (macroType) {
            case 'save':
                this._rollSaveNpc(event, actor, actionId);
                break;
            case 'strike':
                this._rollStrikeNpc(event, actor, actionId);
                break;  
            case 'attribute':
                this._rollAttributeNpc(event, actor, actionId);
                break;
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
    _rollAttributeNpc(event, actor, actionId) {
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
        actor.rollSave(event, actionId);
    }

    /** @private */
    _rollLoreSkill(event, actor, actionId) {
        let item = actor.items.find(i => i._id === actionId);

        actor.rollLoreSkill(event, item);
    }

    /** @private */
    _rollSkill(event, actor, actionId) {
        let skill = actor.data.data.skills[actionId];
        if (!skill) {
            actor.rollSkill(event, actionId);
        }
        else {
            const opts = actor.getRollOptions(['all', 'skill-check', CONFIG.PF2E.skills[actionId] ?? actionId]);
            skill.roll(event);
        }
    }

    /** @private */
    _rollStrikeChar(event, actor, actionId) {
        let actionParts = decodeURIComponent(actionId).split('>');

        let strikeName = actionParts[0];
        let strikeType = actionParts[1];

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
                break;
        }
    }

    /** @private */
    _rollStrikeNpc(event, actor, actionId) {
        let actionParts = decodeURIComponent(actionId).split('>');

        let strikeId = actionParts[0];
        let strikeType = actionParts[1];

        if (strikeId === 'plus') {
            let item = actor.items.find(i => strikeType.toUpperCase().localeCompare(i.name.toUpperCase(), undefined, {sensitivity: 'base'}) === 0);
            item.roll();
            return;
        }

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
        let item = actor.items.find(i => i._id === actionId);
        
        item.roll();
    }

    /** @private */
    _rollSpell(event, actor, actionId) {
        let actionParts = decodeURIComponent(actionId).split('>');

        let spellbookId = actionParts[0];
        let level = actionParts[1];
        let spellId = actionParts[2];
        let expend = actionParts[3] ?? false;

        if (expend) {
            this._expendSpell(actor, spellbookId, level, spellId);
            return;
        }

        let spell = actor.items.find(i => i._id === spellId);

        if (settings.get('printSpellCard')) {
            this._rollHeightenedSpell(actor, spell, level); 
            return;
        }

        let damageRoll = event.originalEvent.button === 2;

        if (damageRoll) {
            if (spell.data.data.damage.value)
                spell.rollSpellDamage(event);
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
}
