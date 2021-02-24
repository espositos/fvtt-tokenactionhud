import * as settings from '../settings.js';

export function registerHandlerbars() {
    Handlebars.registerHelper('cap', function(string) {
        if (!string || string.length < 1)
            return '';
        return string[0].toUpperCase() + string.slice(1); 
    });
    
    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '!=':
                return (v1 != v2) ? options.fn(this) : options.inverse(this);
            case '!==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });
    
    Handlebars.registerHelper('activeText', function(block) {
        if (settings.get('activeCssAsText')) {
            return block.fn(this);
        }

        return block.inverse(this);
    });

    loadTemplates([
        'modules/token-action-hud/templates/category.hbs',
        'modules/token-action-hud/templates/subcategory.hbs',
        'modules/token-action-hud/templates/actionSet.hbs',
        'modules/token-action-hud/templates/action.hbs',
        'modules/token-action-hud/templates/tagdialog.hbs'
    ]);
}