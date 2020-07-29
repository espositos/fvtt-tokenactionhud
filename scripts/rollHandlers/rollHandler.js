import * as settings from '../settings.js';

export class RollHandler {
    preRollHandlers = [];

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

    handleCompendiums(event, encodedValue) {
        let delimiter = game.tokenActionHUD.actions.delimiter;
        
        let payload = encodedValue.split(delimiter);
        
        if (payload.length != 3)
            return false;
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];
        
        let types = ['compendiumEntry', 'compendiumMacro', 'compendiumPlaylist'];
        if (!types.includes(macroType))
            return false;

        switch (macroType) {
            case 'compendiumEntry':
                this.handleCompendium(macroType, event, tokenId, actionId);
                break;
            case 'compendiumMacro':
                this.handleMacroCompendium(macroType, event, tokenId, actionId);
                break;
            case 'compendiumPlaylist':
                this.handlePlaylistCompendium(macroType, event, tokenId, actionId);
                break;
            default:
                return false;
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
}
