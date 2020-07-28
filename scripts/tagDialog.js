import { CompendiumHelper } from './actions/compendiums/compendiumHelper.js';

export class TagDialog extends Dialog {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);

    constructor(dialogData, options){
        super(options);
        this.data = dialogData;
    }
    
    static showDialog(suggestions, selected, title, hbsData, submitFunc) {
        let tagify = this._prepareHook(suggestions, selected, indexChoice);
        
        let content = Handlebars.dosomething(hbsData, template);

        let d = new TagDialog({
            title: title,
            content: content,
            buttons: {
                accept: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("tokenactionhud.accept"),
                callback: (html) => {
                    let selection = tagify.value.map(c => {return {id: c.id, value: c.value}});
                    let index = html.find('select[id="index"]')[0];
                    let indexValue = index?.value;
                    submitFunc(selection, indexValue);
                }
                },
                cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("tokenactionhud.cancel")
                }
            },
            default: 'accept',
        });

        d.render(true);
    }

    _prepareHook(choices, selection, placeholder, indexChoice) {
        let tagify;
        Hooks.once('renderTagDialog', (app, html, options) => {

            html.css('height', 'auto');

            var $index = html.find('select[id="isBlocklist"]')
            if ($index) {
                $index.val(indexChoice);
                $index.css('background', '#fff')
                $index.css('color', '#000')
            }

            var $tagFilter = html.find('input[name="tokenactionhud-taginput"]');
            
            if ($tagFilter.length > 0) {

                tagify = new Tagify($tagFilter[0], {
                whitelist: choices,
                placeholder: placeholder,
                delimiters: ';',
                maxTags: 'Infinity',
                dropdown: {
                    maxItems: 20,           // <- maxumum allowed rendered suggestions
                    classname: 'tags-look', // <- custom classname for this dropdown, so it could be targeted
                    enabled: 0,             // <- show suggestions on focus
                    closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
                }
                });

                if (selection)
                    tagify.addTags(selection);

                // "remove all tags" button event listener
                let clearBtn = html.find('button[class="tags--removeAllBtn"]');
                clearBtn.on('click', tagify.removeAllTags.bind(tagify))
                clearBtn.css('float', 'right');
                clearBtn.css('width', 'auto');
            }
        })

        return tagify;
    }

    /** @override */
    _onKeyDown(event) {
        // Close dialog
        if ( event.key === "Escape" && !event.target.className.includes('tagify')) {
            event.preventDefault();
            event.stopPropagation();
            return this.close();
        }
    
        // Confirm default choice
        if ( (event.key === "Enter") && this.data.default && !event.target.className.includes('tagify')) {
            event.preventDefault();
            event.stopPropagation();
            const defaultChoice = this.data.buttons[this.data.default];
            return this.submit(defaultChoice);
        }
    }
}