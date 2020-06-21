import { RollHandlerBase5e } from "./base-dnd5e-rolls.js"

export class RollHandlerMinorQol5e extends RollHandlerBase5e {
    constructor() {
        super();
    }

    /** @override */
    rollItemMacro(event, tokenId, itemId) {
        let actor = super.getActor(tokenId);
        let item = actor.getOwnedItem(itemId);

        var versatile;
        if (item.data.data.properties?.ver) {
            versatile = event.originalEvent.button === 2;
        }

        MinorQOL.doCombinedRoll({actor, item, event, versatile});
    }
}