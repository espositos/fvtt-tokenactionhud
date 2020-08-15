import * as settings from '../settings.js';

export class RollHandler {
    preRollHandlers = [];

    constructor() {}

    i18n = (toTranslate) => game.i18n.localize(toTranslate);
    
    getActor(tokenId) {
        return canvas.tokens.placeables.find(t => t.data._id === tokenId)?.actor;
    }
    
    getToken(tokenId) {
        return canvas.tokens.placeables.find(t => t.data._id === tokenId);
    }

    throwInvalidValueErr(err) {
        throw new Error(`Error handling button click: unexpected button value/payload`);
    }

    handleActionEvent(event, encodedValue) {
        settings.Logger.debug(encodedValue);

        let handled = false;
        this.preRollHandlers.forEach(handler => {
            if (handled)
                return;

            handled = handler.prehandleActionEvent(event, encodedValue);
        })

        if (!handled)
            this.doHandleActionEvent(event, encodedValue);
    }

    doHandleActionEvent(event, encodedValue) {}

    addPreRollHandler(handler) {
        this.preRollHandlers.push(handler);
    }
}
