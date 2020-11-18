# Changelog

## [0.9.12] 2020-11-18
### Bugfix
- SFRPG - prevent HUD crashing when used with character with unnamed profession

## [0.9.11] 2020-11-17
### Added
- DungeonWorld support for special and uncategoriesd moves

## [0.9.10] 2020-11-17
### Bugfix
- PF1 Bugfix for subskills

## [0.9.9] 2020-11-16
### Added
- LANCER RPG - render item sheet with right click

## [0.9.8] 2020-11-16
### Bugfix
- LANCER RPG fix delimiter

## [0.9.7] 2020-11-16
### Added
- LANCER RPG support thanks to Khaos#6127.

## [0.9.6] 2020-11-14
### Bugfix
- PF1 - Non-GM players now see the unidentified item name in their HUD until item is identified.

## [0.9.5] 2020-11-14
### Bugfix
- Magic Items now correctly hide themselves if they do not meet attuned or equipped requirement.

## [0.9.4] 2020-11-14
### Bugfix
- Add some cursory checks to protect against tokens with no actors.

## [0.9.3] 2020-11-11
### Changed
- PF1E - Spontaneous spellbooks should no longer slots to be shown
- DND5e - consumables and items without an action (or the 'none' action) should also be filtered out of the HUD inventory.

## [0.9.2] 2020-11-11
### Added
- PF1E - added rolls for Concentration for spellbooks other than primary

## [0.9.1] 2020-11-11
### Bugfix
- PF2E - NPC skills should work again
### Added
- PF1E - added rolls for Concentration (uses primary caster level) under spells, Combat Maneuver Bonus under Attacks, and Defenses under Saves.

## [0.9.0] 2020-11-10
### Changed
- Refactored where systems store their action and roll handlers away from one blob class.

## [0.8.16] 2020-11-09
### Bugfix
- PF2E - Handling of lore skills has changed in PF2E API so that is now fixed

## [0.8.15] 2020-11-08
### Bugfix
- WFRP - show only equipped weapons for characters and fix spellDialog call

## [0.8.14] 2020-11-08
### Bugfix
- PF2E - Lore skills appeared twice

## [0.8.13] 2020-11-04
### Bugfix
- PF1 - Check for 'passive' feats

## [0.8.12] 2020-11-04
### Bugfix
- DND5e - Consume tip on action would show nothing if value was 0

## [0.8.11] 2020-11-04
### Changed
- Try to ensure only one category can be opened at a time

## [0.8.10] 2020-11-04
### Added
- Setting for click-to-open categories (that also need to be clicked to close) mainly for touch/tablet users

## [0.8.9] 2020-11-03
### Changed
- Filter for categories now only appears on right-click (not left-click)

## [0.8.8] 2020-11-02
### Bugfix
- DND5e - using wrong variable to look up skill names

## [0.8.7] 2020-11-02
### Bugfix
- DND5e - do not attempt to add skills or spells to a vehicle actor

## [0.8.6] 2020-11-02
### Added
- Chinese localization thanks to hmqgg
- Polish localization thanks to silentmark

## [0.8.5] 2020-11-02
### Bugfix
- PF1 - Custom skills that aren't subskills are now accounted for

## [0.8.4] 2020-11-01
### Changed
- PF1 - General improvements

## [0.8.3] 2020-10-30
### Removed
- PF1 rests - I'll reimplement it when I know how but for now better not to show it

## [0.8.2] 2020-10-30
### Added
- PF1 support - Early days, pretty rough and ready, but please provide feedback

## [0.8.1] 2020-10-22
### Bugfix
- DND5e/SW5e - During multi-select, tokens without actors would cause the multiselect to fail.

## [0.8.0] 2020-10-15
### Changed
- PF2E - Order of items, feats, and lore skills should now reflect sheet ordering.

## [0.7.20] 2020-10-15
### Added
- SFRPG - Add miscellaneous category and setting for unassigned feats.

