import * as checkLists from './checks-dnd5e.js';
import {ActionHandler} from './actionHandler.js';

export class ActionHandler5e extends ActionHandler {
    constructor (macros5e) {
        super(macros5e);
        this.macros = macros5e;
    }

    /** @override */
    handleButtonClick(event, value) {
        let payload = value.split('.');

        if (payload.length != 3)
            return;

        let macroType = payload[0];
        let actorId = payload[1];
        let actionId = payload[2];

        switch (macroType) {
            case "ability":
                this.macros.rollAbilityMacro(event, actorId, actionId);
                break;
            case "skill":
                this.macros.rollSkillMacro(event, actorId, actionId);
                break;
            case "item":
            case "spell":
            case "feat":
                this.macros.rollItemMacro(event, actorId, actionId);
                break;
            default:
                break;
        }
    }

    /** @override */
    buildActionList(targetActor) {
        let result = { "actorId": "", "categories": {}};

        if (targetActor === null || targetActor === undefined) {
            return result;
        }

        result.actorId = targetActor._id;
        
        let items = this._getItemList(targetActor);
        let spells = this._getSpellsList(targetActor);
        let feats = this._getFeatsList(targetActor);
        let checks = checkLists.buildChecksList(targetActor);
    
        if (Object.keys(items.subcategories).length > 0)
            result.categories["items"] = items;
    
        if (Object.keys(spells.subcategories).length > 0)
            result.categories["spells"] = spells;
    
        if (Object.keys(feats.subcategories).length > 0)
            result.categories["feats"] = feats;
    
        for (let [k, v] of Object.entries(checks)) {
            if (Object.keys(checks[k].subcategories).length > 0 && !result.categories.hasOwnProperty(k))
                result.categories[k] = v;
        }
       
        return result;
    }
    
    /** ITEMS **/
    
    /** @private */
    _getItemList(targetActor) {
        let equipped = targetActor.data.items.filter(i => i.type !="consumable" && i.data.equipped);
        let activeEquipped = this._getActiveEquipment(equipped);
        const macroType = "item";

        let weaponActions = activeEquipped.filter(i => i.type == "weapon")
            .map(w => { return { "name": w.name, "id": w._id, "encodedValue": `${macroType}.${targetActor._id}.${w._id}`}; });
    
        let equipmentActions = activeEquipped.filter(i => i.type == "equipment")
            .map(e => { return { "name": e.name, "id": e._id, "encodedValue": `${macroType}.${targetActor._id}.${e._id}` }; });
        
        let otherActions = activeEquipped.filter(i => i.type != "weapon" && i.type != "equipment")
            .map(o => { return { "name": o.name, "id": o._id, "encodedValue": `${macroType}.${targetActor._id}.${o._id}`}; });
    
        let consumables = targetActor.data.items.filter(i => i.type == "consumable");
        
        let consumablesChargedActions = consumables.filter(c => (c.data.uses != null && c.data.uses.value != 0))
            .map(c => { return { "name": c.name, "id": c._id, "encodedValue": `${macroType}.${targetActor._id}.${c._id}` }; });
            
        let consumablesNoChargeActions = consumables.filter(c => c.data.uses.value == null)
            .map(c => { return { "name": c.name, "id": c._id, "encodedValue": `${macroType}.${targetActor._id}.${c._id}` }; });
        
        let items = {
            "idAction": "tokenBarShowItems",
            "subcategories": {}
        }
            
        if (weaponActions.length > 0)
            items.subcategories["weapons"] = {"actions": weaponActions };
    
        if (equipmentActions.length > 0)
            items.subcategories["equipment"] = {"actions": equipmentActions };
        
        if (otherActions.length > 0)
            items.subcategories["other"] = {"actions": otherActions };
        
        if (consumablesChargedActions.length > 0)
            items.subcategories["charged consumables"] = {"actions": consumablesChargedActions };
        
        if (consumablesNoChargeActions.length > 0)
            items.subcategories["consumables without charges"] = {"actions": consumablesNoChargeActions };
        
        return items;
    }

