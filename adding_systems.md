# Adding system support

The Token Action HUD currently relies on two things:
* a roll handler that receives button actions and does something with them
* an action handler that takes a token and builds an action tree

The goal is not for the Token Action HUD to cover all edge cases and obscure uses, but just offer quick, simple access to common actions and rolls.

If your favourite system or roller is not yet supported, or you have strong objections about how I have divided actions for your system, please contact me and we can work together to improve the HUD.

# Action Handlers
Currently I only plan to have one action handler per system.

The action handler has one public method, buildActionList(token), which takes a token with an actor and returns an action list that looks like:

## An ActionList
```
{
    "tokenId": "Normally token._id"
    "actionId": "Normally token.actor._id"
    "categories": {}
}
```

## A category:
```
key: {
    "subcategories": {}
}
```

## A subcategory:
```
key: {
    info: "Extra information to display alongside the category";
    actions: [],
    subcategories: {}
}
```

(note: subcategories can currently contain further subcategories)

## An action:
```
    {
        name: "The name of the item",
        info1: "",
        info2: "",
        encodedValue: "";
    }
```

The encoded value is the data passed to the roll handler. For DND5e it uses the format "type.tokenId.actorId", which along with the click event should provide enough information for the roll handler.

The DND5e action handler also adds categories for skill checks and ability scores based on the DND5e config.

# Roll Handlers
A roll handler has one public method, handleActionEvent(event, value), which takes the click event and the encodedValue from the action, parses it and then sends the data onto the module or system to handle the action. A system could potentially have as many roll handlers as their are modules or ways to handle rolls.

The format of the encodedValue for the DND5e actions is type.tokenId.itemId, which can be split along the '.'s. In this case, 'type' is either item, feat, spell, ability, or skill, or any future category of item or check.