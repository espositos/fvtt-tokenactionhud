export function rollAbilityMacro(event, actorId, checkId) {
    game.actors.find(a => a._id === actorId).rollAbility(checkId, {event: event});
}

export function rollSkillMacro(event, actorId, checkId) {
    game.actors.find(a => a._id === actorId).rollSkill(checkId, {event: event});
}

export function rollItemMacro(event, actorId, itemId) {
    let item = game.actors.find(a => a._id === actorId).items.find(i => i._id == itemId);

    if (item == null)
        ui.notification.warning("No item found");

    if (item.data.type === "spell")
        return actor.useSpell(item);
        
    return item.roll();
}