export class TagDialog extends Dialog {
    constructor(dialogData, options){
        super(options);
        this.data = dialogData;
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
        if ( (event.key === "Enter") && this.data.default && !event.target.name?.includes('tagify')) {
            event.preventDefault();
            event.stopPropagation();
            const defaultChoice = this.data.buttons[this.data.default];
            return this.submit(defaultChoice);
        }
    }
}