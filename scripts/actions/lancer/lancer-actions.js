import { ActionHandler } from "../actionHandler.js";

export class ActionHandlerLancer extends ActionHandler {
    constructor (filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    /** @override */
    async doBuildActionList(token, multipleTokens) {
        let result = this.initializeEmptyActionList();

        if (!token)
            return result;

        let tokenId = token.data._id;

        result.tokenId = tokenId;

        let actor = token.actor;

        if (!actor)
            return result;

        result.actorId = actor._id;

        switch (actor.data.type) {
            case "pilot":
                this._combineCategoryWithList(result, "Pilot", this._pilotCategory(actor, tokenId));
                this._combineCategoryWithList(result, "Mech", this._mechCategory(actor, tokenId));
                this._combineCategoryWithList(result, "Weapons", this._weaponsCategory(actor, tokenId));
                this._combineCategoryWithList(result, "Systems", this._systemsCategory(actor, tokenId));
                break;
            case "npc":
                this._combineCategoryWithList(result, "Stats", this._npcBaseCategory(actor, tokenId));
                this._combineCategoryWithList(result, "Features", this._npcFeatureCategory(actor, tokenId));
                break;
        }
        


        return result;
    }

    _makeAction(actionName, macroType, tokenId, actionId, option) {
        let action = this.initializeEmptyAction();
        action.name = actionName;
        action.encodedValue = [macroType, tokenId, actionId, JSON.stringify(option ? option : {})].join("|");
        return action;
    }

    _makeItemSubCat(name, itemType, actor, tokenId) {
        let result = this.initializeEmptySubcategory();
        let macro = "item"

        result.name = name
        result.actions = actor.data.items.filter(item => {
            return item.type === itemType;
        }).map( item => {
            return this._makeAction(item.name, macro, tokenId, item._id)
        })

        return result
    }

    _makeNPCItemSubCat(name, itemType, actor, tokenId) {
        let result = this.initializeEmptySubcategory();
        let macro = "item"

        result.name = name
        result.actions = actor.data.items.filter(item => {
            return item.type === "npc_feature"
        }).filter(item => {
            return item.data.feature_type === itemType;
        }).map( item => {
            return this._makeAction(item.name, macro, tokenId, item._id)
        })

        return result
    }

    _pilotCategory(actor, tokenId) {
        let result = this.initializeEmptyCategory("pilot");

        [
            this._skillsSubCategory(actor, tokenId),
            this._talentsSubCategory(actor, tokenId),
            this._pilotGearSubCategory(actor, tokenId),
            this._pilotWeaponSubCategory(actor, tokenId),
        ].forEach(subCat => {
            this._combineSubcategoryWithCategory(result, subCat.name, subCat);
        });

        return result
    }

    _mechCategory(actor, tokenId) {
        let result = this.initializeEmptyCategory("mech");

        [
            this._haseSubCategory(tokenId),
            this._statSubCategory(tokenId),
            this._coreBonSubCategory(actor, tokenId),
            this._corePowerSubCategory(actor, tokenId),
        ].forEach(subCat => {
            this._combineSubcategoryWithCategory(result, subCat.name, subCat);
        });

        return result
    }

    _npcBaseCategory(actor, tokenId) {
        let result = this.initializeEmptyCategory("mech");

        [
            this._haseSubCategory(tokenId),
        ].forEach(subCat => {
            this._combineSubcategoryWithCategory(result, subCat.name, subCat);
        });

        return result
    }

    _npcFeatureCategory(actor, tokenId) {
        let result = this.initializeEmptyCategory("feature");

        [   
            this._npcWeaponSubCat(actor, tokenId),
            this._npcTechSubCat(actor, tokenId),
            this._npcReactionSubCat(actor, tokenId),
            this._npcSystemSubCat(actor, tokenId),
            this._npcTraitSubCat(actor, tokenId),
        ].forEach(subCat => {
            this._combineSubcategoryWithCategory(result, subCat.name, subCat);
        });

        return result    
    }

    _npcWeaponSubCat(actor, tokenId) {
        return this._makeNPCItemSubCat("Weapons", "Weapon", actor, tokenId)
    }

    _npcTraitSubCat(actor, tokenId) {
        return this._makeNPCItemSubCat("Traits", "Trait", actor, tokenId)
    }
    
    _npcSystemSubCat(actor, tokenId) {
        return this._makeNPCItemSubCat("Systems", "System", actor, tokenId)
    }

    _npcTechSubCat(actor, tokenId) {
        return this._makeNPCItemSubCat("Techs", "Tech", actor, tokenId)
    }

    _npcReactionSubCat(actor, tokenId) {
        return this._makeNPCItemSubCat("Reactions", "Reaction", actor, tokenId)
    }

    _skillsSubCategory(actor, tokenId) {
        return this._makeItemSubCat("Skill Triggers", "skill", actor, tokenId)
    }

    _talentsSubCategory(actor, tokenId) {
        let result = this.initializeEmptySubcategory();
        let macro = "item"

        result.id = "talent"
        result.name = "Talents"

        let itemSubCats = actor.data.items.filter(item => {
            return item.type === "talent"
        }).map( talent => {
            let subcat = this.initializeEmptySubcategory()
            subcat.name = talent.name
            
            for (let i = 0; i < talent.data.rank; i++) {
                let option = {"rank": i}
                let action = this._makeAction(`Rank ${i+1}`, macro, tokenId, talent._id, option)
                subcat.actions.push(action)
            }

            return subcat
        })

        this._combineSubcategoryWithCategory

        result.subcategories = itemSubCats
        
        return result
    }

    _pilotWeaponSubCategory(actor, tokenId) {
        return this._makeItemSubCat("Weapons", "pilot_weapon", actor, tokenId)
    }

    _pilotGearSubCategory(actor, tokenId) {
        return this._makeItemSubCat("Gear", "pilot_gear", actor, tokenId)
    }
    

    _haseSubCategory(tokenId) {
        let result = this.initializeEmptySubcategory();
        let macro = "hase"
        
        result.id = "hase"
        result.name = "HASE"

        let haseActionData = [{name: "Hull", id: "hull"}, 
            {name: "Agility", id: "agility"}, 
            {name: "Systems", id: "systems"}, 
            {name: "Engineering", id: "engineering"}
        ]

        let haseActions = haseActionData.map( actionData => {
            return this._makeAction(actionData.name, macro, tokenId, actionData.id)
        })

        result.actions = haseActions

        return result
    }

    _statSubCategory(tokenId) {
        let result = this.initializeEmptySubcategory();
        let macro = "stat"

        result.id = "stat"
        result.name = "Stat"

        let statActionData = [
            {name: "Grit", data: "pilot.grit"},
            {name: "Tech Attack", data: "mech.tech_attack"}
        ]

        let statActions = statActionData.map( actionData => {
            return this._makeAction(actionData.name, macro, tokenId, actionData.data)
        })

        result.actions = statActions

        return result
    }

    _coreBonSubCategory(actor, tokenId) {
        return this._makeItemSubCat("Core Bonus", "core_bonus", actor, tokenId)
    }

    _corePowerSubCategory(actor, tokenId) {
        let result = this.initializeEmptySubcategory();

        let frame = actor.data.items.find(item => {
            return item.type === "frame"
        })
        let core = frame.data.core_system

        result.name = core.name

        if(core.passive_name) {
            result.actions.push( this._makeAction(core.passive_name, "corePassive", tokenId, "") )
        }
        if(core.active_name) {
            result.actions.push( this._makeAction(core.active_name, "coreActive", tokenId, "") )
        }

        return result
    }

    _weaponsCategory(actor, tokenId) {
        let result = this.initializeEmptyCategory()
        let macro = "item"

        result.id = "weapons"
        result.name = "Weapons"

        let itemSubCats = actor.data.items.filter(item => {
            return item.type === "mech_weapon"
        }).map( weapon => {
            let subcat = this.initializeEmptySubcategory(weapon.id)
            subcat.name = weapon.name

            let attack = this._makeAction("Attack", macro, tokenId, weapon._id)

            subcat.actions = [attack]

            return subcat
        })

        itemSubCats.forEach(subCat => {
            this._combineSubcategoryWithCategory(result, subCat.name, subCat)
        });

        return result
    }

    _systemsCategory(actor, tokenId) {
        let result = this.initializeEmptyCategory()
        let macro = "item"

        result.id = "systems"
        result.name = "Systems"

        let itemSubCats = actor.data.items.filter(item => {
            return item.type === "mech_system"
        }).map( system => {
            let subcat = this.initializeEmptySubcategory(system.id)
            subcat.name = system.name

            let activation = this._makeAction("Activate", macro, tokenId, system._id)

            subcat.actions = [activation]

            return subcat
        })

        itemSubCats.forEach(subCat => {
            this._combineSubcategoryWithCategory(result, subCat.name, subCat)
        });

        return result
    }

}