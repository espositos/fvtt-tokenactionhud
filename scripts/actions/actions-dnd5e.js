import * as checkLists from './checks-dnd5e.js';
import {ActionHandler} from './actionHandler.js';

export class ActionHandler5e extends ActionHandler {
    constructor (macros5e, resources5e) {
        super(macros5e);
        this.macros = macros5e;
        this.resources = resources5e;
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
    buildActionList(actor) {
        let result = { "actorId": "", "categories": {}};

        if (actor === null || actor === undefined) {
            return result;
        }

        result.actorId = actor._id;
        
        let items = this._getItemList(actor);
        let spells = this._getSpellsList(actor);
        let feats = this._getFeatsList(actor);
        let checks = checkLists.buildChecksList(actor);
        let resourceList = this.resources.buildResourceList(actor);
    
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

        if (Object.keys(resourceList).length > 0) {
            result["resources"] = resourceList;
        }
       
        return result;
    }
    
    /** ITEMS **/
    
    /** @private */
    _getItemList(actor) {
        let items = actor.data.items;
        let equipped = items.filter(i => i.type !="consumable" && i.data.equipped);
        let activeEquipped = this._getActiveEquipment(equipped);
        const macroType = "item";

        let weaponActions = activeEquipped.filter(i => i.type == "weapon")
            .map(w => { return { "name": w.name, "id": w._id, "encodedValue": `${macroType}.${actor._id}.${w._id}`}; });
    
        let equipmentActions = activeEquipped.filter(i => i.type == "equipment")
            .map(e => { return { "name": e.name, "id": e._id, "encodedValue": `${macroType}.${actor._id}.${e._id}` }; });
        
        let otherActions = activeEquipped.filter(i => i.type != "weapon" && i.type != "equipment")
            .map(o => { return { "name": o.name, "id": o._id, "encodedValue": `${macroType}.${actor._id}.${o._id}`}; });
    
        let consumables = items.filter(i => i.type == "consumable");
        
        let consumablesChargedActions = consumables
            .filter(c => c.data.uses.value && c.data.uses.value > 0)
            .map(c => { return { "name": c.name, "id": c._id, "encodedValue": `${macroType}.${actor._id}.${c._id}` }; });
            
        let consumablesNoChargeActions = consumables.filter(c => !c.data.uses.max && !c.data.uses.value)
            .map(c => { return { "name": c.name, "id": c._id, "encodedValue": `${macroType}.${actor._id}.${c._id}` }; });
        
        let itemsResult = {
            "idAction": "tokenBarShowItems",
            "subcategories": {}
        }
            
        if (weaponActions.length > 0)
            itemsResult.subcategories["weapons"] = {"actions": weaponActions };
    
        if (equipmentActions.length > 0)
            itemsResult.subcategories["equipment"] = {"actions": equipmentActions };
        
        if (otherActions.length > 0)
            itemsResult.subcategories["other"] = {"actions": otherActions };
        
        if (consumablesChargedActions.length > 0)
            itemsResult.subcategories["charged consumables"] = {"actions": consumablesChargedActions };
        
        if (consumablesNoChargeActions.length > 0)
            itemsResult.subcategories["consumables without charges"] = {"actions": consumablesNoChargeActions };
        
        return itemsResult;
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
    _getSpellsList(actor) {
        let preparedSpells = actor.data.items.filter(i => i.type == "spell" && i.data.preparation.prepared);
        let spells = this._categoriseSpells(actor, preparedSpells);
    
        return spells;
    }
    
    /** SPELLS **/
    /** @private */
    _categoriseSpells(actor, spells) {
        const powers = { "hasSubcategories": true, "subcategories": {} };
        const book = { "hasSubcategories": true, "subcategories": {} };
        const macroType = "spell";
        const spellLevels = actor.data.data.spells;

        let dispose = spells.reduce(function (dispose, spell) {
            var level = spell.data.level;
            let prep = spell.data.preparation.mode;
    
            const prepTypes = game.dnd5e.config.spellPreparationModes;
            let prepType = prepTypes[prep];
    
            if (prep == "pact" || prep == "atwill" || prep == "innate") {
                if (!powers.subcategories.hasOwnProperty(prepType)) {
                    powers.subcategories[prepType] = { "actions": []};

                    if (spellLevels[prep] && spellLevels[prep].max > 0)
                        powers.subcategories[prepType]["slots"] = `(${spellLevels[prep].value} / ${spellLevels[prep].max})`;
                }

                powers.subcategories[prepType].actions.push({ "name": spell.name, "id": spell._id, "encodedValue": `${macroType}.${actor._id}.${spell._id}` });

            } else {
                let levelText = "Level " + level;
                
                if (level == 0)
                    levelText = "Cantrips";

                if (!book.subcategories.hasOwnProperty(levelText)) {
                    book.subcategories[levelText] = { "actions": []};
                }

                let spellLevelKey = 'spell' + level;
                if (spellLevels[spellLevelKey] && spellLevels[spellLevelKey].max > 0)
                    book.subcategories[levelText]["slots"] = `(${spellLevels[spellLevelKey].value} / ${spellLevels[spellLevelKey].max})`;
    
                book.subcategories[levelText].actions.push({ "name": spell.name, "id": spell._id, "encodedValue": `${macroType}.${actor._id}.${spell._id}` });
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
            
        console.log(result);

        return result;
    }
    
    /** FEATS **/

    /** @private */
    _getFeatsList(actor) {
        let allFeats = actor.data.items.filter(i => i.type == "feat");
        let feats = this._categoriseFeats(actor, allFeats);
    
        return feats;
    }
    
    /** @private */
    _categoriseFeats(actor, feats) {
        let active = { "actions": []};
        let passive = { "actions": []};
        let lair = { "actions": []};
        let legendary = { "actions": []};
    
        let dispose = feats.reduce(function (dispose, f) {
            const activationTypes = game.dnd5e.config.abilityActivationTypes;
            const activationType = f.data.activation.type;
            const macroType = "feat";
            
            if (activationType == null)
                passive.actions.push({ "name": f.name, "id": f._id, "encodedValue": `${macroType}.${actor._id}.${f._id}` });
            
            if (activationType == "lair") {
                lair.actions.push({ "name": f.name, "id": f._id, "encodedValue": `${macroType}.${actor._id}.${f._id}` })
                return active;
            }
            
            if (activationType == "legendary") {
                legendary.actions.push({ "name": f.name, "id": f._id, "encodedValue": `${macroType}.${actor._id}.${f._id}` })
                return active;
            }
    
            active.actions.push({ "name": f.name, "id": f._id, "encodedValue": `${macroType}.${actor._id}.${f._id}` });
    
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