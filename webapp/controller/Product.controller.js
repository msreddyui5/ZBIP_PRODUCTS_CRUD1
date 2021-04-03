/*global location*/
sap.ui.define([
	"bip/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"bip/model/formatter",
	"sap/m/MessageToast"
], function(BaseController, JSONModel, History, formatter, MessageToast) {
	"use strict";
	return BaseController.extend("bip.controller.Product", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay, oViewModel = new JSONModel({
				busy: true,
				delay: 0,
				toppings: [],
				productData: {}
			});
			this.getRouter().getRoute("product").attachPatternMatched(this._onObjectMatched, this);
			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "productView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
			
			// Set the initial form to be the display one
			this._showFormFragment("DisplayProduct");
		},
		
		
		handleEditPress : function () {

			//Clone the data
			this._prodData = jQuery.extend({}, this.getView().getModel("productView").getData().productData);
			this._toggleButtonsAndView(true);

		},

		handleCancelPress : function () {

			//Restore the data
			var oModel = this.getView().getModel("productView");
			var oData = oModel.getData();

			oData.productData = this._prodData;

			oModel.setData(oData);
			this._toggleButtonsAndView(false);

		},
		handleDelete: function(){
			var oDataModel = this.getView().getModel();
			var payload = this.getView().getModel("productView").getProperty("/productData");
			oDataModel.remove("/ProductsSet('" + payload.ProductId + "')", {
				success: function(){
					MessageToast.show("Product Deleted successfully");
				},
				error: function(oError){
					sap.m.MessageBox.error(JSON.parse(oError.responseText).error.message.value);
				}
			});
		},
		handleSavePress : function () {
			
			//OData call to send data to backend
			var that = this;
			var oDataModel = this.getView().getModel();
			var payload = this.getView().getModel("productView").getProperty("/productData");
			oDataModel.update("/ProductsSet('" + payload.ProductId + "')", payload, {
				success: function(){
					MessageToast.show("Data updated successfully");
				},
				error: function(oError){
					that.getView().getModel("productView").setProperty("/productData", that._prodData);
					sap.m.MessageBox.error(JSON.parse(oError.responseText).error.message.value);
				}
			});
			
			
			this._toggleButtonsAndView(false);

		},

		_formFragments: {},

		_toggleButtonsAndView : function (bEdit) {
			var oView = this.getView();

			// Show the appropriate action buttons
			oView.byId("edit").setVisible(!bEdit);
			oView.byId("save").setVisible(bEdit);
			oView.byId("cancel").setVisible(bEdit);

			// Set the right form type
			this._showFormFragment(bEdit ? "ChangeProduct" : "DisplayProduct");
		},

		_getFormFragment: function (sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];

			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "bip.fragments." + sFragmentName);

			this._formFragments[sFragmentName] = oFormFragment;
			return this._formFragments[sFragmentName];
		},

		_showFormFragment : function (sFragmentName) {
			var oPage = this.byId("page");

			oPage.removeAllContent();
			oPage.insertContent(this._getFormFragment(sFragmentName));
		},

		
		/**
		 * Event handler  for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").productId;
			this.productId = sObjectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("ProductsSet", {
					ProductId: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("productView"),
				oDataModel = this.getModel();
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("productView"),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}
			var oObject = oView.getBindingContext().getObject();
			oViewModel.setProperty("/productData", oObject);
			// Everything went fine.
			oViewModel.setProperty("/busy", false);
		}
	});
});