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

        let rightClick = event.originalEvent.button === 2;
        let ctrlKey = keyboard.isCtrl(event);
        let altKey = event.altKey;
        if (rightClick && ctrlKey) {
            item.rollAttack();
            return;
        }
        if (rightClick && altKey) {
            item.rollDamage();
            return;
        }

        var versatile;
        if (item.data.data.properties?.ver) {
            versatile = rightClick;
        }

        MinorQOL.doCombinedRoll({actor, item, event, versatile});
    }
}