export class RollHandler {
    getActor(tokenId) {
        return canvas.tokens.placeables.find(t => t.data._id === tokenId)?.actor;
    }

    throwInvalidValueErr(err) {
        throw new Error(`Error handling button click: unexpected button value/payload`);
    }

    handleActionEvent(event, encodedValue) {}

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
}
