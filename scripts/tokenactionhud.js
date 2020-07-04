import * as settings from "./settings.js";
import { HandlersManager } from "./handlersManager.js";

export class TokenActionHUD extends Application {
    constructor(actions, rollHandler) {
        super();
        this.refresh_timeout = null;
        this.tokens = null;
        this.actions = actions;
        this.rollHandler = rollHandler;
    }

    updateSettings() {
        this.updateRollHandler();
        this.update();
    }

    updateRollHandler() {
        let handlerId = settings.get('rollHandler');
        let system = game.data.system.id;
        this.rollHandler = HandlersManager.getRollHandler(system, handlerId);
    }

    setTokensReference(tokens) {
        this.tokens = tokens;
    }

    trySetPos() {
        if (!(this.targetActions && this.targetActions.tokenId))
            return;

        if (settings.get('onTokenHover')) {
            function hoverPos(token) {
                return new Promise(resolve => {
                    function check(token) {
                        let elmnt = $('#token-action-hud');
                        if (elmnt) {
                            elmnt.css('bottom', null);
                            elmnt.css('left', (token.worldTransform.tx + (((token.data.width * canvas.dimensions.size) + 55) * canvas.scene._viewPosition.scale)) + 'px');
                            elmnt.css('top', (token.worldTransform.ty + 0) + 'px');
                            elmnt.css('position', 'fixed');
                            elmnt.css('zIndex', 100);
                            resolve();
                        } else {
                            setTimeout(check, 30);
                        }
                    }
                    check(token);
                });
            }
            
            let token = canvas.tokens.placeables.find(t => t.data._id === this.targetActions.tokenId);
            hoverPos(token);
            return;
        }

        if(!(game.user.data.flags.tokenactionhud && game.user.data.flags.tokenactionhud.hudPos))
            return;

            let userPos = function (pos) {
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
        
        let pos = game.user.data.flags.tokenactionhud.hudPos;
        userPos(pos);
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
        let hovering = settings.get('onTokenHover');
        const data = super.getData();
        data.actions = this.targetActions;
        data.id = "token-action-hud";
        data.hovering = hovering;
        settings.Logger.debug('HUD data:', data);
        return data;
    }

    /** @override */
    activateListeners(html) {
        const tokenactionhud = '#token-action-hud';
        const repositionIcon = '#tah-reposition';
        const action = '.tah-action';   

        const handleClick = e => {
            let target = e.target;

            if (target.tagName !== "BUTTON")
                target = e.currentTarget.children[0];

            let value = target.value;
            // try {
                this.rollHandler.handleActionEvent(e, value);
            // } catch (error) {
            //     settings.Logger.error(e);
            // }
        }

        html.find(action).on('click', e => {
            handleClick(e);
        });

        html.find(action).contextmenu(e => {
            handleClick(e);
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
                    settings.Logger.info(`Setting position to x: ${xPos}px, y: ${yPos}px, and saving in user flags.`)
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

    showHudEnabled() {
        settings.Logger.debug('showHudEnabled()', `isGM: ${game.user.isGM}`, `enabledForUser: ${settings.get('enabledForUser')}`, `playerPermission: ${settings.get('playerPermission')}`);

        if (!settings.get('enabledForUser'))            
            return false;

        return (settings.get('playerPermission') || game.user.isGM);
    }

    async updateHud() {
        settings.Logger.debug("Updating HUD");

        let token = this._getTargetToken(this.tokens?.controlled);
        
        this.targetActions = await this.actions.buildActionList(token);

        if (!this.showHudEnabled()) {
            this.close();
            return;
        }

        this.render(true);
    }

    // Really just checks if only one token is being controlled. Not smart.
    validTokenChange() {
        let controlled = this.tokens?.controlled;

        return (controlled?.length === 1 && controlled[0]) || controlled?.length === 0;
    }

    // Is something being hovered on, is the setting on, and is it the token you're currently selecting.
    validTokenHover(token, hovered) {
        return hovered && settings.get('onTokenHover') && token._id === this.targetActions?.tokenId;
    }

    // Basically update any time. All this logic could be improved.
    validActorOrItemUpdate(actor) {
        settings.Logger.debug(`actor change, comparing actors`);
        settings.Logger.debug(`actor._id: ${actor._id}; this.targetActions.actorId: ${this.targetActions?.actorId}`);

        if (!actor) {
            settings.Logger.debug("No actor, possibly deleted, should update HUD.");
            return true;
        }
            
        if (this.targetActions && actor._id === this.targetActions.actorId) {
            settings.Logger.debug("Same actor IDs, should update HUD.");
            return true;
        }

        settings.Logger.debug("Different actor, no need to update HUD.");
        return false;
    }

    isLinkedCompendium(compendiumKey) {
        settings.Logger.debug('Compendium hook triggered. Checking if compendium is linked.')
        return this.actions.isLinkedCompendium(compendiumKey);
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