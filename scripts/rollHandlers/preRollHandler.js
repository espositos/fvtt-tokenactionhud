import * as settings from '../settings.js';
import { RollHandler } from './rollHandler.js';

export class PreRollHandler extends RollHandler {
    constructor() {super();}

    prehandleActionEvent(event, encodedValue) {}
}