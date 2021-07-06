import * as settings from './settings.js';
import { TagDialogHelper } from './utilities/tagDialogHelper.js';
import { CategoryResizer } from './utilities/categoryResizer.js';

export class TokenActionHUD extends Application {
    i18n = (toTranslate) => game.i18n.localize(toTranslate);

    refresh_timeout = null;
    tokens = null;
    rendering = false;
    categoryHovered = '';
    defaultLeftPos = 150;
    defaultTopPos = 80;

    constructor(systemManager) {
        super();
        this.systemManager = systemManager;
    }

    async init(user) {
        this.actions = await this.systemManager.getActionHandler(user);

        this.rollHandler = this.systemManager.getRollHandler();
        this.filterManager = this.systemManager.getFilterManager();
        this.categoryManager = this.systemManager.getCategoryManager();
    }

    updateSettings() {
        this.updateRollHandler();
        this.update();
    }

    updateRollHandler() {
        this.rollHandler = this.systemManager.getRollHandler();
    }

    setTokensReference(tokens) {
        this.tokens = tokens;
    }

    /** @override */
    static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
        template: '/modules/token-action-hud/templates/template.hbs',
        id: 'token-action-hud',
        classes: [],
        width: 200,
        height: 20,
        left: 150,
        top: 80,
        scale: 1,
        background: 'none',
        popOut: false,
        minimizable: false,
        resizable: false,
        title: 'token-action-hud',
        dragDrop: [],
        tabs: [],
        scrollY: []
        });
    }

    getScale() {
        const scale = parseFloat(settings.get('scale'));
        
        if (scale < 0.8)
            return 0.8;

        if (scale > 2)
            return 2;

        return scale;
    }

    getBackground() {
        return settings.get('background');
    }

    /** @override */
    getData(options = {}) {
        const data = super.getData();
        data.actions = this.targetActions;
        data.id = 'token-action-hud';
        data.hovering = settings.get('onTokenHover');;
        data.scale = this.getScale();
        data.background = this.getBackground();
        settings.Logger.debug('HUD data:', data);
        return data;
    }

    /** @override */
    activateListeners(html) {
        const tokenactionhud = '#token-action-hud';
        const repositionIcon = '#tah-reposition';
        const categoriesIcon = '#tah-categories';
        const action = '.tah-action';   

        const handleClick = e => {
            let target = e.target;

            if (target.tagName !== 'BUTTON')
                target = e.currentTarget.children[0];

            let value = target.value;
            try {
                this.rollHandler.handleActionEvent(e, value);
            } catch (error) {
                settings.Logger.error(e);
            }
        }

        html.find(action).on('click', e => {
            handleClick(e);
        });

        html.find(action).contextmenu(e => {
            handleClick(e);
        });

        function handlePossibleFilterButtonClick(e) {
            let target = e.target;
            if(target.value.length === 0)
                return;

            let id = target.value;
            let categoryTitle = target.innerText ?? target.outerText;

            if (game.tokenActionHUD.categoryManager.isCompendiumCategory(id))
                TagDialogHelper.showSubcategoryDialogue(game.tokenActionHUD.categoryManager, id, categoryTitle)
            else
                TagDialogHelper.showFilterDialog(game.tokenActionHUD.filterManager, id);
        }     

        function handlePossibleFilterSubtitleClick(e) {
            let target = e.target;
            if(target.id.length === 0)
                return;

            let id = target.id;

            TagDialogHelper.showFilterDialog(game.tokenActionHUD.filterManager, id);
        }
        
        function closeCategory(event) {
            if (game.tokenActionHUD.rendering)
                return;
            let category = $(this)[0];
            $(category).removeClass('hover');
            let id = category.id;
            game.tokenActionHUD.clearHoveredCategory(id);
        }

        function openCategory(event) {
            let category = $(this)[0];
            closeAllCategories(event);
            $(category).addClass('hover');
            let id = category.id;
            game.tokenActionHUD.setHoveredCategory(id);
            CategoryResizer.resizeHoveredCategory(id);
        }

        function closeAllCategories(event) {
            html.find('.tah-category').removeClass('hover');
        }

        function toggleCategory(event) {
            let category = $(this.parentElement);
            let boundClick;
            if ($(category).hasClass('hover')) {
                boundClick = closeCategory.bind(this.parentElement);
                boundClick(event);
            }             
            else {
                boundClick = openCategory.bind(this.parentElement);
                boundClick(event);
            }
        }

        html.find('.tah-title-button').contextmenu('click', e => handlePossibleFilterButtonClick(e));
        
        html.find('.tah-subtitle').click('click', e => handlePossibleFilterSubtitleClick(e));
        html.find('.tah-subtitle').contextmenu('click', e => handlePossibleFilterSubtitleClick(e));

        if (settings.get('clickOpenCategory')) {
            html.find('.tah-title-button').click('click', toggleCategory);
        } else {
            html.find('.tah-category').hover(openCategory,closeCategory);
        }

        html.find(categoriesIcon).mousedown(ev => {
            ev.preventDefault();
            ev = ev || window.event;

            TagDialogHelper._showCategoryDialog(this.categoryManager)
        })

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
                    elmnt.style.top = (elmnt.offsetTop - pos2) - marginTop + 'px';
                    elmnt.style.left = (elmnt.offsetLeft - pos1) - marginLeft + 'px';
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
                        elmnt.style.top = (yPos) + 'px';
                        elmnt.style.left = (xPos) + 'px';
                    }
                    settings.Logger.info(`Setting position to x: ${xPos}px, y: ${yPos}px, and saving in user flags.`)
                    game.user.update({flags: {'token-action-hud':{ hudPos: {top: yPos, left: xPos}}}})
                }
            }
        });

        $(document).find('.tah-filterholder').parents('.tah-subcategory').css('cursor', 'pointer');
    }

    applySettings() {
        if (!settings.get('dropdown')) {
            $(document).find('.tah-content').css({
                    'bottom': '40px',
                    'flex-direction': 'column-reverse'
                });
        }
    }

    // Positioning
    trySetPos() {
        if (!(this.targetActions && this.targetActions.tokenId))
            return;

        let hudTitle = $(document).find('#tah-hudTitle');
        if (hudTitle.length > 0)
            hudTitle.css('top', -hudTitle[0].getBoundingClientRect().height)

        let token = canvas?.tokens?.placeables.find(t => t.data.id === this.targetActions?.tokenId);
        if (settings.get('onTokenHover') && token) {           
            this.setHoverPos(token);
        } else {
            this.setUserPos();
        }

        this.restoreCategoryHoverState();
        this.rendering = false;
    }

    setUserPos() {
        if(!(game.user.data.flags['token-action-hud'] && game.user.data.flags['token-action-hud'].hudPos))
            return;

        let pos = game.user.data.flags['token-action-hud'].hudPos;
        let defaultLeftPos = this.defaultLeftPos;
        let defaultTopPos = this.defaultTopPos;

        return new Promise(resolve => {
            function check() {
                let elmnt = document.getElementById('token-action-hud')
                if (elmnt) {
                    elmnt.style.bottom = null;
                    elmnt.style.top = pos.top < 5 || pos.top > window.innerHeight + 5 ? (defaultTopPos) + 'px' : (pos.top) + 'px';
                    elmnt.style.left = pos.left < 5 || pos.left > window.innerWidth + 5 ? (defaultLeftPos) + 'px': (pos.left) + 'px';
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

    setHoverPos(token) { 
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

    setHoveredCategory(catId) {
        this.categoryHovered = catId;
    }

    clearHoveredCategory(catId) {            
        if (this.categoryHovered === catId)
            this.categoryHovered = '';
    }

    restoreCategoryHoverState() {
        if (this.categoryHovered === '')
            return;

        let id = `#${this.categoryHovered}`;
        let category = $(id);
        
        if (!category[0])
            return;

        if (settings.get('clickOpenCategory')) {
            let button = category.find('.tah-title-button')[0];
            button.click();
        } else {
            category.mouseenter();
        }
    }

    async resetHud() {
        await this.resetFlags();
        this.resetPosition();
    }

    resetPosition() {
        settings.Logger.info(`Resetting HUD position to x: 80px, y: 150px, and saving in user flags. \nIf HUD is still not visible, something else may be wrong.\nFeel free to contact ^ and stick#0520 on Discord`)
        game.user.update({flags: {'token-action-hud': {hudPos: { top: 80, left: 150 }}}})
        this.update();
    }

    async resetFlags() {
        settings.Logger.info(`Resetting Token Action HUD filter and category flags`);
        await this.categoryManager.reset();
        await this.filterManager.reset();
        this.update();
    }

    update() {
        // Delay refresh because switching tokens could cause a controlToken(false) then controlToken(true) very fast
        if (this.refresh_timeout)
            clearTimeout(this.refresh_timeout)
        this.refresh_timeout = setTimeout(this.updateHud.bind(this), 100)
    }

    async updateHud() {
        settings.Logger.debug('Updating HUD');

        let token = this._getTargetToken(this.tokens?.controlled);

        let multipleTokens = this.tokens?.controlled.length > 1 && !token;
        this.targetActions = await this.actions.buildActionList(token, multipleTokens);

        if (!this.showHudEnabled()) {
            this.close();
            return;
        }

        this.rendering = true;
        this.render(true);
    }

    // Really just checks if only one token is being controlled. Not smart.
    validTokenChange(token) {
        if (settings.get('alwaysShowHud'))
            return this.isRelevantToken(token) || token.actorId === game.user.character?.id;
        else
            return this.isRelevantToken(token);
    }

    isRelevantToken(token) {
        let controlled = this.tokens?.controlled;
        return controlled?.some(t => t.id === this.getTokenId(token)) || (controlled?.length === 0 && canvas?.tokens?.placeables?.some(t => t.id === this.targetActions?.tokenId));
    }

    getTokenId(token) {
        return token.id ?? token.id;
    }

    // Is something being hovered on, is the setting on, and is it the token you're currently selecting.
    validTokenHover(token, hovered) {
        return hovered && settings.get('onTokenHover') && token.id === this.targetActions?.tokenId;
    }

    // Basically update any time. All this logic could be improved.
    validActorOrItemUpdate(actor) {
        settings.Logger.debug(`actor change, comparing actors`);
        settings.Logger.debug(`actor.id: ${actor.id}; this.targetActions.actorId: ${this.targetActions?.actorId}`);

        if (!actor) {
            settings.Logger.debug('No actor, possibly deleted, should update HUD.');
            return true;
        }
            
        if (this.targetActions && actor.id === this.targetActions.actorId) {
            settings.Logger.debug('Same actor IDs, should update HUD.');
            return true;
        }

        settings.Logger.debug('Different actor, no need to update HUD.');
        return false;
    }

    showHudEnabled() {
        settings.Logger.debug('showHudEnabled()', `isGM: ${game.user.isGM}`, `enabledForUser: ${settings.get('enabledForUser')}`, `playerPermission: ${settings.get('playerPermission')}`);

        if (!settings.get('enabledForUser'))            
            return false;

        return (settings.get('playerPermission') || game.user.isGM);
    }

    isLinkedCompendium(compendiumKey) {
        settings.Logger.debug('Compendium hook triggered. Checking if compendium is linked.')
        return this.categoryManager.isLinkedCompendium(compendiumKey);
    }

    /** @private */
    _getTargetToken(controlled = []) {
        if (controlled.length > 1)
            return null;

        if (controlled.length === 0 && canvas.tokens?.placeables && game.user.character) {
            if (!settings.get('alwaysShowHud'))
                return null;
            
            let character = game.user.character
            let token = canvas?.tokens?.placeables.find(t => t.actor?.id === character?.id)
            if (token)
                return token;
            
            return null;
        }

        let ct = controlled[0];

        if (!ct)
            return null;

        if(this._userHasPermission(ct))
            return ct;
            
        return null;
    }

    /** @private */
    _userHasPermission(token = '') {
        let actor = token.actor;
        let user = game.user;
        return game.user.isGM || actor?.hasPerm(user, "OWNER");
    }
}
