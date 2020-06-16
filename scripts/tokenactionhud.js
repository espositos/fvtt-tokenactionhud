const log = (...args) => console.log("Token Action HUD | ", ...args);

export class TokenActionHUD extends Application {
    
    debug = true;
    alwaysRegenerateBar = true;
    globalListenersAdded = false;
    moduleDir = "modules/tokenActionHud/";
    defaultX = 150;
    defaultY = 80;

    constructor(actions) {
        super();
        this.refresh_timeout = null;
        this.tokens = null;
        this.actions = actions;
    }

    setTokensReference(tokens) {
        this.tokens = tokens;
        return this;
    }

    trySetUserPos() {
        if(!(game.user.data.flags.tokenActionHud && game.user.data.flags.tokenActionHud.hudPos))
            return;

        let pos = game.user.data.flags.tokenActionHud.hudPos;
        
        return new Promise(resolve => {
            function check() {
                let elmnt = document.getElementById("tokenActionHud")
                if (elmnt) {
                elmnt.style.bottom = null;
                elmnt.style.top = (pos.top) + "px";
                elmnt.style.left = (pos.left) + "px";
                elmnt.style.position = 'fixed';
                elmnt.style.zIndex = 100;
                resolve();
                } else {
                setTimeout(check, 30);
                }
            }
            check();
        });
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

        html.find(repositionIcon).mousedown(ev => {
            ev.preventDefault();
            ev = ev || window.event;

            let hud = $(document.body).find(tokenActionHud);
            let marginLeft = parseInt(hud.css('marginLeft').replace('px', ''));
            let marginTop = parseInt(hud.css('marginTop').replace('px', ''));

            dragElement(document.getElementById('tokenActionHud'));
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
            function dragElement(elmnt) {
                elmnt.onmousedown = dragMouseDown;

                function dragMouseDown(e) {
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
                    elmnt.style.top = (elmnt.offsetTop - pos2) - marginTop + "px";
                    elmnt.style.left = (elmnt.offsetLeft - pos1) - marginLeft + "px";
                    elmnt.style.position = 'fixed';
                    elmnt.style.zIndex = 100;
                }
            
                function closeDragElement() {
                    // stop moving when mouse button is released:
                    elmnt.onmousedown = null;
                    document.onmouseup = null;
                    document.onmousemove = null;
                    let xPos = (elmnt.offsetLeft - pos1) > window.innerWidth ? window.innerWidth : (elmnt.offsetLeft - pos1);
                    let yPos = (elmnt.offsetTop - pos2) > window.innerHeight-20 ? window.innerHeight-100 : (elmnt.offsetTop - pos2)
                    xPos = xPos < 0 ? 0 : xPos
                    yPos = yPos < 0 ? 0 : yPos
                    if(xPos != (elmnt.offsetLeft - pos1) || yPos != (elmnt.offsetTop - pos2)){
                        elmnt.style.top = (yPos) + "px";
                        elmnt.style.left = (xPos) + "px";
                    }
                    log(`Setting position to x: ${xPos}px, y: ${yPos}px`)
                    game.user.update({flags: {'tokenActionHud':{ 'hudPos': {top: yPos, left: xPos}}}})
                }
            }
        });
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

        let token = this._getTargetToken(this.tokens.controlled);
        
        this.targetActions = this.actions.buildActionList(token);

        this.render(true);
    }

    shouldUpdateOnControlTokenChange() {
        if (this.debug)
            log(`${this.tokens.controlled.length} tokens selected.`);

        let controlled = this.tokens.controlled;

        return controlled.length === 1 && controlled[0] != null && controlled[0] != undefined;
    }

    shouldUpdateOnActorOrItemUpdate(actor) {
        if (this.debug) {
            log(`updateActor detected, comparing actors`);
            log(actor._id, this.targetActions.actorId);
        }

        if (!actor)
            
        log (!!this.targetActions)
        log(actor._id === this.targetActions.actorId);
        if (this.targetActions && actor._id === this.targetActions.actorId) {
            log("should update")
            return true;
        }

        return false;
    }

    /** @private */
    _getTargetToken(controlled) {
        if (controlled.length != 1)
            return null;

        let ct = controlled[0];

        if (ct === null || ct === undefined)
            return null;

        if(this._userHasPermission(ct))
            return ct;
            
        return null;
    }

    /** @private */
    _userHasPermission(token = "") {
        return game.user.isGM || token.actor.data.permission[game.userId] === 3;
    }
}