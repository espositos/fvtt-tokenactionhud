import * as settings from '../settings.js';

export class RollHandler {
    preRollHandlers = [];

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

        this.getKeys(event);

        let handled = this.handleCompendiums(event, encodedValue);
        if (handled)
            return;

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

    handleCompendiums(macroType, event, tokenId, actionId) {
        if (!macroType.endsWith('compendium'))
            return false;

        switch (macroType) {
            case 'compendium':
                this.handleCompendium(macroType, event, tokenId, actionId);
                break;
            case 'macros':
                this.handleMacroCompendium(macroType, event, tokenId, actionId);
                break;
        }   

        return true;
    }

    handleCompendium(macroType, event, compendiumKey, entityId) {
        let pack = game.packs.get(compendiumKey);

        pack.getEntity(entityId).then(e => e.sheet.render(true));
    }

    handleMacroCompendium(macroType, event, compendiumKey, entityId) {
        let pack = game.packs.get(compendiumKey);

        pack.getEntity(entityId).then(e => e.execute());
    }

    async handlePlaylistCompendium(macroType, event, compendiumKey, actionId) {
        let pack = game.packs.get(compendiumKey);

        let actionPayload = actionId.split('>');
        let playlistId = actionPayload[0];
        let soundId = actionPayload[1];

        let playlist = await pack.getEntity(playlistId);
        let sound = playlist.sounds.find(s => s._id === soundId);

        AudioHelper.play({src: sound.path}, {})
    }

    getKeys(event) {
        this.rightClick = this.isRightClick(event);
        this.ctrl = this.isCtrl(event);
        this.alt = this.isAlt(event);
        this.shift = this.isShift(event);
    }

    doRenderItem(tokenId, actionId) {
         let actor = this.getActor(tokenId);
         let item = this.getItem(actor);

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
