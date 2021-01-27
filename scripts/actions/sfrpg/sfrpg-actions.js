import {ActionHandler} from '../actionHandler.js';
import * as settings from '../../settings.js';

export class ActionHandlerSfrpg extends ActionHandler {
    constructor (filterManager, categoryManager) {
        super(filterManager, categoryManager);
    }

    /** @override */
    async doBuildActionList(token, multipleTokens) {
        let actionList = this.initializeEmptyActionList();

        if (!token)
            return actionList;

        let tokenId = token.data._id;

        actionList.tokenId = tokenId;

        let actor = token.actor;

        if (!actor)
            return actionList;

        actionList.actorId = actor._id;

        if (actor.data.type !== 'starship') {
            this._buildItemCategory(token, actionList);
            this._buildSpellsCategory(token, actionList);
            this._buildFeatsCategory(token, actionList);
            this._buildSkillCategory(token, actor, actionList);
            this._buildAbilitiesCategory(token, actionList);
            this._buildSavesCategory(token, actionList);
        } else {
            this._addStarshipWeapons(token, actor, actionList);
            await this._addCrewActions(token, actor, actionList);
            this._addShields(token, actor, actionList);
        }

        settings.Logger.debug('SFRPG ActionList:', actionList);
        
        if (settings.get('showHudTitle'))
            actionList.hudTitle = token.data?.name;
        
        return actionList;
    }

    _buildItemCategory(token, actionList){
        var itemList = token.actor.data.items;
        let tokenId = token.data._id;

        var itemsCategoryName = this.i18n('tokenactionhud.equipment');
        var itemsMacroType = "item";
        let itemsCategory = this.initializeEmptyCategory('equipment');
        
        itemsCategory = this._addSubcategoryByType(this.i18n('tokenactionhud.weapons'), "weapon",itemsMacroType, itemList, tokenId, itemsCategory);
        itemsCategory = this._addSubcategoryByType(this.i18n('tokenactionhud.consumables'), "consumable",itemsMacroType, itemList, tokenId, itemsCategory);

        this._combineCategoryWithList(actionList, itemsCategoryName, itemsCategory);
    }

    _buildFeatsCategory(token, actionList){

        var itemList = token.actor.data.items.filter(item => item.type == "feat");
        let tokenId = token.data._id;

        var itemsCategoryName = this.i18n('tokenactionhud.features');
        var itemsMacroType = "feat";
        let itemsCategory = this.initializeEmptyCategory(itemsCategoryName);

        this._addSubcategoryByActionType(this.i18n('tokenactionhud.mwa'), "mwak", itemsMacroType, itemList, tokenId, itemsCategory);
        this._addSubcategoryByActionType(this.i18n('tokenactionhud.rwa'), "rwak", itemsMacroType, itemList, tokenId, itemsCategory);
        this._addSubcategoryByActionType(this.i18n('tokenactionhud.msa'), "msak", itemsMacroType, itemList, tokenId, itemsCategory);
        this._addSubcategoryByActionType(this.i18n('tokenactionhud.rsa'), "rsak", itemsMacroType, itemList, tokenId, itemsCategory);
        this._addSubcategoryByActionType(this.i18n('tokenactionhud.healing'), "heal", itemsMacroType, itemList, tokenId, itemsCategory);

        if (settings.get('showMiscFeats')) {
            const miscFeats = itemList.filter(i => !['mwak', 'rwak', 'msak', 'rsak', 'heal'].includes(i.data.actionType));
            this._addSubcategoryByItemList(this.i18n('tokenactionhud.misc'), itemsMacroType, miscFeats, tokenId, itemsCategory);
        }

        this._combineCategoryWithList(actionList, itemsCategoryName, itemsCategory);
    }
  
    _buildSpellsCategory(token, actionList){

        var itemList = token.actor.data.items.filter(item => item.type == "spell");
        let tokenId = token.data._id;

        var categoryName = this.i18n('tokenactionhud.spellbook');
        var macroType = "spell";
        let category = this.initializeEmptyCategory(categoryName);

        var maxLevel = 6;
        
        for (let level = 0; level < maxLevel; level++) {
            category = this._addSubcategoryByLevel(`${this.i18n('tokenactionhud.level')} ` + level, level, macroType, itemList, tokenId, category);
            
        }

        this._combineCategoryWithList(actionList, categoryName, category);
    }        

