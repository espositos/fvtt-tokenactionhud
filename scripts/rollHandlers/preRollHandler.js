import * as settings from '../settings.js';
import { RollHandler } from './rollHandler.js';

/* 
 * Used for adding support for actions not part of the core functions.
 * Returns true from prehandleActionEvent() if it can perform an action and stops
 * further actions being performed. 
 */
export class PreRollHandler extends RollHandler {
    constructor() {super();}

    prehandleActionEvent(event, encodedValue) { return false; }
}