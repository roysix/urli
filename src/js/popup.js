// TODO

console.log("URLNP.Popup");

/**
 * URL Next Plus Popup.
 * 
 * Uses the JavaScript Revealing Module Pattern.
 */ 
var URLNP = URLNP || {};
URLNP.Popup = URLNP.Popup || function () {

  var instance,
      // currentTab,
      //selectionStart = -1,
      // selectionProperties = { selection: "", selectionStart: -1 },
      images = document.querySelectorAll("#popup-controls input.image-control"),
      $ = document.getElementById.bind(document);

  /**
   * Loads the DOM content needed to display the popup page.
   * 
   * DOMContentLoaded will fire when the DOM is loaded. Unlike the conventional
   * "load", it does not wait for images and media.
   * 
   * @public
   */
  function DOMContentLoaded() {
    console.log("DOMContentLoaded()");
    // Add Event Listeners to the DOM elements
    console.log("\tadding event listeners");
    $("next-input").addEventListener("click", clickNext, false);
    $("prev-input").addEventListener("click", clickPrev, false);
    $("clear-input").addEventListener("click", clickClear, false);
    $("setup-input").addEventListener("click", toggleForm, false);
    $("url-textarea").addEventListener("mouseup", handleURL, false);
    $("url-textarea").addEventListener("keyup", handleURL, false);
    $("accept-input").addEventListener("click", submitForm, false);
    $("cancel-input").addEventListener("click", toggleForm, false);
    // $("popup-form").addEventListener("click", URLNP.UI.dispatchFormClick_.bind(this));
    // Set localization text (i18n) from messages.json
    console.log("\tadding i18n text");
    $("next-input").title = chrome.i18n.getMessage("popup_next_input");
    $("prev-input").title = chrome.i18n.getMessage("popup_prev_input");
    $("clear-input").title = chrome.i18n.getMessage("popup_clear_input");
    $("setup-input").title = chrome.i18n.getMessage("popup_setup_input");
    //$("url-legend").innerText = chrome.i18n.getMessage("popup_url_legend");
    $("url-label").innerText = chrome.i18n.getMessage("popup_url_label"); 
    $("selection-label").innerText = chrome.i18n.getMessage("popup_selection_label"); 
    $("interval-label").innerText = chrome.i18n.getMessage("popup_interval_label");
    $("accept-input").value = chrome.i18n.getMessage("popup_accept_input");
    $("cancel-input").value = chrome.i18n.getMessage("popup_cancel_input");
    // Set the current tab, instance, and update images
    chrome.tabs.getSelected(null,
      function (tab) {
        // currentTab = tab;
        console.log("\tgetting currentTab (tab.id=" + tab.id +")");
        chrome.runtime.getBackgroundPage(function(backgroundPage) {
          instance = backgroundPage.URLNP.Background.getInstance(tab);
          updateImages();
        });
      }
    );
  }

  /**
   * Updates the images' class to either enabled or disabled depending on
   * whether this instance is enabled.
   * 
   * @private
   */ 
  function updateImages() {
    console.log("updateImages()");
    var i,
        className = /*instance && */ instance.enabled /*&& instance.tab.id === currentTab.id */? "enabled" : "disabled";
    for (i = 0; i < images.length; i++) {
      images[i].className = className;
    }
  }

  /**
   * Handle URL selection on mouseup and keyup events.
   * 
   * @private
   */ 
  function handleURL() {
    console.log("handleURL()");
    // Stores the selectionStart for later (to be returned to background.html).
    instance.selectionStart = $("url-textarea").selectionStart;
    // Update the "selectionInput" element to show the selected text.
    $("selection-input").value = window.getSelection().toString();
    console.log("\t\tselection-input.value=" + $("selection-input").value);
  }
  	
  // Called when the user clicks on the Accept button on the form.  Checks
  // to make sure there are no errors with any of the fields, and if not,
  // passes the data back to the urlnp object in background.html.
  function submitForm() {
  	console.log("\tfunction submitForm");
  	var errorMessage = [],
  		errorCount = 0,
  		selection = $("selection-input").value,
  		interval = $("interval-input").value,
  		i,
  		length;
  	// ERROR If the selected text from the URL are not digits (0-9).
  // 	for (i = 0, length = selection.length; i < length; i++) {
  // 		if (selection.charCodeAt(i) < 48 || selection.charCodeAt(i) > 57) {
  // 			errorMessage[errorCount++] = chrome.i18n.getMessage("popupSelectionNaNError");
  // 			break;
  // 		}
  // 	}
  	// ERROR If the selection is blank.
  	if (selection === "") {
  		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_selection_blank_error");
  	}
  	// ERROR If the selection is not a part of the URL.
  	if (currentTab.url.indexOf(selection) === -1) {
  		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_selection_notinurl_error");
  	}
  	// ERROR If the interval is negative (-) or not a number.
  	for (i = 0, length = interval.length; i < length; i++) {
  		if (interval.charCodeAt(i) < 48 || interval.charCodeAt(i) > 57) {
  			errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_negative_error");
  			break;
  		}
  	}
  	// ERROR If the interval is blank.
  	if (interval === "") {
  		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_blank_error");
  	}
  	// ERROR If the interval is 0.
  	if (interval === "0") {
  		errorMessage[errorCount++] = chrome.i18n.getMessage("popup_interval_0_error");
  	}
  	// If there was an error, show the error message
  	if (errorCount !== 0) {
  		console.log("\t\terrorMessage:" + errorMessage);
  		URLNP.UI.generateAlert(errorMessage);
  	}
  	// Else there was not an error (successful)...
  	else {
  		console.log("\t\tsuccess -- now enabling urlnp");
  		// Stores the form's information into urlnp, update the images
  		// (enabled) and hide the form by toggling it.
  		instance.enabled = true;
  		// urlnp.tab = currentTab;
  		chrome.runtime.getBackgroundPage(function(backgroundPage) {
  		  backgroundPage.URLNP.Background.setInstance(instance);  
  			updateImages();
  			toggleForm();
        chrome.storage.sync.get(null, function (o) {
  				if (o.keyEnabled) {
      			console.log("\t\tadding keyListener");
      			//chrome.tabs.sendMessage(instance.getTab().id, {greeting: "setKeys", keyCodeIncrement: localStorage.keyCodeIncrement, keyEventIncrement: localStorage.keyEventIncrement, keyCodeDecrement: localStorage.keyCodeDecrement, keyEventDecrement: localStorage.keyEventDecrement, keyCodeClear: localStorage.keyCodeClear, keyEventClear: localStorage.keyEventClear}, function(response) {});
      			chrome.tabs.sendMessage(instance.tab.id, {greeting: "addKeyListener"}, function (response) {});
      		}
        });
  		});
  		//chrome.runtime.sendMessage({greeting: "onPopupFormAccept", enabled: urlnp.enabled, tab: currentTab, selection: selection, selectionStart: selectionStart, interval: interval}, function (response) {});
  	}
  }
  	
  // User clicked on Increment image; need to find out if urlnp is enabled
  // and if the current tab is urlnp's tab before sending a request to
  // increment via modifyUrliAndUpdateTab.
  
  function clickNext() {
  	console.log("\tfunction clickNext");
  	if (instance.enabled /*&& urlnp.tab.id === currentTab.id*/) {
  		console.log("\t\tgoing next");
  		chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "next"}, function (response) {});
  	}
  }
  
  // User clicked on Decrement image; need to find out if urlnp is enabled
  // and if the current tab is urlnp's tab before sending a request to
  // decrement via modifyU?rliAndUpdateTab.
  
  function clickPrev() {
  	console.log("\tfunction clickPrev");
  	if (instance.enabled /*&& urlnp.tab.id === currentTab.id*/) {
  		console.log("\t\tgoing prev");
  		chrome.runtime.sendMessage({greeting: "modifyUrliAndUpdateTab", action: "prev"}, function (response) {});
  	}
  }
  
  /**
   * Clears URLNP's state if it is currently enabled, thus disabling it. Then
   * calls updateImages() to set the images to a disabled/off state.
   * 
   * @private
   */ 
  function clickClear() {
  	console.log("\tfunction clickClear");
  	if (instance.enabled) {
  		console.log("\t\tclearing urlnp");
		  instance = {
		    enabled: false,
		    tab: instance.tab,
		    selection: "",
		    selectionStart: -1,
		    interval: 0
		  };
  		chrome.runtime.getBackgroundPage(function(backgroundPage) {
  		  backgroundPage.URLNP.Background.setInstance(instance);
  			//urlnp.enabled = false;
  		  updateImages();
  		});
  	}
  }
  	
  /**
   * Toggles the popup form. When the user clicks the setup input, the form
   * will expand and be visible. When the user clicks the Cancel input, the
   * form will be hidden and the popup controls view will return.
   * 
   * @private
   */ 
  function toggleForm() {
  	console.log("\tfunction toggleForm");
  	var form = $("popup-form"),
  	    controls = $("popup-controls");
  	console.log("\t\tform.style.display=" + form.style.display);
  	if (form.style.display === "block") {
  		// Hide form, show controls, reduce body (popup window) size
  		form.style.display = "none";
  		controls.style.display = "inline";
  		document.body.style.width = "102px";
  		document.body.style.height = "16px";
  		document.body.style.background = "#EDECEB";
  	} else {
  		// Show form, hide controls, increase body (popup window) size, update tab
  		form.style.display = "block";
  		controls.style.display = "none";
  		document.body.style.width = "auto" /*'583px' */;
  		document.body.style.height = "auto"/*'287px'*/;
  		document.body.style.background = "#FFFFFF";
  		chrome.tabs.getSelected(null,
  			function(tab) {
  				currentTab = tab;
  				//chrome.runtime.sendMessage({greeting: "findSelection", url: currentTab.url}, initForm);
  				// initForm();
  	//console.log("\tfunction initForm");
  	// Fill out the form elements' contents and load the default values
  	chrome.runtime.getBackgroundPage(function(backgroundPage) {
  	  selectionProperties = backgroundPage.URLNP.Background.findSelection(currentTab.url);
  	  // selectionStart = selectionProperties.selectionStart;
  		$("url-textarea").value = currentTab.url;
  		$("url-textarea").setSelectionRange(selectionProperties.selectionStart, selectionProperties.selectionStart + selectionProperties.selection.length);
  		$("selection-input").value = selectionProperties.selection;
  	});
    if (!$("interval-input").value) {
      chrome.storage.sync.get(null, function (o) {
        $("interval-input").value = o.defaultInterval;
      });
    }
  			}
  		);
  	}
  }

  // Return Public Functions
  return {
    DOMContentLoaded: DOMContentLoaded
  };
}();

document.addEventListener("DOMContentLoaded", URLNP.Popup.DOMContentLoaded, false);