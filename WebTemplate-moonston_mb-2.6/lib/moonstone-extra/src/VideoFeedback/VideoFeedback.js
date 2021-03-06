/**
* Contains the declaration for the {@link module:moonstone-extra/VideoFeedback~VideoFeedback} kind.
* @module moonstone-extra/VideoFeedback
*/

require('moonstone-extra');

var
	kind = require('enyo/kind'),
	util = require('enyo/utils'),
	job = require('enyo/job'),
	Control = require('enyo/Control');

var
	Icon = require('moonstone/Icon');

/**
* {@link module:moonstone-extra/VideoFeedback~VideoFeedback} is a control used by {@link module:moonstone-extra/VideoPlayer~VideoPlayer} to display
* feedback in response to input from video playback controls. It may also be used to
* display custom messages. The {@link module:moonstone-extra/VideoTransportSlider~VideoTransportSlider} control typically
* communicates directly with this one.
*
* @class VideoFeedback
* @extends module:enyo/Control~Control
* @ui
* @public
*/
module.exports = kind(
	/** @lends module:moonstone-extra/VideoFeedback~VideoFeedback */ {

	/**
	* @private
	*/
	name: 'moon.VideoFeedback',

	/**
	* @private
	*/
	kind: Control,

	/**
	* @private
	*/
	classes: 'moon-video-player-feedback',

	/**
	* @private
	* @lends module:enyo/VideoFeedback~VideoFeedback.prototype
	*/
	published: {

		/**
		* Length of time (in milliseconds) after which the on-screen feedback will automatically
		* disappear.
		*
		* @type {Number}
		* @default 2000
		* @public
		*/
		autoTimeoutMS: 2000,

		/**
		* When `true`, the content will have locale-safe uppercasing applied.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		uppercase: true
	},

	/**
	* @private
	*/
	_showingFeedback: false,

	/**
	* @private
	*/
	_imagePath:				'images/video-player/',

	/**
	* @private
	*/
	_jumpBackImg:			'jumpbackward',

	/**
	* @private
	*/
	_rewindImg:				'backward',

	/**
	* @private
	*/
	_playImg:				'play',

	/**
	* @private
	*/
	_pauseImg:				'pause',

	/**
	* @private
	*/
	_fastForwardImg:		'forward',

	/**
	* @private
	*/
	_jumpForwardImg:		'jumpforward',

	/**
	* @private
	*/
	_pauseBackImg:			'pausebackward',

	/**
	* @private
	*/
	_pauseForwardImg:		'pauseforward',

	/**
	* @private
	*/
	_pauseJumpBackImg:		'pausejumpbackward',

	/**
	* @private
	*/
	_pauseJumpForwardImg:	'pausejumpforward',

	/**
	* @private
	*/
	_autoTimer: null,

	/**
	* @private
	*/
	components: [
		{name: 'leftIcon', kind: Icon, classes: 'moon-video-feedback-icon-left', allowHtml: true, showing: false},
		{name: 'feedText', kind: Control, classes: 'moon-video-feedback-text', allowHtml: true, showing: false},
		{name: 'rightIcon', kind: Icon, classes: 'moon-video-feedback-icon-right', allowHtml: true, showing: false}
	],

	/**
	* Updates [IconButton]{@link module:moonstone/IconButton~IconButton} image and [Slider]{@link module:moonstone/Slider~Slider}
	* message with current state and playback rate when any of the playback controls are
	* triggered.
	*
	* Playback states are mapped to `playbackRate` values according to the following hash:
	*
	* ```javascript
	* {
	*	'fastForward': ['2', '4', '8', '16'],
	*	'rewind': ['-2', '-4', '-8', '-16'],
	*	'slowForward': ['1/4', '1/2'],
	*	'slowRewind': ['-1/2', '-1']
	* }
	* ```
	*
	* @private
	*/
	checkIconType: function(icon) {
		var imagesrcRegex = /\.(jpg|jpeg|png|gif)$/i;
		return imagesrcRegex.test(icon) ? 'image' : 'iconfont';
	},

	/**
	* @private
	*/
	retrieveImgOrIconPath:function(icon){
		return this.checkIconType(icon) == 'image' ? this._imagePath + icon : icon;
	},

	/**
	* Sets the current state for a {@link module:moonstone-extra/VideoFeedback~VideoFeedback} control.
	*
	* @param {String} msg - The string to display.
	* @param {moon.VideoTransportSlider~FeedbackParameterObject} params - A
	*	[hash]{@glossary Object} of parameters accompanying the message.
	* @param {Boolean} persist - If `true`, the [feedback]{@link module:moonstone-extra/VideoFeedback~VideoFeedback}
	* control will not be automatically hidden.
	* @param {String} leftSrc - The source url for the image displayed on the left side
	*	of the feedback control.
	* @param {String} rightSrc - The source url for the image displayed on the right
	*	side of the feedback control.
	* @param {Boolean} preview - Specify `true` to put the
	* [video player]{@link module:moonstone-extra/VideoPlayer~VideoPlayer} in preview mode; otherwise, `false`.
	* @public
	*/
	feedback: function(msg, params, persist, leftSrc, rightSrc, preview) {
		var customMessage = false;
		msg = msg || '';
		params = params || {};

		switch (msg) {
		case 'Play':
			msg = '';
			rightSrc = this.retrieveImgOrIconPath(this._playImg);
			break;

		case 'Pause':
			msg = '';
			rightSrc = this.retrieveImgOrIconPath(this._pauseImg);
			break;

		case 'Rewind':
			msg = Math.abs(params.playbackRate) + 'x';
			leftSrc = this.retrieveImgOrIconPath(this._rewindImg);
			break;

		case 'Slowrewind':
			msg = params.playbackRate.split('-')[1] + 'x';
			leftSrc = this.retrieveImgOrIconPath(this._pauseBackImg);
			break;

		case 'Fastforward':
			msg = params.playbackRate + 'x';
			rightSrc = this.retrieveImgOrIconPath(this._fastForwardImg);
			break;

		case 'Slowforward':
			msg = params.playbackRate + 'x';
			rightSrc = this.retrieveImgOrIconPath(this._pauseForwardImg);
			break;

		case 'JumpBackward':
			msg = '';
			leftSrc = this.retrieveImgOrIconPath(this._pauseJumpBackImg);
			break;

		case 'JumpForward':
			msg = '';
			rightSrc = this.retrieveImgOrIconPath(this._pauseJumpForwardImg);
			break;

		case 'JumpToStart':
			msg = '';
			leftSrc = this.retrieveImgOrIconPath(this._pauseJumpBackImg);
			break;

		case 'JumpToEnd':
			msg = '';
			rightSrc = this.retrieveImgOrIconPath(this._pauseJumpForwardImg);
			break;

		case 'Stop':
			msg = '';
			rightSrc = '';
			break;

		// If the user sends in a custom message, block other messages until it's hidden
		default:
			customMessage = true;
			this._showingFeedback = true;
			break;
		}

		// Don't show feedback if we are showing custom feedback already, unless this is a new custom message
		if (!customMessage && this._showingFeedback) return;
		// If msg is '', we do not need to show
		this.$.feedText.set('showing', !!msg);
		// Set content as _inMessage_
		this.$.feedText.setContent( this.get('uppercase') ? util.toUpperCase(msg) : msg);

		// Show output controls when video player is not preview mode
		if (!preview) this.showFeedback();

		// Show icons as appropriate
		this.updateIcons(leftSrc, rightSrc);

		//* Don't set up hide timer if _inPersistShowing_ is true
		if (persist) this.resetAutoTimer();
		else this.setAutoTimer();

		this.inPersistShowing = persist;
	},

	/**
	* Determines whether the current feedback message is persistent (i.e., it has no
	* timeout).
	*
	* @returns {Boolean} `true` if the current feedback message has no timeout;
	* otherwise, `false`, meaning that the feedback message has a timeout and is not
	* persistent.
	* @public
	*/
	isPersistShowing: function() {
		return this.inPersistShowing;
	},

	/**
	* Shows this control.
	*
	* @public
	*/
	showFeedback: function() {
		this.setShowing(true);
	},

	/**
	* Hides this control and sets internal `_showingFeedback` flag to `false`.
	*
	* @public
	*/
	hideFeedback: function() {
		this.setShowing(false);
		this._showingFeedback = false;
	},

	/**
	* Starts job that will hide this control.
	*
	* @private
	*/
	setAutoTimer: function() {
		this.hideJob = job(this.id + 'hide', this.bindSafely('hideFeedback'), this.getAutoTimeoutMS());
	},

	/**
	* Clears job that will hide this control.
	*
	* @private
	*/
	resetAutoTimer: function() {
		job.stop(this.id + 'hide');
	},

	/**
	* Shows or hides icons, and sets sources.
	*
	* @private
	*/
	updateIcons: function(leftSrc, rightSrc) {
		if (leftSrc) {
			this.$.leftIcon.show();
			this.displayIconSrcOrFont(this.$.leftIcon, leftSrc);
			this.$.leftIcon.addRemoveClass('moon-video-feedback-icon-only', !this.$.feedText.get('showing'));
		} else {
			this.$.leftIcon.hide();
		}

		if (rightSrc) {
			this.$.rightIcon.show();
			this.displayIconSrcOrFont(this.$.rightIcon, rightSrc);
			this.$.rightIcon.addRemoveClass('moon-video-feedback-icon-only', !this.$.feedText.get('showing'));
		} else {
			this.$.rightIcon.hide();
		}

	},

	/**
	* @private
	*/
	displayIconSrcOrFont: function(iconKind, icon) {
		if (this.checkIconType(icon) == 'image') {
			iconKind.set('icon', '');
			iconKind.set('src', icon);
		} else {
			iconKind.set('src', '');
			iconKind.set('icon', icon);
		}
	}
});