    /** @private */
    _buildSkillCategory(token, actor, actionList) {
        if (!actor.data.data.skills)
            return actionList;

        let category = this.initializeEmptyCategory('skills');
        let macroType = 'skill';
        
        const actorSkills = Object.entries(actor.data.data.skills);
        const coreSkills = CONFIG.SFRPG.skills;

        let skillsActions = actorSkills.map(s => {
            let key = s[0];
            let data = s[1];
            let name;
            if (key.startsWith('pro')) {
                name = coreSkills['pro'];
                if (!!data.subname)
                    name += ` (${data.subname})`;
            } else {
                name = coreSkills[key];
            }

            let encodedValue = [macroType, token.data._id, key].join(this.delimiter);
            let icon = this._getClassSkillIcon(data.value)
            return { name: name, id: key, encodedValue: encodedValue, icon: icon };
        }).sort((a,b) => {
            return a.name.toUpperCase().localeCompare(b.name.toUpperCase(), undefined, {sensitivity: 'base'})
        });
        
        let skillsCategory = this.initializeEmptySubcategory();
        skillsCategory.actions = skillsActions;

        let skillsTitle = this.i18n('tokenactionhud.skills');
        this._combineSubcategoryWithCategory(category, skillsTitle, skillsCategory);
        this._combineCategoryWithList(actionList, skillsTitle, category);
    }      

    /** @private */
    _buildAbilitiesCategory(token, actionList) {
        let category = this.initializeEmptyCategory('abilities');
        let macroType = 'ability';
        
        let abilitiesActions = Object.entries(CONFIG.SFRPG.abilities).map(e => {
            let name = e[1];
            let encodedValue = [macroType, token.data._id, e[0]].join(this.delimiter);
            return { name: name, id: e[0], encodedValue: encodedValue }; 
        });
        let abilitiesCategory = this.initializeEmptySubcategory();
        abilitiesCategory.actions = abilitiesActions;

        let abilitiesTitle = this.i18n('tokenactionhud.abilities');
        this._combineSubcategoryWithCategory(category, abilitiesTitle, abilitiesCategory);
        this._combineCategoryWithList(actionList, abilitiesTitle, category);
    }      

    /** @private */
    _buildSavesCategory(token, actionList) {
        let category = this.initializeEmptyCategory('saves');
        let macroType = 'save';
        
        let saveActions = Object.entries(CONFIG.SFRPG.saves).map(e => {
            let name = e[1];
            let encodedValue = [macroType, token.data._id, e[0]].join(this.delimiter);
            return { name: name, id: e[0], encodedValue: encodedValue }; 
        });
        let savesCategory = this.initializeEmptySubcategory();
        savesCategory.actions = saveActions;

        let savesTitle = this.i18n('tokenactionhud.saves');
        this._combineSubcategoryWithCategory(category, savesTitle, savesCategory);
        this._combineCategoryWithList(actionList, savesTitle, category);
    }

