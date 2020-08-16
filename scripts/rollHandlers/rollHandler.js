import * as settings from '../settings.js';

export class RollHandler {
    preRollHandlers = [];

    constructor() {}

    i18n = (toTranslate) => game.i18n.localize(toTranslate);
    
    getActor(tokenId) {
        return canvas.tokens.placeables.find(t => t.data._id === tokenId)?.actor;
    }
    
    getItem(actor, itemId) {
        return actor.getOwnedItem(itemId);
    }
    
    getToken(tokenId) {
        return canvas.tokens.placeables.find(t => t.data._id === tokenId);
    }

    throwInvalidValueErr(err) {
        throw new Error(`Error handling button click: unexpected button value/payload`);
    }

    handleActionEvent(event, encodedValue) {
        settings.Logger.debug(encodedValue);

        this.registerKeyPresses(event);

        let handled = false;
        this.preRollHandlers.forEach(handler => {
            if (handled)
                return;

            handled = handler.prehandleActionEvent(event, encodedValue);
        })

        if (handled)
            return;
            
        this.doHandleActionEvent(event, encodedValue);
    }

    doHandleActionEvent(event, encodedValue) {}

    addPreRollHandler(handler) {
        this.preRollHandlers.push(handler);
    }

    registerKeyPresses(event) {
        this.rightClick = this.isRightClick(event);
        this.ctrl = this.isCtrl(event);
        this.alt = this.isAlt(event);
        this.shift = this.isShift(event);
    }

    doRenderItem(tokenId, itemId) {
         let actor = this.getActor(tokenId);
         let item = this.getItem(actor, itemId);

         item.sheet.render(true);
    }

    isRenderItem() {
        return settings.get('renderItemOnRightClick') && this.rightClick && !(this.alt || this.ctrl || this.shift)
    }

    isRightClick(event) {
        return event?.originalEvent?.button === 2;
    }

    isAlt(event) {
        return event?.altKey;
    }

    isCtrl(event) {
        return keyboard?.isCtrl(event);
    }

    isShift(event) {
        return event?.shiftKey;
    }
}
