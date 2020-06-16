export function rollAbilityMacro(event, tokenId, checkId) {
    getActor(tokenId).rollAbility(checkId, {event: event});
}

export function rollSkillMacro(event, tokenId, checkId) {
    getActor(tokenId).rollSkill(checkId, {event: event});
}

export function rollItemMacro(event, tokenId, itemId) {
    let actor = getActor(tokenId);
    let item = actor.getOwnedItem(itemId);

    if (!item)
        ui.notifications.warn("No item found");

    if (item.data.type === "spell")
        return actor.useSpell(item);

    if (item.data.data.recharge && !item.data.data.recharge.charged && item.data.data.recharge.value)
        return item.rollRecharge();
        
    return item.roll();
}

function getActor(tokenId) {
    return canvas.tokens.placeables.find(t => t.data._id === tokenId).actor;
}