# Changelog

## [0.5.8] 2021-07-23
### Changed
- PF2E moved hero points to top of utility category

## [0.5.7] 2021-07-23
### Added
- PF2E added utility category

## [0.5.6] 2021-07-23
### Added
- HUD should now try to resize itself if it has too many rows or columns, or hits the edge of the screen.

## [0.5.5] 2021-07-22
### Bugfix
- WFRP had misnamed method which was preventing loading of action list

### Added
- DND5e: added tools to inventory

## [0.5.4] 2021-07-19
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