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
        let tokenId = payload[1];
        let actionId = payload[2];

        switch (macroType) {
            case "ability":
                this.macros.rollAbilityMacro(event, tokenId, actionId);
                break;
            case "skill":
                this.macros.rollSkillMacro(event, tokenId, actionId);
                break;
            case "item":
            case "spell":
            case "feat":
                this.macros.rollItemMacro(event, tokenId, actionId);
                break;
            default:
                break;
        }
    }

    /** @override */
    buildActionList(token) {
        let result = { "tokenId": "", "actorId": "", "categories": {}};

        if (!token) {
            return result;
        }

        let tokenId = token.data._id;

        result.tokenId = tokenId;

        let actor = token.actor;

        if (!actor) {
            return result;
        }

        result.actorId = actor._id;
        
        let items = this._getItemList(actor, tokenId);
        let spells = this._getSpellsList(actor, tokenId);
        let feats = this._getFeatsList(actor, tokenId);
        let checks = checkLists.buildChecksList(actor, tokenId);
        let resourceList = this.resources.buildResourceList(actor, tokenId);
    
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
    _getItemList(actor, tokenId) {
        let items = actor.data.items;
        let equipped = items.filter(i => i.type !="consumable" && i.data.equipped && i.data.quantity > 0);
        let activeEquipped = this._getActiveEquipment(equipped);
        
        let weaponActions = this._mapToItemAction(tokenId, activeEquipped.filter(i => i.type == "weapon"));
    
        let equipmentActions = this._mapToItemAction(tokenId, activeEquipped.filter(i => i.type == "equipment"));
        
        let otherActions = this._mapToItemAction(tokenId, activeEquipped.filter(i => i.type != "weapon" && i.type != "equipment"));
    
        let consumables = items.filter(i => i.type == "consumable" && i.data.quantity > 0);
        
        let consumablesChargedActions = this._mapToItemAction(tokenId, consumables.filter(c => c.data.uses.value && c.data.uses.value > 0));
            
        let consumablesNoChargeActions = this._mapToItemAction(tokenId, consumables.filter(c => !c.data.uses.max && !c.data.uses.value));
        
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
    _mapToItemAction(tokenId, items) {
        const macroType = "item";
        return items.map(i => {
            let result = { "name": i.name, "id": i._id, "encodedValue": `${macroType}.${tokenId}.${i._id}`}
            if (i.data.uses.value) {
                result["charges"] = i.data.uses.value;
                
                if (i.data.uses.max) {
                    result["charges"] += `/${i.data.uses.max}`
                }
            }

            if (i.data.quantity > 1) {
                result["quantity"] = i.data.quantity;
            }

            return result; });
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
    _getSpellsList(actor, tokenId) {
        let preparedSpells = actor.data.items.filter(i => i.type == "spell" && i.data.preparation.prepared);
        let spells = this._categoriseSpells(actor, tokenId, preparedSpells);
    
        return spells;
    }
    
    /** SPELLS **/
    /** @private */
    _categoriseSpells(actor, tokenId, spells) {
        const powers = { "subcategories": {} };
        const book = { "subcategories": {} };
        const macroType = "spell";
        const spellSlots = actor.data.data.spells;

        let dispose = spells.reduce(function (dispose, s) {
            let spell = { "name": s.name, "id": s._id, "encodedValue": `${macroType}.${tokenId}.${s._id}` };

            var level = s.data.level;
            let prep = s.data.preparation.mode;
            const prepType = game.dnd5e.config.spellPreparationModes[prep];
    
            if (prep == "pact" || prep == "atwill" || prep == "innate") {
                if (!powers.subcategories.hasOwnProperty(prepType)) {
                    powers.subcategories[prepType] = { "actions": []};

                    if (spellSlots[prep] && spellSlots[prep].max > 0)
                        powers.subcategories[prepType]["slots"] = `(${spellSlots[prep].value} / ${spellSlots[prep].max})`;
                }

                powers.subcategories[prepType].actions.push(spell);

            } else {
                let levelText = "Level " + level;
                
                if (level == 0)
                    levelText = "Cantrips";

                if (!book.subcategories.hasOwnProperty(levelText)) {
                    book.subcategories[levelText] = { "actions": []};
                }

                let spellLevelKey = 'spell' + level;
                if (spellSlots[spellLevelKey] && spellSlots[spellLevelKey].max > 0)
                    book.subcategories[levelText]["slots"] = `(${spellSlots[spellLevelKey].value} / ${spellSlots[spellLevelKey].max})`;
    
                book.subcategories[levelText].actions.push(spell);
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
    _getFeatsList(actor, tokenId) {
        let allFeats = actor.data.items.filter(i => i.type == "feat");
        let feats = this._categoriseFeats(tokenId, allFeats);
    
        return feats;
    }
    
    /** @private */
    _categoriseFeats(tokenId, feats) {
        let active = { "actions": []};
        let passive = { "actions": []};
        let lair = { "actions": []};
        let legendary = { "actions": []};
    
        let dispose = feats.reduce(function (dispose, f) {
            const activationTypes = game.dnd5e.config.abilityActivationTypes;
            const activationType = f.data.activation.type;
            const macroType = "feat";

            let feat = { "name": f.name, "id": f._id, "encodedValue": `${macroType}.${tokenId}.${f._id}` }

            if (f.data.uses.value) {
                feat["charges"] = f.data.uses.value;

                if (f.data.uses.max) {
                    feat["charges"] += `/${f.data.uses.max}`
                }
            }
            
            if (f.data.recharge && !f.data.recharge.charged && f.data.recharge.value) {
                feat["name"] += " (Recharge)";
            }
            
            if (!activationType || activationType === "") {
                passive.actions.push(feat);
                return;
            } 
            
            if (activationType == "lair") {
                lair.actions.push(feat);
                return;
            }

            if (activationType == "legendary") {
                legendary.actions.push(feat)
                return;
            } 

            active.actions.push(feat);

            return;
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