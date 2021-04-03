jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"bip/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"bip/test/integration/pages/Worklist",
		"bip/test/integration/pages/Object",
		"bip/test/integration/pages/NotFound",
		"bip/test/integration/pages/Browser",
		"bip/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "bip.view."
	});

	sap.ui.require([
		"bip/test/integration/WorklistJourney",
		"bip/test/integration/ObjectJourney",
		"bip/test/integration/NavigationJourney",
		"bip/test/integration/NotFoundJourney",
		"bip/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});