## [0.7.19] 2020-10-14
### Added
- SotDL - Support for Shadow of the Demonlord, thanks to Xacus.

## [0.7.18] 2020-10-12
### Added
- SW5E - Support for Star Wars 5e

## [0.7.17] 2020-09-28
### Added
- Pf2e - Support for Familiars

## [0.7.16] 2020-09-22
### Bugfix
- Pf2e - Add action categories for exploration and downtime and add setting for ignoring passive actions (default: false)

## [0.7.15] 2020-09-22
### Bugfix
- SFRPG - recognise professions for skills

## [0.7.14] 2020-09-16
### Bugfix
- MagicItemExtender - embarrassingly failed to apply De Morgan's law properly when checking null inventory

## [0.7.13] 2020-09-16
### Bugfix
- PF2e - Something I don't understand with skill checks was failing

## [0.7.12] 2020-09-16
### Bugfix
- HUD would fail to load on characters where magic item was the only item and it had no activation cost.

## [0.7.11] 2020-09-15
### Bugfix
- Try to suppress worldtransform error (didn't do anything bad, was just annoying)

### Changed
- DND5e - if a token has 0 in a stat (e.g. vehicles in wisdom) then that save or ability will not be displayed while selected

## [0.7.10] 2020-09-15
### Bugfix
- DND5e - continue trying to fix multiple token selection.

## [0.7.9] 2020-09-14
### Bugfix
- DND5e - support for multiple tokens were not working when Item-Macro was active.

## [0.7.8] 2020-09-12
### Bugfix
- Forgot to add Item-Macro roll support, only added the actions.

## [0.7.7] 2020-09-12
### Changed
- Moved support for Item-Macro to all systems. Now conducts a generic check to see if the module is running.

## [0.7.6] 2020-09-10
### Nothing
- Trying to fix a bug but it has no effect.

## [0.7.5] 2020-09-10
### Bugfix
- DND5e consumables should no longer be shown twice, once in consumables and once in inconsumables

## [0.7.4] 2020-09-10
### Bugfix
- Brazilian Portuguese now correctly referenced in the module.json.

## [0.7.3] 2020-08-26
### Bugfix
- PF2E - Spell heightening wasn't working

## [0.7.2] 2020-08-26
### Bugfix
- PF2E - NPC strike bonus information should now calculate more correctly

## [0.7.1] 2020-08-26
### Changed
- The HUD can now be repositioned even when hovering is enabled.

## [0.7.0] 2020-08-25
### Bugfix
- Hopefully reduced chance of additional categories not being deleted properly

### Added
- DND5e - Added ability to select multiple tokens and roll checks and saves, as well as toggle their visibility (combat toggling will come later, at the moment there is a Foundry bug preventing its implementation)

## [0.6.14] 2020-08-23
### Bugfix
- Added further Korean localization

## [0.6.13] 2020-08-23
### Bugfix
- DND5e Magic Items: Don't show category if it is empty

## [0.6.12] 2020-08-19
### Bugfix
- WFRP: skill filter had disappeared with the addition of compendiums, so readding filter on skill subcategories

## [0.6.11] 2020-08-19
### Added
- DND5e: Added Midi QoL support via the Core Roller.

## [0.6.10] 2020-08-18
### Bugfix
- DungeonWorld GM compendiums were not being shown

## [0.6.9] 2020-08-17
### Added
- SFRPG: add additional information to items (capacity, uses, quantity, usages)
- SFRPG: add spell information (and setting to disable if desired)

## [0.6.8] 2020-08-17
### Added
- SFRPG: icons to distinguish non-action actions (if you have better icon suggestions, let me know)

## [0.6.7] 2020-08-17
### Added
- DND5e: icons to distinguish non-action actions

## [0.6.6] 2020-08-17
### Added
- PF2E: Add tracking for dying, wounded, and doomed in utility menu (left-click increments, right-click decrements)

## [0.6.5] 2020-08-16
### Added
- PF2E: Show action cost for spells (those with a cost of three actions or less)

### Changed
- HUD title should only be displayed for actors with actions (e.g., not loot or hazard tokens)

## [0.6.4] 2020-08-16
### Bugfixes
- Custom subcategories weren't clearing from the HUD properly

## [0.6.3] 2020-08-16
### Added
- Merged in further Korean localization thanks to drdwing

## [0.6.2] 2020-08-15
### Bugfixes
- WFRP: Hide 'blank' icon

## [0.6.0] 2020-08-15
### Bugfixes
- WFRP: Action List builder was breaking because it was missing reference to settings

## [0.6.0] 2020-08-15
### Bugfixes
- Probably the opposite, be careful updating and don't do it before a game.

### Added
- Icons for some abilities (Pf2e: action usage; DND5e: proficiency)
- Images for things that support images (can be disabled in settings)
- Ability to add new categories and subcategories, to use compendiums and macros (pretty experimental at this stage and totally unsortable)
- Other stuff

### Changed
- A lot of behind the scenes stuff. Please report any bugs.

## [0.5.24] 2020-08-13
### Bugfix
- HUD Title was display token's sheet's name not the token's name itself.

## [0.5.23] 2020-08-12
### Bugfix
- PF2E: NPCs with no strikes with additional effects weren't rendering HUD.

## [0.5.22] 2020-08-11
### Bugfix
- PF2E: NPCs without actions weren't rendering HUD

## [0.5.21] 2020-08-09
### Bugfix
- PF2E: Strikes with non-default MAPs had the wrong attack bonus shown.

## [0.5.20] 2020-08-06
### Added
- Setting for always showing HUD (show's user's assigned character) as long as token is somewhere in scene.
- Setting for displaying a HUD title, which by default is the token's alias.

## [0.5.19] 2020-08-06
### Added
- Japanese localization for DND5e and Pathfinder

## [0.5.18] 2020-08-04
### Bugfix
- Fix for Item-Macro token actors

## [0.5.17] 2020-08-01
### Bugfix
- Fixed bug where feats and spells weren't being correctly sent to Item Macro.

## [0.5.16] 2020-08-01
### Bugfix
- Fixed bug where filename in the wrong case caused error on case-sensitive filesystems.

## [0.5.15] 2020-08-01
### Added
- DND5e: support for [Kekilla's Item Macro module](https://github.com/Kekilla0/Item-Macro)

## [0.5.14] 2020-07-30
### Bugfix
-DND5e forgot to include shfitkey check in betterrolls item roll, which was causing error.

## [0.5.13] 2020-07-29
### Changed
- DND5e: removed right click for versatile ability in BetterRoll and Minor QoL handlers in favour of alt + right-click and ctrl + right-click to bring up damage and attack roll modals, respectively.

## [0.5.12] 2020-07-27
### Bugfix
- DND5e: fixed error for actors with magic item mod enabled but no magic items.

## [0.5.11] 2020-07-26
### Added
- Added further KO localization from drdwing

## [0.5.10] 2020-07-25
### Added
- Added missing method causing exception when checking compendiums

## [0.5.9] 2020-07-23
### Added
- French localization thanks to LeRatierBretonnien

## [0.5.8] 2020-07-23
### Changed
- PF2E moved hero points to top of utility category

## [0.5.7] 2020-07-23
### Added
- PF2E added utility category

## [0.5.6] 2020-07-23
### Added
- HUD should now try to resize itself if it has too many rows or columns, or hits the edge of the screen.

## [0.5.5] 2020-07-22
### Bugfix
- WFRP had misnamed method which was preventing loading of action list

### Added
- DND5e: added tools to inventory

## [0.5.4] 2020-07-19
### Added
- DND5e: Added a utility category (rests, death saves, toggles)

## [0.5.3] 2020-07-19
### Bugfix
- PF2E: Managed to break NPC actions

## [0.5.2] 2020-07-18
### Bugfix
- Misnamed method during update.

## [0.5.1] 2020-07-18
### Bugfix, naturally
- Fixed bug where third-party modules were not appearing because I was looking in the wrong place for the title

## [0.5.0] 2020-07-18
### Bugfix
- BetterRolls - alt key should now perform alt roll

### Added 
- Add support for Simone's Magic Items module

### Changed
- PF2E - renamed feats to features

## [0.4.15] 2020-07-17
### Bugfix
- DND5e: Bug in showing combined ability/save checks
- Typo in Spanish localization

### Added
- SFRPG support: Thanks to Rainer#5041

## [0.4.14] 2020-07-16
### Bugfix
- Fix bug where HUD wouldn't appear for default token ownership, only explicit ownership.

## [0.4.13] 2020-07-15
### Bugfix
- DND5e: in some cases it seems spell slot information was null and it was causing the HUD to break

## [0.4.12] 2020-07-15
### Bugfix
- DND5e/BetterRolls - chose a better method to use on the BetterRoll API to roll Items

## [0.4.11] 2020-07-14
### Added
- DND5e - option to show empty items and spells
- PF2e - correctly label level 0 spells as cantrips, and remove [-] expend option from prepared cantrips

## [0.4.10] 2020-07-12
### Bugfix
- DND5e: Incorrectly named variable causing HUD to fail when abilities and saves combined.

## [0.4.9] 2020-07-12
### Bugfix
- DND5e: Incorrect comparison for spell uses caused spells with uses not to show.

## [0.4.8] 2020-07-12
### Added
- DND5e: Extended functionality of recharging '(recharge)' item on click to BetterRolls and MinorQOL roll handlers.

## [0.4.7] 2020-07-11
### Added
- PF2E: ability to expend prepared spells from HUD
- PF2E: ability to increase or decrease focus points and spell slots from HUD.

### Bugfix
- PF2e: Heightened spells now cast correctly from HUD generated spell cards
- PF2e: NPC strikes sometimes had wrong attack bonus displayed

## [0.4.6] 2020-07-11
### Bugfix
- User repositioning fix

## [0.4.5] 2020-07-10
### Changed
- Add some missing keys to localizations, just in English until translations are provided
- Update tagify

## [0.4.4] 2020-07-10
### Changed
- Make filter icon less intrusive when used

## [0.4.3] 2020-07-10
### Bugfix
- PF2E - fix rolling damage from PCs' strikes

## [0.4.2] 2020-07-10
### Added
- Merged improved pt-BR localization

## [0.4.1] 2020-07-10
### Bugfix
- Correct CSS

## [0.4.0] 2020-07-10
### Bugfix
- PF2e: NPC strike MAP was undefined when added

### Added
- Probably a few bugs.
- Beginnings of localization for Korean, Brazilian Portuguese, and Spanish.
- a filter manager should categories require filtering
- WFRP: filter manager implemented for skills (right-click on skills to bring up dialog)

### Changed
- Internally quite a bit, so please report any bugs and I'm sorry in advance.

## [0.3.5] 2020-07-04
### Added
- Added support for internationalization

## [0.3.4] 2020-07-05
### Bugfix
- DND5e: Fixed bug where resources were being incorrectly read

## [0.3.3] 2020-07-05
### Changed
- WFRP4e: Improved support and added more categories

## [0.3.2] 2020-07-04
### Bugfix
- PF2E: Actions weren't showing for PCs

### Added
- PF2E: setting between sending spell card to chat or using left and right click to roll attack and damage (with shift left-click and control right-click for bonus dialog)

## [0.3.1] 2020-07-02
### Bugfix
- PF2E: fix double minus in front of negative monster MAP
- DND5E: correctly allow cantrips through the nonpreparable filter

### Added
- Dungeon World: Support for PCs, NPCs, and GMs

### Changed
- Add transparent border to catalogue buttons to prevent movement (thanks to ZBell)
- PF2E: Improve MAP logic for PCs
- PF2E: re-add weapons to items until shift damage click is fixed.

## [0.3.0] 2020-07-01
### Changed
- PF2E - separated NPC and PC action list logic into their own classes.

## [0.2.10] 2020-07-01
### Bugfix
- Reorganised initialisation logic to prevent players having to deselec then reselect their token to see the HUD.

## [0.2.9] 2020-07-01
### Bugfix
- PF2E - iterating over some attributes caused the HUD to fail.

### Changed
- PF2E - improved support for spells

## [0.2.8] 2020-06-30
### Added
- Further support for PF2E including NPC attacks and spells organised by level and type

## [0.2.7] 2020-06-30
### Added
- PF2E support

## [0.2.6] 2020-06-28
### Bugfix
- Forgot to break switch for handlers manager.

## [0.2.5] 2020-06-28
### Added
- PF2E: Added first stage of implementation for Pathfinder 2E. A lot of things aren't implemented in PF2E yet, so this isn't quite as feature-rich as DND5e.

## [0.2.4] 2020-06-26
### Bugfix
- DND5e: all BetterRoll weapon attacks were going through rollItem not quickRoll, but only a right-click versatile attack should go via rollItem.

## [0.2.3] 2020-06-26
### Bugfix
- DND5e: Pact slots weren't being shared with other spell levels or vice-versa

### Changed
- DND5e: spells that are on a use-per-day/short-rest/etc. basis are now filtered out if they're expended.

## [0.2.2] 2020-06-25
### Bugfix
- Missed one of the ability check renames

## [0.2.1] 2020-06-25
### Changed
- Removed some excess logging.
- DND5e: Renamed Ability Tests to Ability Checks.
- DND5e: Add choice of showing VSM/C/R info next to spells.

## [0.2.0] 2020-06-25
### Added
- DND5e: add choice of showing all nonprepared spells (innate, pact, at-will, always prepared), or hiding based on their 'prepared'-ness.

## [0.1.20] 2020-06-25
### Bugfix
- Choice of roll handler was not sticking due to some poor logic.

### Changed
- Added some shadows to info fields on categories to make them more visible against similarly coloured backgrounds.

## [0.1.19] 2020-06-24
### Bugfix
- Default to the core role handler for each system if the third-party module is unavailable.
- DND5e: Fixed spell slot check. Now shows spells when there are higher-level slots available to upcast.
- DND5e: Don't display items with no quantity.

### Changed
- Tried to remove some unnecessary logging when debug mode enabled.
- Removed some cruft.

## [0.1.18] 2020-06-22
### Added
- DND5e - the order of feats and items now follows their draggable order in the inventory.

### Changed
- CSS - changed appearance of info next to subcategory name (currently only used to indicate spell slots).
- DND5e - spells should now be sorted by level and then alphabetically.

## [0.1.17] 2020-06-21
### Added
- MinorQOL & BetterRolls - added ability to right click weapons for versatile attack when one exists (right-click acts as normal click if item has no versatile property). Has a slight problem with BetterRolls which uses shift for advantage, because shift right click is hardcoded to bring up the context menu in some browsers, but I don't want to mess with BR's shift/ctrl/alt preferences.

### Changed
- Renamed some CSS classes because they were really long.
- Renamed consumables without charges to 'incomsumables'.
- Filtered consumables of type 'ammo' out of list, but their count should show in curly braces when assigned to a weapon.

## [0.1.16] 2020-06-20
### Changed
- Updated CSS for buttons because they were being overridden by the Alt5e sheet.

## [0.1.15] 2020-06-20
### Added
- Agnostic - basic hovering, adapted from Token Tooltip, borrowed from Kekilla's issues tracking
- DND5e - ability to abbreviate skills and abilities, suggested by Tercept
- DND5e - option to separate ability tests and saves, suggested by Tercept
- Changelog, we'll see how long I keep this up.
- Updated readme

### Changed
- DND5e roll handlers now extend the core DND5e roll handler rather than the base class