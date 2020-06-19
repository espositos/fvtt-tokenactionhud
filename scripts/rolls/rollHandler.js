export class RollHandler {
    getActor(tokenId) {
        return canvas.tokens.placeables.find(t => t.data._id === tokenId).actor;
    }

    throwInvalidValueErr() {
        throw new Error("invalid button value received.");
    }

    handleActionEvent(event, encodedValue) {}    
}
