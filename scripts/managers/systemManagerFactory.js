import { Dnd5eSystemManager } from './dnd5e.js';
import { DemonlordSystemManager } from './demonlord.js';
import { DungeonWorldSystemManager } from './dungeonworld.js';
import { Pf1SystemManager } from './pf1.js';
import { Pf2eSystemManager } from './pf2e.js';
import { SfrpgSystemManager } from './sfrpg.js';
import { Sw5eSystemManager } from './sw5e.js';
import { Wfrp4eSystemManager } from './wfrp4e.js';
import { LancerSystemManager } from './lancer.js';

export class SystemManagerFactory {
    static create(system, appName) {
        switch(system) {
            case 'demonlord':
                return new DemonlordSystemManager(appName);
            case 'dnd5e':
                return new Dnd5eSystemManager(appName);
            case 'dungeonworld':
                return new DungeonWorldSystemManager(appName);
            case 'pf1':
                return new Pf1SystemManager(appName);
            case 'pf2e':
                return new Pf2eSystemManager(appName);
            case 'sfrpg':
                return new SfrpgSystemManager(appName);
            case 'sw5e':
                return new Sw5eSystemManager(appName);
            case 'wfrp4e':
                return new Wfrp4eSystemManager(appName);
            case 'lancer':
                return new LancerSystemManager(appName);
        }
    }
}