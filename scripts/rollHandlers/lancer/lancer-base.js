import { RollHandler } from "../rollHandler.js";

export class RollHandlerBaseLancer extends RollHandler {
    constructor() {
        super();
    }

    /** @override */
    doHandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        
        if (payload.length != 3 && payload.length != 4) {
            super.throwInvalidValueErr();
        }
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];
        let option = JSON.parse(payload[3]);

        let actor = super.getActor(tokenId);

        let hasSheet = ['item']
        if (this.isRenderItem() && hasSheet.includes(macroType))
            return this.doRenderItem(tokenId, actionId);

        switch (macroType) {
            case "hase":
                this._rollHaseMacro(actor, actionId);
                break;
            case "stat":
                this._rollStatMacro(actor, actionId);
                break;
            case "item":
                this._rollWeaponOrFeatureMacro(actor, actionId, option);
                break;
            case "coreActive":
                this._rollCoreActiveMacro(actor);
                break;
            case "corePassive":
                this._rollCorePassiveMacro(actor);
                break;
        }
    }

    _rollHaseMacro(actor, action) {
        game.lancer.prepareStatMacro(actor._id, `data.mech.${action}`);
    }

    _rollStatMacro(actor, action) {
        game.lancer.prepareStatMacro(actor._id, `data.${action}`);
    }

    _rollWeaponOrFeatureMacro(actor, itemId, option) {
        game.lancer.prepareItemMacro(actor._id, itemId, option);
    }

    _rollCoreActiveMacro(actor) {
        game.lancer.prepareCoreActiveMacro(actor._id);
    }

    _rollCorePassiveMacro(actor) {
        game.lancer.prepareCorePassiveMacro(actor._id);
    }
}