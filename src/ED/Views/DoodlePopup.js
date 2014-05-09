/**
 * (C) Moorfields Eye Hospital NHS Foundation Trust, 2008-2011
 * (C) OpenEyes Foundation, 2011-2014
 * This file is part of OpenEyes.
 *
 * OpenEyes is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * OpenEyes is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenEyes.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global $: false, Mustache: false, ED: true */

var ED = ED || {};
ED.Views = ED.Views || {};

/**
 * This view class manages the doodle popup.
 */
ED.Views.DoodlePopup = (function() {

	'use strict';

	/**
	 * DoodlePopup constructor
	 * @param {ED.Drawing} drawing   A doodle drawing instance.
	 * @param {Number} width The width of the container.
	 * @param {HTMLElement} widgetContainer The widget container element
	 * @extends {ED.View}
	 */
	function DoodlePopup(drawing, container, width) {
		ED.View.apply(this, arguments);

		this.drawing = drawing;
		this.container = container;
		this.width = width;
		this.delayTimer = 0;

		this.registerForNotifications();
		this.createToolbar();
		this.createHelpButton();
		this.createTemplate();
	}

	DoodlePopup.prototype = Object.create(ED.View.prototype);
	DoodlePopup.prototype.constructor = DoodlePopup;

	/**
	 * Create the manipulation toolbar.
	 */
	DoodlePopup.prototype.createToolbar = function() {
		this.toolbar = new ED.Views.Toolbar(this.drawing, this.container);
		this.toolbar.on('button.action', this.render.bind(this));
	};

	/**
	 * Create the help button.
	 */
	DoodlePopup.prototype.createHelpButton = function() {
		this.helpButton = new ED.Views.DoodlePopup.Help(this);
	};

	/**
	 * Create the template for the popup.
	 */
	DoodlePopup.prototype.createTemplate = function() {
		this.template = ED.scriptTemplates['doodle-popup'];
	};

	/**
	 * Register for drawing notifications and bind interaction events.
	 */
	DoodlePopup.prototype.registerForNotifications = function() {
		this.drawing.registerForNotifications(this, 'notificationHandler', [
			'doodleAdded',
			'doodleDeleted',
			'doodleSelected',
			'doodleDeselected'
		]);
	};

	/**
	 * Compile the mustache template.
	 * @param  {Object} data Template data.
	 */
	DoodlePopup.prototype.render = function() {

		var doodle = this.drawing.selectedDoodle;

		// In some cases we won't have a selected doodle (like when deleting a doodle)
		if (!doodle) {
			return;
		}

		// Template data
		var data = {
			doodle: doodle,
			drawing: this.drawing,
			title: ED.titles[doodle.className],
			desc: ED.trans[doodle.className],
			lockedButtonClass: doodle.isLocked ? ' disabled' : '',
		};

		// Render the template
		var html = Mustache.render(this.template, data);
		this.container.html(html);

		// Add doodle controls
		doodle.showDoodleControls();

		this.emit('render');
	};

	/**
	 * Update the menu content with the specific doodle and either show or hide it.
	 * @param  {Boolean} show   Show or hide the menu.
	 */
	DoodlePopup.prototype.update = function(show) {
		if (show && this.drawing.selectedDoodle) {
			this.render();
			this.show();
		} else {
			this.hide();
		}
	};

	/**
	 * Hide the menu.
	 */
	DoodlePopup.prototype.hide = function() {
		this.delay(function() {
			this.emit('hide');
			this.container.css({
				right: 4
			}).addClass('closed');
		}.bind(this));
	};

	/**
	 * Show the menu.
	 */
	DoodlePopup.prototype.show = function() {
		this.delay(function() {
			this.emit('show');
			this.container.css({
				width: this.width,
				right: -1 * this.width
			}).removeClass('closed');
		}.bind(this));
	};

	/**
	 * Delay executing a callback.
	 * @param  {Function} fn    The callback function to execute.
	 * @param {Integer} amount The delay time (in ms)
	 */
	DoodlePopup.prototype.delay = function(fn, amount) {
		clearTimeout(this.delayTimer);
		amount = typeof amount === 'number' ? amount : 50;
		this.delayTimer = setTimeout(fn, amount);
	};

	/*********************
	 * EVENT HANDLERS
	 *********************/

	DoodlePopup.prototype.onDoodleAdded = function() {
		this.drawing.selectDoodle(this.drawing.selectedDoodle);
	};

	DoodlePopup.prototype.onDoodleDeleted = function() {
		this.update(false);
	};

	DoodlePopup.prototype.onDoodleSelected = function() {
		// We do this in the next event loop as the "doodleDeselect" event
		// is triggered before the "doodleSelect" event.
		setTimeout(this.update.bind(this, true));
	};

	DoodlePopup.prototype.onDoodleDeselected = function() {
		this.update(false);
	};

	return DoodlePopup;
}());
