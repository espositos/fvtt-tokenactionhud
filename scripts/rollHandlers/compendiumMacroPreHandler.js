
import { PreRollHandler } from './preRollHandler.js';

export class CompendiumMacroPreHandler extends PreRollHandler {
    constructor() {super();}

    /** @override */
    prehandleActionEvent(event, encodedValue) {
        let delimiter = game.tokenActionHUD.actions.delimiter;
        
        let payload = encodedValue.split(delimiter);
        
        if (payload.length != 3)
            return false;
        
        let macroType = payload[0];
        let key = payload[1];
        let actionId = payload[2];
        
        let types = ['compendiumEntry', 'compendiumMacro', 'compendiumPlaylist', 'macro'];
        if (!types.includes(macroType))
            return false;

        switch (macroType) {
            case 'compendiumEntry':
                this.handleCompendium(macroType, event, key, actionId);
                break;
            case 'compendiumMacro':
                this.handleMacroCompendium(macroType, event, key, actionId);
                break;
            case 'compendiumPlaylist':
                this.handlePlaylistCompendium(macroType, event, key, actionId);
                break;
            case 'macro':
                this.handleMacro(macroType, event, key, actionId);
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

    handleMacro(macroType, event, tokenId, actionId) {
        game.macros.find(i => i.data._id === actionId).execute();
    }
}