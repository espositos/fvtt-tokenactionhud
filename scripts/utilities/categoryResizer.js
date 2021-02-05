export class CategoryResizer {
    static resizeHoveredCategory(catId) {
        function jq( myid ) {
            return "#" + myid.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );
        }

        let id = jq(catId);
        let category = $(id);
        
        if (!category[0])
            return;        
        
        let content = category.find('.tah-content');
        let isOneLineFit = category.hasClass('oneLine');
        let actions = category.find('.tah-actions');
        
        if (actions.length === 0)
            return;
        
        // reset content to original width
        let contentDefaultWidth = 300;
        let minWidth = 200;
        CategoryResizer.resizeActions(actions, contentDefaultWidth);

        let step = 30;
        
        let bottomLimit = $(document).find('#hotbar').offset().top - 20;
        let rightLimit = $(document).find('#sidebar').offset().left - 20;

        let maxRequiredWidth = CategoryResizer.calculateMaxRequiredWidth(actions);
        while (CategoryResizer.shouldIncreaseWidth(content, actions, maxRequiredWidth, bottomLimit, rightLimit, isOneLineFit)) {
            let box = actions[0].getBoundingClientRect();
            let boxWidth = box.width;
            let cssWidth = actions.width();

            if (boxWidth > maxRequiredWidth)
                return;
            
            let newWidth = cssWidth + step;
            
            CategoryResizer.resizeActions(actions, newWidth);
        }

        let priorWidth;
        while (CategoryResizer.shouldShrinkWidth(content, actions, minWidth, bottomLimit, rightLimit, isOneLineFit)) {
            let box = actions[0].getBoundingClientRect();
            let boxWidth = box.width;
            let cssWidth = actions.width();

            if (boxWidth < minWidth)
                return;

            let newWidth = cssWidth - step;

            CategoryResizer.resizeActions(actions, newWidth); 
        }
    }

    static calculateMaxRequiredWidth(actions) {
        let maxWidth = 0;

        actions.each(function() {
            let action = $(this);
            if (action.hasClass('excludeFromWidthCalculation'))
                return;

            let totalWidth = 0;
            Array.from(action.children()).forEach(c => {
                let child = $(c);
                let childWidth = child.width();
                let marginWidth = parseInt(child.css('marginLeft')) + parseInt(child.css('marginRight'));
                
                totalWidth += childWidth + marginWidth;
            });

            if (totalWidth > maxWidth)
                maxWidth = totalWidth;
        });

        return maxWidth;
    }

    static shouldIncreaseWidth(content, actions, maxRequiredWidth, bottomLimit, rightLimit, isOneLineFit) {
        let contentRect = content[0].getBoundingClientRect();
        let actionsRect = actions[0].getBoundingClientRect();

        if (actionsRect.right >= rightLimit)
            return false;

        if (actionsRect.width >= maxRequiredWidth)
            return false;

        let actionArray = Array.from(content.find('.tah-action')).sort((a, b) => $(a).offset().top - $(b).offset().top);
        let rows = CategoryResizer.calculateRows(actionArray);
        let columns = CategoryResizer.calculateMaxRowButtons(actionArray);
        if (contentRect.bottom <= bottomLimit && columns >= rows && !isOneLineFit)
            return false;
        
        return true;
    }

    static shouldShrinkWidth(content, actions, actionsMinWidth, bottomLimit, rightLimit, isOneLineFit) {
        let contentRect = content[0].getBoundingClientRect();
        let actionsRect = actions[0].getBoundingClientRect();

        if (contentRect.bottom >= bottomLimit)
            return false;

        if (actionsRect.width <= actionsMinWidth)
            return false;

        let actionArray = Array.from(content.find('.tah-action')).sort((a, b) => $(a).offset().top - $(b).offset().top);
        let rows = CategoryResizer.calculateRows(actionArray);
        let columns = CategoryResizer.calculateMaxRowButtons(actionArray);

        if (actionsRect.right <= rightLimit && (rows >= columns - 1 || isOneLineFit))
            return false;

        return true;
    }

    static calculateRows(actionArray) {
        var rows = 0;
        let currentTopOffset = 0;
        let closeRange = 5;

        actionArray.forEach(a => {
            let offset = $(a).offset().top

            if (Math.abs(currentTopOffset - offset) >= closeRange) {
                rows++;
                currentTopOffset = offset;
            }
        });

        return rows;
    }

    static calculateMaxRowButtons(actionArray) {
        if (actionArray.length < 2)
            return actionArray.length;

        var rowButtons = [];
        let currentTopOffset = 0;
        let rowButtonCounter = 0;
        let closeRange = 5;

        actionArray.forEach(a => {
            let offset = $(a).offset().top;

            if (Math.abs(currentTopOffset - offset) >= closeRange) {
                if (rowButtonCounter >= 1)
                    rowButtons.push(rowButtonCounter);

                currentTopOffset = offset;
                rowButtonCounter = 1;
            } else {
                rowButtonCounter++;
            }

            // if it's the final object, add counter anyway in case it was missed.
            if (rowButtonCounter >= 1 && actionArray.indexOf(a) === actionArray.length - 1)
                rowButtons.push(rowButtonCounter);
        });

        return Math.max(...rowButtons);
    }

    static resizeActions(actions, newWidth) {
        // resize each action with new width
        actions.map(function() {
            $(this).css({"width": newWidth + 'px',
            "min-width" : newWidth + 'px'});
        })
    }
}