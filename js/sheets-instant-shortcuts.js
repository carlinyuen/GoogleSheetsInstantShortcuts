// Prevent conflicts
jQuery.noConflict();

// Encapsulated anonymous function
(function($) {

    // Variables & Constants
    var APP_ID_PRODUCTION = '' // TODO: fill
        , DEBUG = (chrome.i18n.getMessage('@@extension_id') !== APP_ID_PRODUCTION)
        , KEYCODE_CONTROL = 17
        , KEYCODE_ALT = 18
        , KEYCODE_SHIFT = 16
        , KEYCODE_SHIFT = 16
        , EVENT_NAME_KEYDOWN = 'keydown.insta-shortcuts'
        , EVENT_NAME_KEYUP = 'keyup.insta-shortcuts'
        , EVENT_NAME_LOAD = 'load.insta-shortcuts'
    ;

    var modifiers = 0;         // Keep track of modifiers pressed right now
    var keyDownEvent;          // Keep track of keydown event to prevent re-firing
    var keyUpEvent;            // Keep track of keyup event to prevent re-firing
    var shortcutPanel;         // Keep track of panel for showing shortcuts
    var shortcutList;          // Keep track of ul list for showing shortcuts
    var shortcutsMap = {};
    shortcutsMap[KEYCODE_ALT] = [
        { "name": "File Menu", "shortcut": "Alt + F" }
        , { "name": "Edit Menu", "shortcut": "Alt + E" }
        , { "name": "View Menu", "shortcut": "Alt + V" }
        , { "name": "Insert Menu", "shortcut": "Alt + I" }
        , { "name": "Format Menu", "shortcut": "Alt + O" }
        , { "name": "Data Menu", "shortcut": "Alt + D" }
        , { "name": "Form Menu", "shortcut": "Alt + M" }
        , { "name": "Tools Menu", "shortcut": "Alt + T" }
        , { "name": "Add-ons Menu", "shortcut": "Alt + N" }
        , { "name": "Help Menu", "shortcut": "Alt + H" }
        , { "name": "Accessibility Menu", "shortcut": "Alt + A" }
        , { "name": "Open hyperlink", "shortcut": "Alt + Enter" }
    ];
    shortcutsMap[KEYCODE_CONTROL] = [
        { "name": "Insert date", "shortcut": "Ctrl + ;" }
        , { "name": "Fill range", "shortcut": "Ctrl + Enter" }
        , { "name": "Fill down", "shortcut": "Ctrl + D" }
        , { "name": "Fill right", "shortcut": "Ctrl + R" }
        , { "name": "Move to beginning of sheet", "shortcut": "Ctrl + Home" }
        , { "name": "Move to end of sheet", "shortcut": "Ctrl + End" }
        , { "name": "Scroll to active cell", "shortcut": "Ctrl + Backspace" }
        , { "name": "Find and replace", "shortcut": "Ctrl + H" }
        , { "name": "Select column", "shortcut": "Ctrl + Space" }
        , { "name": "Select all", "shortcut": "Ctrl + A" }
        , { "name": "Show all formulas", "shortcut": "Ctrl + `" }
        , { "name": "Show shortcuts help popup", "shortcut": "Ctrl + /" }
//        , { "name": "Undo", "shortcut": "Ctrl + Z" }
//        , { "name": "Redo", "shortcut": "Ctrl + Y" }
//        , { "name": "Find", "shortcut": "Ctrl + F" }
//        , { "name": "Bold", "shortcut": "Ctrl + B" }
//        , { "name": "Underline", "shortcut": "Ctrl + U" }
//        , { "name": "Italic", "shortcut": "Ctrl + I" }
//        , { "name": "Open", "shortcut": "Ctrl + O" }
//        , { "name": "Print", "shortcut": "Ctrl + P" }
    ];
    shortcutsMap[KEYCODE_SHIFT] = [
        { "name": "Insert/edit note", "shortcut": "Shift + F2" }
        , { "name": "Select row", "shortcut": "Shift + Space" }
        , { "name": "Add new sheet", "shortcut": "Shift + F11" }
        , { "name": "Chat", "shortcut": "Shift + Esc" }
        , { "name": "Open documentation (new window)", "shortcut": "Shift + F1" }
    ];
    shortcutsMap[KEYCODE_CONTROL + KEYCODE_SHIFT] = [
        { "name": "Show context menu", "shortcut": "Ctrl + Shift + \\" }
        , { "name": "Insert time", "shortcut": "Ctrl + Shift + ;" }
        , { "name": "Input tools on/off", "shortcut": "Ctrl + Shift + K" }
        , { "name": "Align center", "shortcut": "Ctrl + Shift + E" }
        , { "name": "Align left", "shortcut": "Ctrl + Shift + L" }
        , { "name": "Align right", "shortcut": "Ctrl + Shift + R" }
        , { "name": "Move to next sheet", "shortcut": "Ctrl + Shift + PageDown" }
        , { "name": "Move to previous sheet", "shortcut": "Ctrl + Shift + PageUp" }
        , { "name": "Format as decimal", "shortcut": "Ctrl + Shift + 1" }
        , { "name": "Format as time", "shortcut": "Ctrl + Shift + 2" }
        , { "name": "Format as date", "shortcut": "Ctrl + Shift + 3" }
        , { "name": "Format as currency", "shortcut": "Ctrl + Shift + 4" }
        , { "name": "Format as percentage", "shortcut": "Ctrl + Shift + 5" }
        , { "name": "Format as exponent", "shortcut": "Ctrl + Shift + 6" }
        , { "name": "Insert array formula", "shortcut": "Ctrl + Shift + Enter" }
        , { "name": "Compact controls", "shortcut": "Ctrl + Shift + F" }
    ];
    shortcutsMap[KEYCODE_CONTROL + KEYCODE_ALT] = [
        { "name": "Insert/edit comment", "shortcut": "Ctrl + Alt + M" }
        , { "name": "Open filter dropdown menu", "shortcut": "Ctrl + Alt + R" }
        , { "name": "Focus pop up", "shortcut": "Ctrl + Alt + E, then Ctrl + Alt + P" }
//        , { "name": "Enable screen reader support", "shortcut": "Ctrl + Alt + Z" }
    ];
    shortcutsMap[KEYCODE_ALT + KEYCODE_SHIFT] = [
        { "name": "Show sheet list", "shortcut": "Alt + Shift + K" }
        , { "name": "Display sheet menu", "shortcut": "Alt + Shift + S" }
        , { "name": "Strikethrough", "shortcut": "Alt + Shift + 5" }
        , { "name": "Apply top border", "shortcut": "Alt + Shift + 1" }
        , { "name": "Apply right border", "shortcut": "Alt + Shift + 2" }
        , { "name": "Apply bottom border", "shortcut": "Alt + Shift + 3" }
        , { "name": "Apply left border", "shortcut": "Alt + Shift + 4" }
        , { "name": "Remove borders", "shortcut": "Alt + Shift + 6" }
        , { "name": "Apply outer border", "shortcut": "Alt + Shift + 7" }
        , { "name": "Focus quicksum", "shortcut": "Alt + Shift + Q" }
    ];
    shortcutsMap[KEYCODE_CONTROL + KEYCODE_ALT + KEYCODE_SHIFT] = [
        { "name": "Select input tools", "shortcut": "Ctrl + Alt + Shift + K" }
        , { "name": "Move to top of application", "shortcut": "Ctrl + Alt + Shift + M" }
        , { "name": "Revisions", "shortcut": "Ctrl + Alt + Shift + G" }
//        , { "name": "Read column", "shortcut": "Ctrl + Alt + Shift + C" }
//        , { "name": "Read row", "shortcut": "Ctrl + Alt + Shift + R" }
    ];

    // Custom log function
    function debugLog() {
        if (DEBUG && console) {
            console.log.apply(console, arguments);
        }
    }

    // When user presses a key
    function keyDownHandler(event)
    {
        // Make sure it's not the same event firing over and over again
        if (keyDownEvent == event) {
            return;
        } else {
            keyDownEvent = event;
        }

        // Get character that was typed
        var charCode = event.keyCode || event.which;
        debugLog("charCode: " + charCode);

        // Trigger shortcuts preview for certain modifiers
        if (charCode == KEYCODE_CONTROL || charCode == KEYCODE_ALT || charCode == KEYCODE_SHIFT) {
            modifiers += charCode;
            updateShortcutsPanel(event);
        }
    }

    // When user lifts up on a key, to catch backspace
    function keyUpHandler(event)
    {
        // Make sure it's not the same event firing over and over again
        if (keyUpEvent == event) {
            return;
        } else {
            keyUpEvent = event;
        }

        // Get key that was lifted on
        var charCode = event.keyCode || event.which;

        // Trigger shortcuts preview for certain modifiers
        if (charCode == KEYCODE_CONTROL || charCode == KEYCODE_ALT || charCode == KEYCODE_SHIFT) {
            modifiers -= charCode;
            updateShortcutsPanel(event);
        }
    }

    // Update shortcuts panel with latest shortcuts based on modifier keys pressed
    function updateShortcutsPanel(event)
    {
        debugLog('modifiers: ' + modifiers);

        // Clear all child items
        shortcutList.html('');

        // Sanity check
        if (modifiers > 0 && modifiers < KEYCODE_CONTROL + KEYCODE_ALT + KEYCODE_SHIFT
            && !shortcutPanel.hasClass('disabled'))
        {
            // Get shortcuts that fall within modifier keys pressed
            var shortcuts = shortcutsMap[modifiers].sort(function(a, b) {
                return a['name'].localeCompare(b['name']);
            });

            // Iterate through and add them to panel
            $.each(shortcuts, function(i, shortcut) {
                shortcutList.append(
                    $(document.createElement('tr')).append(
                        $(document.createElement('td')).text(
                            shortcut['name'])
                    ).append(
                        $(document.createElement('td')).text(
                            shortcut['shortcut'])
                    )

                );
            });
        }
        else if (modifiers < 0 || modifiers > KEYCODE_CONTROL + KEYCODE_ALT + KEYCODE_SHIFT) {
            modifiers = 0;  // Way to deal with any wonky behavior
        }
    }

    // Attach listener to keypresses
    function addListeners()
    {
        // Add to document
        var $document = $(document);
        $document.on(EVENT_NAME_KEYDOWN, keyDownHandler);
        $document.on(EVENT_NAME_KEYUP, keyUpHandler);
    }

    // Create panel to show shortcuts in
    function createPanel()
    {
        // Create panel
        $('body').append(
            shortcutPanel = $(document.createElement('div'))
                .attr('id', 'sheets-instant-shortcuts-panel')
                .append($(document.createElement('div')).addClass('bg'))
                .append(shortcutList = $(document.createElement('table'))
                    .css('background-image', 'url(' 
                        + chrome.runtime.getURL("images/icon16.png") + ')'
                    ).attr('title', 
                        'Instant shortcuts are available! Click to toggle.'
                    ).click(function(event) {
                        shortcutPanel.toggleClass('disabled');
                    })
                )
        );
    }

    // Document ready function
    $(function() 
    {
        // Add shortcut panel div
        createPanel();

        // Add listener to track when user types
        addListeners();
    });

})(jQuery);

