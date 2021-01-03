import { SystemManager } from "./manager.js";
import { ActionHandler5e as ActionHandler } from "../actions/dnd5e/dnd5e-actions.js";
import { MagicItemsPreRollHandler } from "../rollHandlers/dnd5e/pre-magicItems.js";
import { MagicItemActionListExtender } from "../actions/magicItemsExtender.js";
import { RollHandlerBase5e as Core } from "../rollHandlers/dnd5e/dnd5e-base.js";
import { RollHandlerBetterRolls5e as BetterRolls5e } from "../rollHandlers/dnd5e/dnd5e-betterrolls5e.js";
import { RollHandlerObsidian as Obsidian5e } from "../rollHandlers/dnd5e/dnd5e-obsidian.js";
import { RollHandlerMinorQol5e as MinorQol5e } from "../rollHandlers/dnd5e/dnd5e-minorqol.js";
import * as settings from "../settings/dnd5e-settings.js";

export class Dnd5eSystemManager extends SystemManager {
  constructor(appName) {
    super(appName);
  }

  /** @override */
  doGetActionHandler(filterManager, categoryManager) {
    let actionHandler = new ActionHandler(filterManager, categoryManager);

    if (SystemManager.isModuleActive("magicitems"))
      actionHandler.addFurtherActionHandler(new MagicItemActionListExtender());

    return actionHandler;
  }

  /** @override */
  getAvailableRollHandlers() {
    let coreTitle = "Core D&D5e";

    if (SystemManager.isModuleActive("midi-qol"))
      coreTitle += ` [supports ${SystemManager.getModuleTitle("midi-qol")}]`;

    let choices = { core: coreTitle };
    SystemManager.addHandler(choices, "betterrolls5e");
    SystemManager.addHandler(choices, "obsidian");
    SystemManager.addHandler(choices, "minor-qol");

    return choices;
  }

  /** @override */
  doGetRollHandler(handlerId) {
    let rollHandler;
    switch (handlerId) {
      case "betterrolls5e":
        rollHandler = new BetterRolls5e();
        break;
      case "minor-qol":
        rollHandler = new MinorQol5e();
        break;
      case "obsidian-qol":
        rollHandler = new Obsidian5e();
        break;
      case "core":
      default:
        rollHandler = new Core();
        break;
    }

    if (SystemManager.isModuleActive("magicitems"))
      rollHandler.addPreRollHandler(new MagicItemsPreRollHandler());

    return rollHandler;
  }

  /** @override */
  doRegisterSettings(appName, updateFunc) {
    settings.register(appName, updateFunc);
  }
}
