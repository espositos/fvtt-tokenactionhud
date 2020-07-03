import * as settings from '../../settings.js';

export function buildChecksList(tokenId, actorType) {
    let result = {};

    let abbr = settings.get('abbreviateSkills');

    let skills = mapToSubcategory(tokenId, actorType, 'skills', 'skill', game.dnd5e.config.skills, abbr);
    result['skills'] = { subcategories: skills };

    if (settings.get('splitAbilities')) {
        let checks = mapToSubcategory(tokenId, actorType, 'checks', 'abilityCheck', game.dnd5e.config.abilities, abbr);
        result['checks'] = { subcategories: checks };

        let saves = mapToSubcategory(tokenId, actorType, 'saves', 'abilitySave', game.dnd5e.config.abilities, abbr);
        result['saves'] = { subcategories: saves}; 
    } else {
        let abilities = mapToSubcategory(tokenId, actorType, 'abilities', 'ability', game.dnd5e.config.abilities, abbr);
        result['abilities'] = { subcategories: abilities}; 
    }
    
    settings.Logger.debug(result);
    return result;
}

function mapToSubcategory(tokenId, actorType, categoryName, categoryType, list, abbr) {
    
    let result = { [categoryName]: 
            { 
                'actions': Object.entries(list).map(e => {
                    let name = abbr ? e[0] : e[1];
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                    return { 'name': name, 'id': e[0], 'encodedValue': `${actorType}|${categoryType}|${tokenId}|${e[0]}`}; 
                })
            }
        };

    return result;
}