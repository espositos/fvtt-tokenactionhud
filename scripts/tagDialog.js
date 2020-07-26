export class TagDialog extends Dialog {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);

    constructor(dialogData, options){
        super(options);
        this.data = dialogData;
    }
    
    // Currently only used for WFRP skill filter
    static showTagDialog(filterManager, categoryId) {
        let choices = filterManager.getSuggestions(categoryId);
        let filters = filterManager.getFilteredElements(categoryId);
        let tagify;
        Hooks.once('renderTagDialog', (app, html, options) => {

            html.css('height', 'auto');

            var $blocklist = html.find('select[id="isBlocklist"]')
            let blocklistChoice = filterManager.isBlocklist(categoryId) ? "1" : "0";
            $blocklist.val(blocklistChoice);
            $blocklist.css('background', '#fff')
            $blocklist.css('color', '#000')

            var $tagFilter = html.find('input[name="tokenactionhud-tagfilter"]');
            
            if ($tagFilter.length > 0) {
                let filterPlaceholder = game.i18n.localize('tokenactionhud.filterPlaceholder');

                tagify = new Tagify($tagFilter[0], {
                whitelist: choices,
                value: filters,
                placeholder: filterPlaceholder,
                delimiters: ';',
                maxTags: 'Infinity',
                dropdown: {
                    maxItems: 20,           // <- maxumum allowed rendered suggestions
                    classname: 'tags-look', // <- custom classname for this dropdown, so it could be targeted
                    enabled: 0,             // <- show suggestions on focus
                    closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
                }
                });

                tagify.addTags(filters);

                // "remove all tags" button event listener
                let clearBtn = html.find('button[class="tags--removeAllBtn"]');
                clearBtn.on('click', tagify.removeAllTags.bind(tagify))
                clearBtn.css('float', 'right');
                clearBtn.css('width', 'auto');

            }

        })

        let filterPlaceholder = game.i18n.localize('tokenactionhud.filterPlaceholder');
        let blocklistLabel = game.i18n.localize('tokenactionhud.blocklistLabel');
        let filterTitle = game.i18n.localize('tokenactionhud.filterTitle');
        let content = ` <div><label>${filterPlaceholder}</label></div>
                        <div><input name='tokenactionhud-tagfilter' class='some_class_name'/></div>
                        <div><button class="tags--removeAllBtn">Clear</button></div>
                        <select id='isBlocklist' name='blocklist' size='1'>
                            <option value="1">${game.i18n.localize('tokenactionhud.blocklist')}</option>
                            <option value="0">${game.i18n.localize('tokenactionhud.allowlist')}</option>
                        </select><label> ${blocklistLabel}</label>`
        let d = new TagDialog({
            title: filterTitle,
            content: content,
            buttons: {
             accept: {
              icon: '<i class="fas fa-check"></i>',
              label: game.i18n.localize("tokenactionhud.accept"),
              callback: (html) => {
                  let choices = tagify.value;
                  let isBlocklist = html.find('select[id="isBlocklist"]')[0].value
                  game.tokenActionHUD.submitFilter(categoryId, choices, isBlocklist);
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
    
    static showCompendiumDialog(compendiumManager) {
        let choices = filterManager.getCompendiumChoices();
        let filters = filterManager.getChosenCompendiums();

        let tagify;
        Hooks.once('renderTagDialog', (app, html, options) => {

            html.css('height', 'auto');

            var $tagFilter = html.find('input[name="tokenactionhud-tagfilter"]');
            
            if ($tagFilter.length > 0) {
                let filterPlaceholder = game.i18n.localize('tokenactionhud.filterPlaceholder');

                tagify = new Tagify($tagFilter[0], {
                whitelist: choices,
                value: filters,
                placeholder: filterPlaceholder,
                delimiters: ';',
                maxTags: 'Infinity',
                dropdown: {
                    maxItems: 20,           // <- maxumum allowed rendered suggestions
                    classname: 'tags-look', // <- custom classname for this dropdown, so it could be targeted
                    enabled: 0,             // <- show suggestions on focus
                    closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
                }
                });

                tagify.addTags(filters);

                // "remove all tags" button event listener
                let clearBtn = html.find('button[class="tags--removeAllBtn"]');
                clearBtn.on('click', tagify.removeAllTags.bind(tagify))
                clearBtn.css('float', 'right');
                clearBtn.css('width', 'auto');
            }

        })

        let filterPlaceholder = game.i18n.localize('tokenactionhud.filterPlaceholder');
        let filterTitle = game.i18n.localize('tokenactionhud.filterTitle');
        let content = ` <div><label>${filterPlaceholder}</label></div>
                        <div><input name='tokenactionhud-tagfilter' class='some_class_name'/></div>
                        <div><button class="tags--removeAllBtn">Clear</button></div>`
        let d = new TagDialog({
            title: filterTitle,
            content: content,
            buttons: {
                accept: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("tokenactionhud.accept"),
                callback: (html) => {
                    let choices = tagify.value;
                    game.tokenActionHUD.submitCompendiums(choices);
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

    static createCategoryDialog(categoryManager) {
        let selected = categoryManager.getSelectedCategories();
        let suggestions = categoryManager.getAvailableCategories();

        let prompt = game.i18n.localize('tokenactionhud.filterPlaceholder');
        let title = game.i18n.localize('tokenactionhud.filterTitle');
        let content = ` <div><label>${prompt}</label></div>
                        <div><input name='tokenactionhud-taginput' class='some_class_name'/></div>
                        <div><button class="tags--removeAllBtn">Clear</button></div>`

        TagDialog.showDialog(suggestions, selected, title, content, prompt)
    }

    static showCategoryDialog(compendiumManager) {
        let existingCategories = compendiumManager.getExistingCategories();
        let prompt = game.i18n.localize('tokenactionhud.filterPlaceholder');
        let title = game.i18n.localize('tokenactionhud.filterTitle');
        let content = ` <div><label>${prompt}</label></div>
                        <div><input name='tokenactionhud-taginput' class='some_class_name'/></div>
                        <div><button class="tags--removeAllBtn">Clear</button></div>`
        let submitFunc = (choices) => {
            game.tokenActionHUD.submitCategories(choices);
        }
        this.showDialog(null, existingCategories, title, content, prompt, submitFunc)
    }
    
    static showDialog(suggestions, selected, title, content, prompt, submitFunc) {
        let tagify;
        Hooks.once('renderTagDialog', (app, html, options) => {

            html.css('height', 'auto');

            var $taglist = html.find('input[name="tokenactionhud-taginput"]');
            
            if ($taglist.length > 0) {
                let options = {
                    placeholder: prompt,
                    delimiters: ';',
                    maxTags: 'Infinity',
                    dropdown: {
                        maxItems: 20,           // <- maxumum allowed rendered suggestions
                        classname: 'tags-look', // <- custom classname for this dropdown, so it could be targeted
                        enabled: 0,             // <- show suggestions on focus
                        closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
                    }
                }

                if (suggestions)
                    options.whitelist = suggestions;

                tagify = new Tagify($taglist[0], options);

                if (selected)
                    tagify.addTags(selected);

                // "remove all tags" button event listener
                let clearBtn = html.find('button[class="tags--removeAllBtn"]');
                clearBtn.on('click', tagify.removeAllTags.bind(tagify))
                clearBtn.css('float', 'right');
                clearBtn.css('width', 'auto');
            }
        })
        
        let d = new TagDialog({
            title: title,
            content: content,
            buttons: {
                accept: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("tokenactionhud.accept"),
                callback: (html) => {
                    let selection = tagify.value;
                    submitFunc(selection);
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

    /** @override */
    _onKeyDown(event) {
        // Close dialog
        if ( event.key === "Escape" ) {
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