    /** @private */
    _getActiveEquipment(equipment) {
        const activationTypes = Object.entries(game.dnd5e.config.abilityActivationTypes);
    
        let activeEquipment = equipment.filter(e => {
            if (e.data.activation == undefined)
                return false;
    
            for (let [key, value] of activationTypes) {
                if (e.data.activation.type == key)
                    return true;
            }
            
            return false;
        });
    
        return activeEquipment;
    }
    
    /** @private */
    _getSpellsList(targetActor) {
        let preparedSpells = targetActor.data.items.filter(i => i.type == "spell" && i.data.preparation.prepared);
        let spells = this._categoriseSpells(targetActor, preparedSpells);
    
        return spells;
    }
    
    /** SPELLS **/
    /** @private */
    _categoriseSpells(targetActor, spells) {
        const powers = { "hasSubcategories": true, "subcategories": {} };
        const book = { "hasSubcategories": true, "subcategories": {} };
        const macroType = "spell";

        let dispose = spells.reduce(function (dispose, spell) {
            var level = spell.data.level;
            let prep = spell.data.preparation.mode;
    
            const prepTypes = game.dnd5e.config.spellPreparationModes;
            let prepType = prepTypes[prep];
    
            if (prep == "pact" || prep == "atwill" || prep == "innate") {
                if (!powers.subcategories.hasOwnProperty(prepType)) {
                    powers.subcategories[prepTypes[prep]] = { "actions": []};
                }
    
                powers.subcategories[prepType].actions.push({ "name": spell.name, "id": spell._id, "encodedValue": `${macroType}.${targetActor._id}.${spell._id}` });
            } else {
                let levelText = "Level " + level;
                
                if (level == 0)
                    levelText = "Cantrips";

                if (!book.subcategories.hasOwnProperty(levelText)) {
                    book.subcategories[levelText] = { "actions": []};
                }
    
                book.subcategories[levelText].actions.push({ "name": spell.name, "id": spell._id, "encodedValue": `${macroType}.${targetActor._id}.${spell._id}` });
            }
    
            return dispose;
        }, {});
    
        let result = {
            "idAction": "tokenBarShowSpells",
            "subcategories": {}
        }
        
        if (Object.keys(powers.subcategories).length > 0)
            result.subcategories["powers"] = powers;
    
        if (Object.keys(book.subcategories).length > 0)
            result.subcategories["books"] = book;      
        
        return result;
    }
    
    /** FEATS **/

    /** @private */
    _getFeatsList(targetActor) {
        let allFeats = targetActor.data.items.filter(i => i.type == "feat");
        let feats = this._categoriseFeats(targetActor, allFeats);
    
        return feats;
    }
    
    /** @private */
    _categoriseFeats(targetActor, feats) {
        let active = { "actions": []};
        let passive = { "actions": []};
        let lair = { "actions": []};
        let legendary = { "actions": []};
    
        let dispose = feats.reduce(function (dispose, f) {
            const activationTypes = game.dnd5e.config.abilityActivationTypes;
            const activationType = f.data.activation.type;
            const macroType = "feat";
            
            if (activationType == null)
                passive.actions.push({ "name": f.name, "id": f._id, "encodedValue": `${macroType}.${targetActor._id}.${f._id}` });
            
            if (activationType == "lair") {
                lair.actions.push({ "name": f.name, "id": f._id, "encodedValue": `${macroType}.${targetActor._id}.${f._id}` })
                return active;
            }
            
            if (activationType == "legendary") {
                legendary.actions.push({ "name": f.name, "id": f._id, "encodedValue": `${macroType}.${targetActor._id}.${f._id}` })
                return active;
            }
    
            active.actions.push({ "name": f.name, "id": f._id, "encodedValue": `${macroType}.${targetActor._id}.${f._id}` });
    
            return dispose;
        }, {});
    
        let result = {
            "idAction": "tokenBarShowFeats",
            "subcategories": {}
        };
    
        if (active.actions.length > 0)
            result.subcategories["active"] = active;
    
        if (legendary.actions.length > 0)
            result.subcategories["legendary"] = legendary;
    
        if (lair.actions.length > 0)
            result.subcategories["lair"] = lair;
    
        if (passive.actions.length > 0)
            result.subcategories["passive"] = passive;
        
        return result;
    }
}