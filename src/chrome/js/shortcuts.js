/**
 * URL Incrementer
 * @file shortcuts.js
 * @author Roy Six
 * @license LGPL-3.0
 */

var Shortcuts = (() => {

  const KEY_MODIFIERS = new Map([["Alt",0x1],["Control",0x2],["Shift",0x4],["Meta",0x8]]); // A map of the KeyboardEvent.key modifiers and their bits

  let button = undefined, // the current mouse button on mousedown
      buttons3 = false, // boolean flag indicating if the right + left mouse buttons are clicked simultaneously
      clicks = 0, // current consecutive click count for a single mouse button
      timeouts = {}, // reusable global timeouts for detecting multiple mouse clicks
      items = {}; // storage items cache

  /**
   * Sets the items storage cache.
   *
   * @param items_ the storage items
   * @private
   */
  function setItems(items_) {
    items = items_;
  }

  /**
   * A keyup event listener for keyboard shortcuts.
   *
   * @param event the keyup event
   * @private
   */
  function keyupListener(event) {
    console.log("keyupListener() - event.code=" + event.code);
    if (event && event.target && (event.target.nodeName === "TEXTAREA" || (event.target === "INPUT" && (event.target.type === "text")))) { // TODO
      return;
    }
    if      (keyPressed(event, items.keyIncrement)) { chrome.runtime.sendMessage({greeting: "performAction", action: "increment", "shortcut": "key"}); }
    else if (keyPressed(event, items.keyDecrement)) { chrome.runtime.sendMessage({greeting: "performAction", action: "decrement", "shortcut": "key"}); }
    else if (keyPressed(event, items.keyNext))      { chrome.runtime.sendMessage({greeting: "performAction", action: "next",      "shortcut": "key"}); }
    else if (keyPressed(event, items.keyPrev))      { chrome.runtime.sendMessage({greeting: "performAction", action: "prev",      "shortcut": "key"}); }
    else if (keyPressed(event, items.keyClear))     { chrome.runtime.sendMessage({greeting: "performAction", action: "clear",     "shortcut": "key"}); }
    else if (keyPressed(event, items.keyReturn))    { chrome.runtime.sendMessage({greeting: "performAction", action: "return",    "shortcut": "key"}); }
    else if (keyPressed(event, items.keyAuto))      { chrome.runtime.sendMessage({greeting: "performAction", action: "auto",      "shortcut": "key"}); }
  }

  /**
   * A mousedown event listener that determines if event.buttons = 3 and stores event.button for the mouseup listener.
   *
   * @param event the mousedown event
   * @private
   */
  function mousedownListener(event) {
    clearTimeout(timeouts.mouseup2);
    if (event.buttons === 3) {
      buttons3 = true;
      event.preventDefault(); // Avoid selecting text
    } else {
      buttons3 = false;
    }
    console.log("mousedownListener() event.buttons=" + event.buttons + ", buttons3=" + buttons3);
    button = event.button;
  }

  /**
   * A mouseup event listener for mouse button shortcuts.
   *
   * @param event the mouseup event
   * @private
   */
  function mouseupListener(event) {
    clearTimeout(timeouts.mouseup);
    if (event.button === button) {
      clicks++;
      timeouts.mouseup = setTimeout(function() {
        console.log("mouseupListener() - timeouts.mouseup resetting clicks");
        clicks = 0; }, items.mouseClickSpeed);
    } else {
      clicks = 0;
    }
    console.log("mouseupListener() - event.button=" + event.button + ", button=" + button + ", clicks=" + clicks);
    if      (mousePressed(event, items.mouseIncrement)) { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "increment", "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseDecrement)) { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "decrement", "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseNext))      { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "next",      "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mousePrev))      { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "prev",      "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseClear))     { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "clear",     "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseReturn))    { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "return",    "shortcut": "mouse"}); }, items.mouseClickSpeed); }
    else if (mousePressed(event, items.mouseAuto))      { timeouts.mouseup2 = setTimeout(function() { chrome.runtime.sendMessage({greeting: "performAction", action: "auto",      "shortcut": "mouse"}); }, items.mouseClickSpeed); }
  }

  /**
   * A contextmenu event listener that disables the context menu from showing if event.buttons = 3.
   *
   * @param event the contextmenu event
   * @returns {boolean} false if event.buttons = 3, true otherwise
   * @private
   */
  function contextmenuListener(event) {
    if (buttons3) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  /**
   * Checks if the key was pressed by comparing the event against the flags
   * using bitwise operators and checking if the key code matches.
   *
   * @param event the key event
   * @param key the action key to check (e.g. increment shortcut key)
   * @returns {boolean} true if the key event matches the action key, false otherwise
   * @private
   */
  function keyPressed(event, key) {
    return allowed && key && event.code === key.code &&
      (!(event.altKey   ^ (key.modifiers & KEY_MODIFIERS.get("Alt"))         ) &&
       !(event.ctrlKey  ^ (key.modifiers & KEY_MODIFIERS.get("Control")) >> 1) &&
       !(event.shiftKey ^ (key.modifiers & KEY_MODIFIERS.get("Shift"))   >> 2) &&
       !(event.metaKey  ^ (key.modifiers & KEY_MODIFIERS.get("Meta"))    >> 3));
  }

  /**
   * Checks if the mouse button was pressed. There are two possibilities: 1) Single or 2) (Right)+Left (buttons3).
   * If either matches and the current click count matches, the button was pressed.
   *
   * @param event the mouse event
   * @param mouse the action mouse button to check (e.g. increment shortcut mouse button)
   * @returns {boolean} true if the mouse button event matches the action mouse button, false otherwise
   * @private
   */
  function mousePressed(event, mouse) {
    return mouse && (mouse.button === 3 ? buttons3 : event.button === mouse.button) && mouse.clicks === clicks;
  }

  /**
   * Adds the key listeners.
   *
   * @private
   */
  function addKeyListener() {
    removeKeyListener();
    document.addEventListener("keyup", keyupListener);
  }

  /**
   * Removes the key listeners.
   *
   * @private
   */
  function removeKeyListener() {
    document.removeEventListener("keyup", keyupListener);
  }

  /**
   * Adds the mouse listeners.
   *
   * @private
   */
  function addMouseListener() {
    removeMouseListener();
    document.addEventListener("mousedown", mousedownListener);
    document.addEventListener("mouseup", mouseupListener);
    document.addEventListener("contextmenu", contextmenuListener);
  }

  /**
   * Removes the mouse listeners.
   *
   * @private
   */
  function removeMouseListener() {
    document.removeEventListener("mousedown", mousedownListener);
    document.removeEventListener("mouseup", mouseupListener);
    document.removeEventListener("contextmenu", contextmenuListener);
  }

  // Content Script starts by getting storage and adding key and mouse listeners if key or mouse are enabled (quick/enabled/saved urls are handled later by background)
  if (!this.contentScriptExecuted) {
    this.contentScriptExecuted = true;
    chrome.storage.sync.get(null, function(items) {
      if (items.permissionsInternalShortcuts) {
        setItems(items);
        if (items.keyEnabled) {
          addKeyListener();
        }
        if (items.mouseEnabled) {
          addMouseListener();
        }
        // Listen for requests from chrome.tabs.sendMessage (Extension Environment: Background / Popup)
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
          console.log("chrome.runtime.onMessage() - request.greeting=" + request.greeting);
          if (request.greeting === "addKeyListener") {
            addKeyListener();
          } else if (request.greeting === "removeKeyListener") {
            removeKeyListener();
          } else if (request.greeting === "addMouseListener") {
            addMouseListener();
          } else if (request.greeting === "removeMouseListener") {
            removeMouseListener();
          }
        });
      }
    });
  }
  console.log("shortcuts.js content script executed");
})();