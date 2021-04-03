sap.ui.define([
		"bip/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("bip.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);