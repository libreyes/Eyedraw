/**
 * Javascript file containing functions for the EyeDraw widget
 *
 * @link http://www.openeyes.org.uk/
 * @copyright Copyright &copy; 2012 OpenEyes Foundation
 * @license http://www.yiiframework.com/license/
 * Modification date: 17th August 2012
 *
 * This file is part of OpenEyes.
 *
 * OpenEyes is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * OpenEyes is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; with§§§out even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenEyes.  If not, see <http://www.gnu.org/licenses/>.
 * @package EyeDraw
 * @author Bill Aylward <bill.aylward@openeyes.org>
 * @version 0.95
 */

var ED = ED || {};

/**
 * Initialise an EyeDraw widget.
 *
 * @param {object} properties Object of properties passed from widget
 *     @property drawingName The EyeDraw drawing object
 *     @property canvasId The DOM id of the associated canvas element
 *     @property eye The eye (right = 0, left = 1) ***TODO*** handle this better
 *     @property idSuffix A suffix for DOM elements to distinguish those associated with this drawing object
 *     @property isEditable Flag indicating whether drawing object is editable or not
 *     @property graphicsPath Path to folder containing EyeDraw graphics
 *     @property onReadyCommandArray Array of commands and arguments to be run when images are loaded
 */
ED.init = (function() {

	'use strict';

	var maxTime = 5000; // 5 seconds

	function waitForStyleSheet(fileName, done, startTime) {

		if (!startTime) {
			startTime = (new Date()).getTime();
		}
		if (((new Date()).getTime() - startTime) >= maxTime) {
			return ED.errorHandler('OEEyeDraw.js', 'init', 'Unable to init eyedraw, stylesheet is not loaded.');
		}

		var found = false;
		var styleSheets = window.document.styleSheets;

		for(var i = 0, j = styleSheets.length; i < j; i++) {
			var sheet = styleSheets[i];
			if (sheet.href && sheet.href.indexOf(fileName) >= 0) {
				found = true;
				break;
			}
		}
		if (!found) {
			window.setTimeout(waitForStyleSheet.bind(null, fileName, done, startTime), 100);
		} else {
			done();
		}
	}

	return function(properties) {
		waitForStyleSheet('oe-eyedraw', function() {
			new ED.Controller(properties);
		});
	};
}());