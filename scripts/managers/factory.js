import {Dnd5eSystemManager} from './dnd5e.js';

export function create(system, appName) {
    switch(system) {
        case 'dnd5e':
            return new Dnd5eSystemManager(appName);
    }
}