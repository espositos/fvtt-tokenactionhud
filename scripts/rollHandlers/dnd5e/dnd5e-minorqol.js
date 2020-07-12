import { RollHandlerBase5e } from "./dnd5e-base.js"

export class RollHandlerMinorQol5e extends RollHandlerBase5e {
    constructor() {
        super();
    }

    /** @override */
    rollItemMacro(event, tokenId, itemId) {
        let actor = super.getActor(tokenId);
        let item = actor.getOwnedItem(itemId);

        if (this.needsRecharge(item)) {
            item.rollRecharge();
            return;
        }

        var versatile;
        if (item.data.data.properties?.ver) {
            versatile = event.originalEvent.button === 2;
        }

        MinorQOL.doCombinedRoll({actor, item, event, versatile});
    }
}