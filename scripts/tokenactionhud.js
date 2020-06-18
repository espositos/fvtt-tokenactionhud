import {Logger, settings, getSetting, setSetting} from "./settings.js";

export class TokenActionHUD extends Application {
    constructor(actions, rollHandler) {
        super();
        this.refresh_timeout = null;
        this.tokens = null;
        this.actions = actions;
        this.rollHandler = rollHandler;
    }

    setTokensReference(tokens) {
        this.tokens = tokens;
        return this;
    }

    trySetUserPos() {
        if(!(game.user.data.flags.tokenactionhud && game.user.data.flags.tokenactionhud.hudPos))
            return;

        let pos = game.user.data.flags.tokenactionhud.hudPos;
        
        return new Promise(resolve => {
            function check() {
                let elmnt = document.getElementById("token-action-hud")
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
        template: "/modules/token-action-hud/templates/template.hbs",
        id: "token-action-hud",
        classes: [],
        width: 200,
        height: 20,
        left: 150,
        top: 80,
        scale: 1,
        popOut: false,
        minimizable: false,
        resizable: false,
        title: "token-action-hud",
        dragDrop: [],
        tabs: [],
        scrollY: []
        });
    }

    /** @override */
    getData(options = {}) {
        const data = super.getData();
        data.actions = this.targetActions;
        data.id = "token-action-hud";
        Logger.debug(data);
        return data;
    }

    /** @override */
    activateListeners(html) {
        const tokenactionhud = '#token-action-hud';
        const repositionIcon = '#token-action-hud-reposition';
        const action = '.token-action-hud-action';   

        html.find(action).on('click', e => {
            Logger.debug(e);

            let target = e.target;

            if (target.tagName !== "BUTTON")
                target = e.currentTarget.children[0];

            let value = target.value;
            try {
                this.rollHandler.handleActionEvent(e, value);
            } catch (error) {
                Logger.error(e);
            }
        });

        html.find(repositionIcon).mousedown(ev => {
            ev.preventDefault();
            ev = ev || window.event;

            let hud = $(document.body).find(tokenactionhud);
            let marginLeft = parseInt(hud.css('marginLeft').replace('px', ''));
            let marginTop = parseInt(hud.css('marginTop').replace('px', ''));

            dragElement(document.getElementById('token-action-hud'));
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
                    Logger.info(`Setting position to x: ${xPos}px, y: ${yPos}px, and saving in user flags.`)
                    game.user.update({flags: {'tokenactionhud':{ 'hudPos': {top: yPos, left: xPos}}}})
                }
            }
        });
    }

    update() {
        // Delay refresh because switching tokens could cause a controlToken(false) then controlToken(true) very fast
        if (this.refresh_timeout)
            clearTimeout(this.refresh_timeout)
        this.refresh_timeout = setTimeout(this.updateHud.bind(this), 100)
    }

    async updateHud() {
        Logger.debug("Updating HUD");

        let token = this._getTargetToken(this.tokens.controlled);
        
        this.targetActions = this.actions.buildActionList(token);

        if (!getSetting(settings.enabledForUser)) {
            this.close();
            return;
        }

        this.render(true);
    }

    shouldUpdateOnControlTokenChange() {
        Logger.debug("token change, checking controlled length");
        Logger.debug(`${this.tokens.controlled.length} controlled tokens.`);

        let controlled = this.tokens.controlled;

        return controlled.length === 1 && controlled[0];
    }

    shouldUpdateOnActorOrItemUpdate(actor) {
        Logger.debug(`actor change, comparing actors`);
        Logger.debug(`actor._id: ${actor._id}; this.targetActions.actorId: ${this.targetActions?.actorId}`);

        if (!actor) {
            Logger.debug("No actor, possibly deleted, should update HUD.");
            return true;
        }
            
        if (this.targetActions && actor._id === this.targetActions.actorId) {
            Logger.debug("Same IDs, should update HUD.");
            return true;
        }

        return false;
    }

    /** @private */
    _getTargetToken(controlled) {
        if (controlled.length != 1)
            return null;

        let ct = controlled[0];

        if (!ct)
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