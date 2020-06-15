const log = (...args) => console.log("Token Action HUD | ", ...args);

export class TokenActionHUD extends Application {
    
    debug = true;
    alwaysRegenerateBar = true;
    globalListenersAdded = false;
    moduleDir = "modules/tokenActionHud/";

    constructor(actions) {
        super();
        this.refresh_timeout = null;
        this.tokens = null;
        this.actions = actions;
        this.rollItemMacro = (event, actorId, itemId) => macros.rollItemMacro(event, actorId, itemId);
        this.rollAbilityMacro = (event, actorId, checkId) => macros.rollAbilityMacro(event, actorId, checkId);
        this.rollSkillMacro = (event, actorId, checkId) => macros.rollSkillMacro(event, actorId, checkId);
    }

    setTokensReference(tokens) {
        this.tokens = tokens;
        return this;
    }

    static path(filepath) {
        return this._modDir + filepath;
    }

    /** @override */
    static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
        template: "/modules/tokenActionHud/templates/template.hbs",
        id: "tokenActionHud",
        classes: [],
        width: 200,
        height: 20,
        left: 150,
        top: 80,
        scale: 1,
        popOut: false,
        minimizable: false,
        resizable: false,
        title: "tokenActionHud",
        dragDrop: [],
        tabs: [],
        scrollY: []
        });
    }

    /** @override */
    getData(options = {}) {
        const data = super.getData();
        data.actions = this.targetActions;
        data.id = "tokenActionHud";
        return data;
    }

    /** @override */
    activateListeners(html) {
        const tokenActionHud = '#tokenActionHud';
        const repositionIcon = '#tokenActionHud-reposition';
        const action = '.tokenActionHud-action';
        const closeIcon = '#tokenActionHud-close';      

        html.find(action)
        html.find(action).on('click', e => {
            let value = e.target.value;
            this.actions.handleButtonClick(e, value);
        });

        html.find(repositionIcon).mousedown(e => {
            e.preventDefault();
            e.stopPropagation();

            e = e || window.event;
            console.log($(document.body).find(tokenActionHud));

            dragElement($(document.body).find(tokenActionHud));
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

            function dragElement(elmnt) {
                console.log(elmnt);
                elmnt.onmousedown = dragMouseDown;

                function dragMouseDown(e) {
                    console.log("dragging element");
                    e = e || window.event;
                    e.preventDefault();
                    pos3 = e.clientX;
                    pos4 = e.clientY;

                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;

                    
                }

                function elementDrag(e) {
                    e = e || window.event;
                    e.preventDefault();
                    // calculate the new cursor position:
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    // set the element's new position:
                    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                    elmnt.style.position = 'fixed';
                    elmnt.style.zIndex = 100;
                }

                function closeDragElement() {
                    console.log("closing drag element");

                    // stop moving when mouse button is released:
                    elmnt.onmousedown = null;
                    document.onmouseup = null;
                    document.onmousemove = null;
                    let xPos = (elmnt.offsetLeft - pos1) > window.innerWidth ? window.innerWidth : (elmnt.offsetLeft - pos1);
                    let yPos = (elmnt.offsetTop - pos2) > window.innerHeight - 20 ? window.innerHeight - 100 : (elmnt.offsetTop - pos2)
                    xPos = xPos < 0 ? 0 : xPos
                    yPos = yPos < 0 ? 0 : yPos
                    if (xPos != (elmnt.offsetLeft - pos1) || yPos != (elmnt.offsetTop - pos2)) {
                        elmnt.style.top = (yPos) + "px";
                        elmnt.style.left = (xPos) + "px";
                    }
                    log(`setting position x: ${xPos}px, y: ${yPos}px`)
                    game.user.update({ flags: { 'tokenActionHud': { 'hudPos': { top: yPos, left: xPos } } } })
                }
            }
        });

        if (this.globalListenersAdded)
            return;

        $(document.body).on('click.tokenActionHud', e => {
            if (this.debug) {
                log("caught click");       
                console.log(e);
            }

            let target = e.target.id;
            console.log(e);

            if (this.alwaysRegenerateBar) {
                 this.update();
            }
        });

        this.globalListenersAdded = true;
    }

    /** @private */
    _clickDropdownContent(event) {
        let value = event.target.value;
        if (value === undefined || value === "")
            return;

        this.actions.handleButtonClick(event, value);
    }

    update() {
        // Delay refresh because switching tokens could cause a controlToken(false) then controlToken(true) very fast
        if (this.refresh_timeout)
            clearTimeout(this.refresh_timeout)
        this.refresh_timeout = setTimeout(this.updateHud.bind(this), 100)
    }

    async updateHud() {
        if (this.debug)
            log("Updating HUD")

        let targetActor = this._getTargetActor(this.tokens.controlled);
        
        this.targetActions = this.actions.buildActionList(targetActor);

        this.render(true);
    }

    shouldUpdateOnControlTokenChange() {
        if (this.debug)
            log(`${this.tokens.controlled.length} tokens selected.`);

        return controlled.length === 1 && controlled[0] != null && controlled[0] != undefined;
    }

    shouldUpdateOnActorUpdate(actor) {
        if (this.debug)
            log(`updateActor detected, comparing actors`);
            
        if (this.targetActions !== null && actor._id === this.targetActions.actorId)
            return true;

        return false;
    }

    /** @private */
    _getTargetActor(controlled) {
        if (controlled.length != 1)
            return null;

        let ct = controlled[0];

        if (ct === null || ct === undefined)
            return null;

        if(this._userHasPermission(ct))
            return ct.actor;
            
        return null;
    }

    /** @private */
    _userHasPermission(token = "") {
        return game.user.isGM || token.actor.data.permission[game.userId] === 3;
    }
}