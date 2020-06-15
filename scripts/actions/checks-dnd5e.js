export function buildChecksList(targetActor) {
    let abilities = Object.entries(game.dnd5e.config.abilities).map(a => { return { "name": a[1], "id": a[0], "encodedValue": `ability.${targetActor._id}.${a[0]}`}; });
    let skills = Object.entries(game.dnd5e.config.skills).map(s => { return { "name": s[1], "id": s[0], "encodedValue": `skill.${targetActor._id}.${s[0]}`}; });

    return {
        "abilities": {
            "idAction": "tokenBarShowAbilities",
            "subcategories": {
                "abilities": { "actions": abilities }
            }
        },
        "skills": {
            "idAction": "tokenBarShowSkills",
            "subcategories": {
                "skills": { "actions": skills }
            }
        }
    }
}