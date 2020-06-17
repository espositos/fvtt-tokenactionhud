export class RollHandler {
    getActor(tokenId) {
        return canvas.tokens.placeables.find(t => t.data._id === tokenId).actor;
    }

    }
    handleActionEvent(event, value) {}    
}