    _addSubcategoryByActionType(subCategoryName, actionType, macroType, itemList, tokenId, category) {  
        let subCategory = this.initializeEmptySubcategory();    

        let itemsOfType = itemList.filter(item => item.data.actionType == actionType);
        subCategory.actions = itemsOfType.map(item => this._buildItemAction(tokenId, macroType, item));
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    _addSubcategoryByItemList(subCategoryName, macroType, itemList, tokenId, category) {  
        let subCategory = this.initializeEmptySubcategory();

        subCategory.actions = itemList.map(item => this._buildItemAction(tokenId, macroType, item));
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    
    _addSubcategoryByType(subCategoryName, type, macroType, itemList, tokenId, category){
        
        let subCategory = this.initializeEmptySubcategory();    

        let itemsOfType = itemList.filter(item => item.type == type);
        subCategory.actions = itemsOfType.map(item => this._buildItemAction(tokenId, macroType, item));
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    _addSubcategoryByLevel(subCategoryName, level, macroType, itemList, tokenId, category){
        
        let subCategory = this.initializeEmptySubcategory();    

        let itemsOfType = itemList.filter(item => item.data.level == level);
        subCategory.actions = itemsOfType.map(item => {
            let action = this._buildItemAction(tokenId, macroType, item);
            if (settings.get('showSpellInfo'))
                this._addSpellInfo(item, action);
            return action;
        });
                  
        this._combineSubcategoryWithCategory(category, subCategoryName, subCategory);
        
        return category;
    }

    /** @private */
    _addSpellInfo(s, spell) {
        let data = s.data;

        if (data?.sr)
            spell.info2 += 'Sr';

        if (data?.dismissible)
            spell.info2 += 'D';

        if (data?.concentration)
            spell.info2 += 'C';

        if (data?.save?.type) {
            let type = data.save.type;
            spell.info3 += type?.charAt(0).toUpperCase() + type?.slice(1);
        }
    }

    _buildItemAction(tokenId, macroType, item) {
        let encodedValue = [macroType, tokenId, item._id].join(this.delimiter);
        let img = this._getImage(item);
        let icon = this._getActionIcon(item.data.activation?.type)
        let result = { name: item.name, id: item._id, encodedValue: encodedValue, img:img, icon: icon }        

        result.info1 = this._getQuantityData(item);

        result.info2 = this._getUsesOrUsageData(item);

        result.info3 = this._getCapacityData(item)
        
        return result;
    }

    /** @private */
    _getQuantityData(item) {
        let result = '';
        if (item.data.quantity > 1) {
            result = item.data.quantity;
        }

        return result;
    }

    /** @private */
    _getUsesOrUsageData(item) {
        let result = '';

        let uses = item.data.uses;
        if (uses?.max || uses?.value) {
            result = uses.value ?? '';
            
            if (uses.max > 0) {
                result += `/${uses.max}`
            }
            return result;
        }
        
        let usage = item.data.usage;
        if (usage?.value) {
            result = usage.value ?? '';
            
            if (usage.value > 0) {
                result += `/${usage.per}`
            }
            return result;
        }

        return result;
    }

    /** @private */
    _getCapacityData(item) {
        let result = '';

        let capacity = item.data.capacity;
        if (!capacity)
            return result;

        result = capacity.value ?? '';
        if (!!capacity.max)
            result += `/${capacity.max}`

        return result;
    }    
    
    _getImage(item) {
        let result = '';
        if (settings.get('showIcons'))
            result = item.img ?? '';

        return !result?.includes('icons/svg/mystery-man.svg') ? result : '';
    }

    _getClassSkillIcon(level) {
        const icons = {
            3: '<i class="fas fa-check"></i>'
        };

        return icons[level];
    }
    
    
    _getActionIcon(action) {
        const icon = {
            //action: `<i class="fas fa-fist-raised"></i>`,
            move: `<i class="fas fa-shoe-prints"></i>`,
            swift: `<i class="fas fa-bolt"></i>`,
            full: `<i class="fas fa-circle"></i>`,
            other: `<i class="far fa-circle"></i>`,
            reaction: `<i class="fas fa-undo-alt"></i>`,
            special: `<i class="fas fa-atom"></i>`,
            min: `<i class="fas fa-hourglass-start"></i>`,
            hour: `<i class="fas fa-hourglass-half"></i>`,
            day: `<i class="fas fa-hourglass-end"></i>`
        };
        return icon[action];
    }

    /** @private */
    _addStarshipWeapons(token, actor, actionList) {
        const itemType = 'starshipWeapon';
        const weapons = actor.data.items.filter(i => i.type === itemType); //.filter(w => w.data.mount.mounted && w.data.mount.activated);
        if (weapons.length === 0)
        return;
        
        const category = this.initializeEmptyCategory(itemType);
        
        const groupedWeapons = weapons.reduce((grouped, w) => {
            const groupName = w.data.mount.arc;
            if (!grouped.hasOwnProperty(groupName))
            grouped[groupName] = [];
            
            grouped[groupName].push(w);
            
            return grouped;
        }, {});
        
        const macroType = 'item';
        const order = ['forward', 'starboard', 'port', 'aft', 'turret'];
        order.forEach(mount => {
            const groupWeapons = groupedWeapons[mount];
            if (!groupWeapons)
                return;

            const subcategory = this.initializeEmptySubcategory(mount);

            groupWeapons.forEach(a => {
                const actionName = a.name;
                const encodedValue = [macroType, token.id, a._id].join(this.delimiter);
                const action = {name: actionName, encodedValue: encodedValue, id: a._id, img: this._getImage(a)};
                action.info1 = a.data.pcu ?? '';

                subcategory.actions.push(action);
            });

            const capitalMount = mount.charAt(0).toUpperCase() + mount.slice(1);
            const subName = this.i18n('SFRPG.ShipSystems.StarshipArcs.' + capitalMount);
            this._combineSubcategoryWithCategory(category, subName, subcategory);
        });        
        
        var categoryName = this.i18n('tokenactionhud.weapons');
        this._combineCategoryWithList(actionList, categoryName, category);
    }

    /** @private */
    async _addCrewActions(token, actor, actionList) {
        if (!actor.useStarshipAction)
            return;
            
        const macroType = 'crewAction';
        const category = this.initializeEmptyCategory(macroType);
        const actions = await game.packs.get("sfrpg.starship-actions").getContent();

        const groupedActions = actions.reduce((grouped, a) => {
            const role = a.data.data.role;
            if (!grouped.hasOwnProperty(role))
                grouped[role] = [];

            grouped[role].push(a);

            return grouped;
        }, {});

        const order = ['captain', 'pilot', 'gunner', 'engineer', 'scienceOfficer', 'chiefMate', 'magicOfficer', 'openCrew', 'minorCrew'];

        order.forEach(role => {
            const crew = actor.data.data.crew;
            const crewRole = crew[role];
            const npcRole = crew.npcData[role];

            if (!this._shouldShowCrewOptions(crew, crewRole, npcRole))
                return;

            const groupActions = groupedActions[role];
            const subcategory = this.initializeEmptySubcategory(role);

            groupActions.forEach(a => {
                const actionName = a.name;
                const encodedValue = [macroType, token.id, a._id].join(this.delimiter);
                const action = {name: actionName, encodedValue: encodedValue, id: a._id, img: this._getImage(a)};
                action.info1 = a.data.data.resolvePointCost ?? '';

                subcategory.actions.push(action);
            });

            if (crewRole) {
                if (crew.useNPCCrew) {
                    subcategory.info1 = crew.npcData[role].numberOfUses;
                } else {
                    subcategory.info1 = crewRole.limit > 0 ? `${crewRole.actors.length}/${crewRole.limit}` : crewRole.actors.length;
                }
            }

            const capitalRole = role.charAt(0).toUpperCase() + role.slice(1);
            const subName = this.i18n('SFRPG.StarshipSheet.Role.' + capitalRole);
            this._combineSubcategoryWithCategory(category, subName, subcategory);
        })

        const catName = this.i18n('tokenactionhud.crewActions');
        this._combineCategoryWithList(actionList, catName, category);
    }

    _shouldShowCrewOptions(crew, crewRole, npcRole) {
        if (!crewRole)
            return true;

        if (crewRole.actors?.length > 0 && !crew.useNPCCrew)
            return true;

        if (crew.useNPCCrew && npcRole?.numberOfUses > 0)
            return true;

        return false;
    }


    /** @private */
    _addShields(token, actor, actionList) {
        const macroType = 'shields';
        const category = this.initializeEmptySubcategory(macroType);

        const shields = actor.data.data.attributes?.shields;
        if (!shields)
        return actionList;
        
        category.info1 = `${shields.value}/${shields.max}`;
        
        const sides = ['forward', 'starboard', 'aft', 'port'];
        const amounts = [
            {name: '-10', value:'-10'},
            {name: '-5', value: '-5'},
            {name: '-1', value: '-1'},
            {name: '+1', value: '+1'},
            {name: '+5', value: '+5'},
            {name: '+10', value: '+10'}
        ];
        
        const quadrants = actor.data.data.quadrants;
        sides.forEach(side => {
            const currShields = quadrants[side]['shields'];
            if (!currShields)
                return;
            
            const subcategory = this.initializeEmptySubcategory(side);
            subcategory.info1 = `${currShields.value}/${shields.limit}`;

            amounts.forEach(amount => {
                const encodedValue = [macroType, token.id, `${side}.${amount.value}`].join(this.delimiter);
                const action = { name: amount.name, encodedValue: encodedValue, id: amount.value, cssClass:'shrink' };
                subcategory.actions.push(action);
            })

            const capitalSide = side.charAt(0).toUpperCase() + side.slice(1);
            const subName = this.i18n('SFRPG.StarshipSheet.Sides.' + capitalSide);
            this._combineSubcategoryWithCategory(category, subName, subcategory);
        });

        const catName = this.i18n('tokenactionhud.shields');
        this._combineCategoryWithList(actionList, catName, category);
    }
}