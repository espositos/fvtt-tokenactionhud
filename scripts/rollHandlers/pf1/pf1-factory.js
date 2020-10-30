import { RollHandlerBasePf1 as Core} from './pf1-base.js'
import { HandlersManager } from '../../handlersManager.js';

export function getRollHandler(rollHandler = '') {
    let handler;
    switch (rollHandler) {
        case "core":
        default:
            handler = new Core();
            break;
    }

    return handler;
}