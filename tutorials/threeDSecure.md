In case the 3DS authentication is required we should create a 3DS authentication handler and also provide a frame for the 3DS authentication popup.

The 3DS authentication popup frame might look like this:
```html
<div id="modal" class="hidden">
	<div class="bt-mask"></div>
	<div class="bt-modal-frame">
		<div class="bt-modal-header">
			<div class="header-text">Authentication</div>
		</div>
		<div class="bt-modal-body"></div>
		<div class="bt-modal-footer">
			<a id="text-close" href="#">Cancel</a>
		</div>
	</div>
</div>
```

The JavaScript that initializes and binds the 3DS handler to the above frame:
```javascript
// setup the configuration for 3DS authentication
var threeDconf = {
  inputs: {
    amount: "#amount"
  },
  frame3ds: {
    bankFrame: $(".bt-modal-body"),
    modal: $("#modal"),
    hidden: "hidden", // a CSS class that hides the frame 
    closeBtn: $("#text-close")
  },
  onReady: ui_obj.set3DSecure,
  onError: showError,
  onUserClose: function() {
    ui_obj.onError("3DS aborted by user");
  },
  onFailLiabilityShift: function(response) {
    ui_obj.onError("3DS liability shift failed");
    console.log(response);
  },
  onUseAVSLiabilityShiftFailed: function(response) {
    ui_obj.onError("3DS liability shift failed => we relay on AVS rules (" + bt_utils.getAVSChallenges().join(",") + ")");
    console.log(response);
  }
};

// copy the common configuration to the threeDconf configuration  
for (p in common) {
  if (!threeDconf.hasOwnProperty(p) && common.hasOwnProperty(p)) {
    threeDconf[p] = common[p];
  }
}

// finally create the instance using the configuration above
var tds = new ThreeDSecure(threeDconf);
```

For using the 3DS frame you should also stylish the popup using the CSS definition below:
```css
@CHARSET "UTF-8";

#modal {
	position: absolute;
	top: 0;
	left: 0;
	display: flex;
	align-items: center;
	height: 100vh;
	width: 100vw;
	z-index: 100;
}

.bt-modal-frame {
	height: 480px;
	width: 440px;
	margin: auto;
	background-color: #eee;
	z-index: 2;
	border-radius: 6px;
}

.bt-modal-body {
	height: 400px;
	margin: 0 20px;
	background-color: white;
	border: 1px solid lightgray;
}

.bt-modal-header, .bt-modal-footer {
	height: 40px;
	text-align: center;
	line-height: 40px;
}

.bt-mask {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	background-color: black;
	opacity: 0.8;
}

.hidden {
	display: none !important;
}
``` 