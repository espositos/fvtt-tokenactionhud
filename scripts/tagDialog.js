export class TagDialog extends Dialog {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);
    tagify = null;

    constructor(dialogData, options){
        super(options);
        this.data = dialogData;
    }
    
    static showDialog(suggestions, selected, indexChoice, title, hbsData, submitFunc) {
        TagDialog._prepareHook(suggestions, selected, indexChoice);
        
        let template = Handlebars.compile('{{> modules/token-action-hud/templates/tagdialog.hbs}}');
        let content = template(hbsData);

        let d = new TagDialog({
            title: title,
            content: content,
            buttons: {
                accept: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("tokenactionhud.accept"),
                callback: (async (html) => {
                    let selection = TagDialog.tagify.value.map(c => {return {id: c.id, value: c.value, type: c.type}});
                    let index = html.find('select[id="token-action-hud-index"]');
                    let indexValue;
                    if (index.length > 0)
                        indexValue = index[0]?.value;
                    await submitFunc(selection, indexValue);
                })
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

    static _prepareHook(choices, selection, indexChoice) {
        Hooks.once('renderTagDialog', (app, html, options) => {

            html.css('height', 'auto');

            var $index = html.find('select[id="token-action-hud-index"]')
            if ($index.length > 0) {
                if (indexChoice)
                    $index.val(indexChoice);

                $index.css('background', '#fff')
                $index.css('color', '#000')
            }

            var $tagFilter = html.find('input[class="token-action-hud-taginput"]');
            
            if ($tagFilter.length > 0) {

                let options = {
                    delimiters: ';',
                    maxTags: 'Infinity',
                    dropdown: {
                        maxItems: 20,           // <- maxumum allowed rendered suggestions
                        classname: 'tags-look', // <- custom classname for this dropdown, so it could be targeted
                        enabled: 0,             // <- show suggestions on focus
                        closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
                    }
                }

                if (choices)
                    options.whitelist = choices;

                TagDialog.tagify = new Tagify($tagFilter[0], options);

                var $tagifyBox = $(document).find('.tagify');

                $tagifyBox.css('background', '#fff')
                $tagifyBox.css('color', '#000')

                if (selection)
                    TagDialog.tagify.addTags(selection);

                // "remove all tags" button event listener
                let clearBtn = html.find('button[class="tags--removeAllBtn"]');
                clearBtn.on('click', TagDialog.tagify.removeAllTags.bind(TagDialog.tagify))
                clearBtn.css('float', 'right');
                clearBtn.css('width', 'auto');
            }
        })
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