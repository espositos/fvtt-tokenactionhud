import { BitDSystemManager } from './bitd.js';
import { Dnd5eSystemManager } from './dnd5e.js';
import { DemonlordSystemManager } from './demonlord.js';
import { DungeonWorldSystemManager } from './dungeonworld.js';
import { Pf1SystemManager } from './pf1.js';
import { D35ESystemManager } from './d35e.js';
import { Pf2eSystemManager } from './pf2e.js';
import { SfrpgSystemManager } from './sfrpg.js';
import { Sw5eSystemManager } from './sw5e.js';
import { Wfrp4eSystemManager } from './wfrp4e.js';
import { LancerSystemManager } from './lancer.js';
import { SwadeSystemManager } from './swade.js';
import { StarWarsFFGSystemManager } from './starwarsffg.js';
import { Tormenta20SystemManager } from './tormenta20.js';
import { SymbaroumSystemManager } from './symbaroum.js';

export class SystemManagerFactory {
    static create(system, appName) {
        switch(system) {
            case 'blades-in-the-dark':
                return new BitDSystemManager(appName);
            case 'demonlord':
                return new DemonlordSystemManager(appName);
            case 'dnd5e':
                return new Dnd5eSystemManager(appName);
            case 'dungeonworld':
                return new DungeonWorldSystemManager(appName);
            case 'pf1':
                return new Pf1SystemManager(appName);
            case 'D35E':
                return new D35ESystemManager(appName);
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
            case 'swade':
                return new SwadeSystemManager(appName);
            case 'starwarsffg':
                return new StarWarsFFGSystemManager(appName);
			      case 'tormenta20':
				        return new Tormenta20SystemManager(appName);
            case 'symbaroum':
                return new SymbaroumSystemManager(appName);
        }
    }
}