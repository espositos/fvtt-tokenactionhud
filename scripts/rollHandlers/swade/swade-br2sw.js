import { RollHandler } from "../rollHandler.js";

export class RollHandlerBR2SWSwade extends RollHandler {
    constructor() {
        super();
    }

    /** @override */
    async doHandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        
        if (payload.length != 3) {
            super.throwInvalidValueErr();
        }
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        let actor = super.getActor(tokenId);

        let hasSheet = ['item']
        if (this.isRenderItem() && hasSheet.includes(macroType))
            return this.doRenderItem(tokenId, actionId);

        switch (macroType) {
            case 'item':
                this._rollItem(event, actor, actionId, tokenId);
                break;
            case 'status':
                await this._toggleStatus(event, actor, actionId, tokenId);
                break;
            case 'benny':
                this._adjustBennies(event, actor, actionId);
                break;
            case 'gmBenny':
                await this._adjustGmBennies(event, actor, actionId);
                break;
            case 'attribute':
                this._rollAttribute(event, actor, actionId, tokenId);
                break;
            case 'skill':
                this._rollSkill(event, actor, actionId, tokenId);
                break;
            case 'wounds':
            case 'fatigue':
            case 'powerPoints':
                await this._adjustAttributes(event, actor, macroType, actionId);
                break;            
        }
    }

    /** @private */
    _rollItem(event, actor, actionId, tokenId) {
        //const item = super.getItem(actor, actionId);
        //item.show();
        let behavior;
        if (event.ctrlKey === true) {
            behavior = game.settings.get('betterrolls-swade2', 'ctrl_click');
        } else if (event.altKey === true) {
            behavior = game.settings.get('betterrolls-swade2', 'alt_click');
        } else if (event.shiftKey === true) {
            behavior = game.settings.get('betterrolls-swade2', 'shift_click');
        } else {
            behavior = game.settings.get('betterrolls-swade2', 'click');
        }
        if (behavior === 'trait') {
            game.brsw.create_item_card_from_id(tokenId, actor.id, actionId).then(message => {game.brsw.roll_item(message, "", false)});
        } else if (behavior === 'trait_damage') {
            game.brsw.create_item_card_from_id(tokenId, actor.id, actionId).then(message => {game.brsw.roll_item(message, "", false, true)});
        } else if (behavior === 'system') {
            game.swade.rollItemMacro(actor.items.get(actionId).name);
        } else {
            game.brsw.create_item_card_from_id(tokenId, actor.id, actionId);
        }
    }

    /** @private */
    async _toggleStatus(event, actor, actionId, tokenId) {
        const update = {data: {status: {}}};

        const status = 'is' + actionId.charAt(0).toUpperCase() + actionId.slice(1);
        const existingOnSheet = actor.data.data.status[status];
        update.data.status[status] = !actor.data.data.status[status];

        await actor.update(update);
        // SWADE system will eventually set the active effect on the token, this future-proofs it so duplicate effects don't occur
        setTimeout(() => {
            const existingOnToken = actor.effects.find(e => e.getFlag("core", "statusId") === actionId);

            if (!existingOnToken == !existingOnSheet) {
                const effect = CONFIG.SWADE.statusEffects.find(e=>e.id===actionId);
                effect["flags.core.statusId"] = actionId;
                canvas.tokens.get(tokenId).toggleEffect(effect);
            }
        }, 10);
    }

    /** @private */
    _adjustBennies(event, actor, actionId) {
        if (actionId === 'spend') {
            actor.spendBenny();
            this._showDiceBenny();
        }

        if (actionId === 'get')
            actor.getBenny();
    }

    /** @private */
    async _adjustGmBennies(event, actor, actionId) {
        let user = game.user;
        if(!user.isGM)
            return;

        const benniesValue = user.getFlag('swade', 'bennies');
        if (actionId === 'spend') {
            if (benniesValue == 0)
                return;

            if (game.settings.get('swade', 'notifyBennies')) {
                await this._createGmSpendMessage(user);
                this._showDiceBenny();
            }

            await user.setFlag('swade', 'bennies', benniesValue - 1);
        }

        if (actionId === 'get') {
            await user.setFlag('swade', 'bennies', benniesValue+1);
            if (game.settings.get('swade', 'notifyBennies')) {
               await this._createGmGetMessage(user);
            }
            ui['players'].render(true);
        }

        Hooks.callAll('forceUpdateTokenActionHUD');
    }

    async _createGmSpendMessage(user) {
        let message = await renderTemplate(CONFIG.SWADE.bennies.templates.spend, {
            target: user,
            speaker: user,
        });

        let chatData = {
            content: message,
        };
        ChatMessage.create(chatData);
    }

    async _createGmGetMessage(user) {
        let message = await renderTemplate(CONFIG.SWADE.bennies.templates.gmadd, {
            target: user,
            speaker: user,
        });

        let chatData = {
            content: message,
        };
        
        ChatMessage.create(chatData);
    }

    _showDiceBenny() {
        if (game.dice3d) {
            const benny = new Roll('1dB').roll();
            game.dice3d.showForRoll(benny, game.user, true, null, false);
        }
    }

    /** @private */
    _rollAttribute(event, actor, actionId, tokenId) {
        //actor.rollAttribute(actionId, {event: event});
        let behavior;
        if (event.ctrlKey === true) {
            behavior = game.settings.get('betterrolls-swade2', 'ctrl_click');
        } else if (event.altKey === true) {
            behavior = game.settings.get('betterrolls-swade2', 'alt_click');
        } else if (event.shiftKey === true) {
            behavior = game.settings.get('betterrolls-swade2', 'shift_click');
        } else {
            behavior = game.settings.get('betterrolls-swade2', 'click');
        }
        if (behavior === 'trait' || behavior === 'trait_damage') {
            game.brsw.create_attribute_card_from_id(tokenId, actor.id, actionId).then(message => {game.brsw.roll_attribute(message, "", false)});
        } else if (behavior === 'system') {
            actor.rollAttribute(actionId);
        } else {
            game.brsw.create_attribute_card_from_id(tokenId, actor.id, actionId);
        }
    }

    /** @private */
    _rollSkill(event, actor, actionId, tokenId) {
        //actor.rollSkill(actionId, {event: event});
        let behavior;
        if (event.ctrlKey === true) {
            behavior = game.settings.get('betterrolls-swade2', 'ctrl_click');
        } else if (event.altKey === true) {
            behavior = game.settings.get('betterrolls-swade2', 'alt_click');
        } else if (event.shiftKey === true) {
            behavior = game.settings.get('betterrolls-swade2', 'shift_click');
        } else {
            behavior = game.settings.get('betterrolls-swade2', 'click');
        }
        if (behavior === 'trait' || behavior === 'trait_damage') {
            game.brsw.create_skill_card_from_id(tokenId, actor.id, actionId).then(message => {game.brsw.roll_skill(message, "", false)});
        } else if (behavior === 'system') {
            game.swade.rollItemMacro(actor.items.get(actionId).name);
        } else {
            game.brsw.create_skill_card_from_id(tokenId, actor.id, actionId);
        }
    }

    /** @private */
    async _adjustAttributes(event, actor, macroType, actionId) {
        let attribute = actor.data.data[macroType];

        if (!attribute)
            return;

        const curValue = attribute.value;
        const max = attribute.max;
        const min = attribute.min ?? 0;

        let value;
        switch (actionId) {
            case 'increase':
                value = Math.clamped(curValue+1, min, max);
                break;
            case 'decrease':
                value = Math.clamped(curValue-1, min, max);
                break;
        }

        let update = {data: {}};

        update.data[macroType] = {value: value};

        await actor.update(update);
    }
}
