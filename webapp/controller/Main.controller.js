sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageBox',
    "sap/ui/core/format/DateFormat",
    'sap/ui/comp/library',
    'sap/ui/model/type/String',
    'sap/m/Token'
], (Controller, ODataModel, Filter, FilterOperator, JSONModel, MessageBox, DateFormat, compLibrary, TypeString, Token) => {
    "use strict";

    return Controller.extend("com.sap.lh.mr.zvoltagevalidation.controller.Main", {
        onInit() {
            const oView = this.getView();
            oView.setModel(new JSONModel({
                rowMode: "Fixed"
            }), "ui");

            this._oSingleConditionMultiInput = this.byId("idEquipment");
            //this._oSingleConditionMultiInput.setTokens(this._getDefaultTokens());
        },
        onSearch: function () {
            const oView = this.getView();
            var aTokens = this.getView().byId("idEquipment").getTokens();
            var equipmentValue = "";
            if(aTokens.length === 0)
            {
                return MessageBox.error("Please select Equipment");
            }
            else if(aTokens.length === 1){
                equipmentValue = aTokens[0].getText();
                equipmentValue = equipmentValue.replace("=","");
            }
            else if(aTokens.length > 1){
                return MessageBox.error("Select only one Equipment...");
            }
            // var aTokens = this.getView().byId("idEquipment").getTokens()[0].getText();

            // var aFilters = aTokens.map(function (oToken) {
            //     if(oToken.data("range")) {
            //         var oRange = oToken.data("range");
            //         return new Filter({
            //             path: "Equipment",
            //             operator: oRange.exclude? "NE" : oRange.operation,
            //             value1: oRange.value1,
            //             value2: oRange.value2
            //         });
            //     }
            //     else {
            //         return new Filter({
            //             path: "Equipment",
            //             operator: "EQ",
            //             value1: aTokens[0].getKey()
            //         });					
            //     }				
            // });

            var periodFrom = this.getView().byId("idDTP1").getValue();

            var periodTo = this.getView().byId("idDTP2").getValue();
            if (periodFrom === "" || periodTo === "") {
                return MessageBox.error("Period From and Period To are mandatatory...");
            }
            var fromDate = this.getDateFormat(this.byId("idDTP1").getDateValue());
            var toDate = this.getDateFormat(this.byId("idDTP2").getDateValue());

            var aFilter = [];
            aFilter.push(new Filter("Equipment", FilterOperator.EQ, equipmentValue));

            aFilter.push(new Filter("Period", FilterOperator.BT, fromDate, toDate));
            var oModel = this.getOwnerComponent().getModel();
            var oJsonModel = new sap.ui.model.json.JSONModel();
            var oBusyDialog = new sap.m.BusyDialog({
                title: "Loading Data",
                text: "Please wait..."
            });
            oBusyDialog.open();
            oModel.read("/OutputSet", {
                filters: aFilter,
                success: function (response) {
                    oBusyDialog.close();
                    oJsonModel.setData(response.results);
                    oView.byId("idTableVolgeVal").setModel(oJsonModel, "VoltageValidationModel");
                },
                error: (oError) => {
                    oBusyDialog.close();
                    console.error("Error:", oError);
                }
            });
        },
        getDateFormat: function (strDate) {

            var oDateFormat = DateFormat.getInstance({
                UTC: false,
                pattern: "yyyy-MM-ddTHH:mm:ss"
            });

            //var oDateFormat = DateFormat.getDateTimeInstance({ pattern: "yyyy-MM-ddTHH:mm:ss" });
            var formatDate = oDateFormat.format(new Date(strDate));
            return formatDate.toString();
            //return "datetime" + formatDate ;
        },
        // region Single Condition value help
        onSingleConditionVHRequested: function () {
            this.loadFragment({
                name: "com.sap.lh.mr.zvoltagevalidation.fragment.equipment"
            }).then(function (oSingleConditionDialog) {
                this._oSingleConditionDialog = oSingleConditionDialog;
                oSingleConditionDialog.setRangeKeyFields([{
                    label: "Equipment",
                    key: "Equipment",
                    type: "string",
                    typeInstance: new TypeString({}, {
                        maxLength: 22
                    })
                }]);

                oSingleConditionDialog.setTokens(this._oSingleConditionMultiInput.getTokens());
                oSingleConditionDialog.open();
            }.bind(this));
        },

        onSingleConditionValueHelpOkPress: function (oEvent) {
            var aTokens = oEvent.getParameter("tokens");
            this._oSingleConditionMultiInput.setTokens(aTokens);
            this._oSingleConditionDialog.close();
        },
        onSingleConditionCancelPress: function () {
            this._oSingleConditionDialog.close();
        },
        onSingleConditionAfterClose: function () {
            this._oSingleConditionDialog.destroy();
        },
        // #endregion
        // _getDefaultTokens: function () {
        //     var ValueHelpRangeOperation = compLibrary.valuehelpdialog.ValueHelpRangeOperation;
        //     var oToken1 = new Token({
        //         key: "range_0",
        //         text: "=HT-1001"
        //     }).data("range", {
        //         "exclude": false,
        //         "operation": ValueHelpRangeOperation.EQ,
        //         "keyField": "Equipment"
        //     });
        //     var oToken2 = new Token({
        //         key: "range_1",
        //         text: "!(=HT-1000)"
        //     }).data("range", {
        //         "exclude": true,
        //         "operation": ValueHelpRangeOperation.EQ,
        //         "keyField": "Equipment"
        //     });

        //     return [oToken1, oToken2];
        // }
    });
});