import { CONTEXT_MENU_EDITOR, CONTEXT_MENU_VIEWER } from "../constants.js";
import {
    formatColumnHeader
} from "../services/parameters.js"

class GridComponent {

    // init grid component instance
    constructor(containerId, initParams, data, columnConfigs, gridOptions, pkField, validationMessages, hotInstance, userPermissionLevel) {
        this.containerId = containerId;
        this.initParams = initParams;
        this.data = data;
        this.columnConfigs = columnConfigs;
        this.gridOptions = gridOptions;
        this.pkField = pkField;
        this.changeObj = {};
        this.deleteList =[];
        this.validationMessages = new Set(validationMessages);

        // typically not set on instantiation of object
        this.hotInstance = hotInstance;
        this.userPermissionLevel = userPermissionLevel;
    }

    sendValidations() {
        Appian.Component.setValidations(Array.from(this.validationMessages));
    }

    setValidationMessages(messages) {
        if (typeof(messages) === 'object') {
            this.validationMessages.add(...messages);
        } else {
            this.validationMessages.add(messages);
        }
    }

    deleteValidationMessages(message) {
        if (message !== null) {
            this.validationMessages = new Set([]);
        } else {
            this.validationMessages.delete(message);
        }
    }

    // initialize grid instance
    initGrid() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('Grid container does not exist');
        }

        this.hotInstance = new Handsontable(container, {
            licenseKey: "non-commercial-and-evaluation"
          });

        this.setColumnValidators();

        if (this.columnConfigs.length === 0) {
            // if grid data and colConfig are empty
            this.setValidationMessages("The parameter 'columnConfigs' is empty or null. Please define a value for columnConfigs by using a colConfig function.");
        } else {
            this.hotInstance.updateSettings({
                data: this.data,
                columns: this.columnConfigs
            });
        }
       

        this.setGridOptions(this.gridOptions);

        this.addListeners();
    }

    setData(data) {
        // write this logic
        this.data = data;
        this.hotInstance.updateSettings({
            data: this.data,
        });
    }

    setColumnConfigs(columnConfigs) {
        this.columnConfigs = columnConfigs;
        this.hotInstance.updateSettings({
            columns: this.columnConfigs,
        });
    }

    setColumnValidators() {
        this.columnConfigs.forEach((colConfig, index) => {
            if (colConfig.validator) {
                let { name, operator, value } = colConfig.validator;

                if (colConfig.type == "numeric" && value !== null) {
                    value = Number(value);
                }

                const customValidator = (query, callback) => {
                    let isValid = false;

                    if (Array.isArray(query)) {
                        switch(operator) {
                            case "contains":
                                isValid = query.includes(value);
                                break;
                            case "notContains":
                                isValid = !query.includes(value);
                                break;
                            case "isNullOrEmpty":
                                isValid = query.length === 0;
                                break;
                            case "isNotNullOrEmpty":
                                isValid = query.length !== 0;
                                break;
                            default:
                                isValid = false;
                                this.setValidationMessages(`Fields of 1 to Many type related records cannot accept operator type: ${operator} as they are of type List. Acceptable operators include contains, notContains, isNullOrEmpty, and isNotNullOrEmpty.`);
                                console.error("Unknown operator: ", operator);
                        }
                    } else {
                        switch (operator) {
                            case "contains":
                                if (query !== null) { isValid = query.includes(value); }
                                break;
                            case "notContains":
                                if (query !== null) { isValid = !query.includes(value); }
                                isValid = true;
                                break;
                            case "equals":
                                isValid = query === value;
                                break;
                            case "notEquals":
                                isValid = query !== value;
                                break;
                            case "greaterThan":
                                isValid = query > value;
                                break;
                            case "lessThan":
                                isValid = query < value;
                                break;
                            case "regex":
                                try {
                                    const regex = new RegExp(value); // Create a new RegExp object using the query string
                                    isValid = regex.test(query); // Test the value against the regex
                                } catch (error) {
                                    console.error("Invalid regex pattern:", query, error);
                                    isValid = false; // Set isValid to false if the regex is invalid
                                }
                                break;
                            case "isNullOrEmpty":
                                isValid = (query === null || query === "");
                                break;
                            case "isNotNullOrEmpty":
                                isValid = (query !== null && query !== "");
                                break;
                            case "isTrue":
                                isValid = query === true;
                                break;
                            case "isFalse":
                                isValid = query === false;
                                break;
                            default:
                                isValid = false;
                                console.error("Unknown operator:", operator);
                        }
                    }
                    callback(isValid);
                };

                Handsontable.validators.registerValidator(name, customValidator);
                colConfig.validator = name;
            }
        });
    }

    validateColumns(columnsToValidate) {
        this.hotInstance.validateColumns(columnsToValidate, (valid) => {
        //   console.log(valid);
        });
      }


    // not sure if this function logic should go here?
    updateData() {
        let currRowIdx;
        let currChangeItem;

        // console.log("Updating data");

        if (this.data != null && this.data.length != 0) {
            if (Object.keys(this.changeObj).length == 0) {
                // no updates to make to data var
                return this.data;
            } else {
                for (let i = 0; i < Object.keys(this.changeObj).length; i++) {
                    currRowIdx = Object.keys(this.changeObj)[i];
                    currChangeItem = Object.values(this.changeObj)[i];
                    // update row in data var with value from changeObj
                    this.data[currRowIdx] = Object.assign(this.data[currRowIdx], currChangeItem);
                }
            }
        }
    }

    setGridOptions(gridOptions) {

        this.gridOptions = gridOptions;

        this.hotInstance.updateSettings(this.gridOptions);

        // handle column header formatting on sort
        this.hotInstance.updateSettings({
            afterGetColHeader: function(column, TH) {
                if (column > -1) { formatColumnHeader(TH); } 
            }
        });
    }

    getGridOptions() {
        return this.gridOptions;
    }

    updateGridOptions(option, newValue) {
        // update local gridOptions property
        this.gridOptions[option] = newValue;
        // use HoT hook to update grid
        this.hotInstance.updateSettings({[option] : newValue});
    }

    setChangeObj(changeObj) {
        this.changeObj = changeObj;
    }

    getUserPermissionLevel() {
        return this.userPermissionLevel;
    }

    handleViewerPermissions() {
        // update actions available in context menu
        this.updateGridOptions('contextMenu', CONTEXT_MENU_VIEWER);

        // add readOnly attribute and lock icon to all columns
        if (this.columnConfigs != null) {
            this.columnConfigs.forEach(colConfig => {
                colConfig['headerClassName'] = 'myColHeader header-readOnly';
                colConfig['readOnly'] = true;
            });
            this.setColumnConfigs(this.columnConfigs);
        }
    }

    handleEditorPermissions() {
        // update actions available in context menu
        this.updateGridOptions('contextMenu', CONTEXT_MENU_EDITOR);
        this.updateGridOptions('readOnly', false);
    }

    setUserPermissionLevel(userPermissionLevel) {
        this.userPermissionLevel = userPermissionLevel;

        if (userPermissionLevel === "editor") { this.handleEditorPermissions(); } 
        else { this.handleViewerPermissions(); }
    }

    // Handles changes made to the grid by modifying this.changeObj
    // Called by addListeners in 'afterChange' hook
    onChange(cellMeta, newValue) {
        if (cellMeta != null) {
            let dataItem = {};
            let gridRow;

            if (cellMeta.row in this.changeObj) {
                this.changeObj[cellMeta.row][cellMeta.prop] = newValue;
            } else {
                // add PK if exists
                // access data at modified row
                gridRow = this.data[cellMeta.row];

                // add new change { name : 'test' }
                dataItem[cellMeta.prop] = newValue;

                // add primary keys (parent and related) to changeObj at this record
                // only 0 if pkName not given in recordTypeInfo - shows a validation message
                if (this.pkField !== null) {
                    if (this.pkField in gridRow && cellMeta.prop != this.pkField) {
                        dataItem[this.pkField] = gridRow[this.pkField];
                    } else if (!(this.pkField in gridRow || this.pkField === "N/A")) {
                        // if primary key is not in grid's data (can't update, only creates with empty pk value)
                        this.setValidationMessages("To save changes made to the grid's data, please ensure that the primary key field is defined as a colConfig in the columnConfig parameter.")
                    }
                } else {
                    // if PK not provided as a parameter
                    this.setValidationMessages("To save changes made to the grid's data, please provide the proper primary key field name in the primaryKeyField parameter.")

                }

                this.changeObj[cellMeta.row] = dataItem;

            }

        }

    }

    onDelete(physicalRows) {
        let deleteObj;
        physicalRows.forEach(rowIdx => {
            deleteObj = {};
            if (this.pkField in this.data[rowIdx]) {
                if (this.data[rowIdx][this.pkField] === null) { this.setValidationMessages("Cannot remove a row with a null primary key field value."); }
                deleteObj[this.pkField] = this.data[rowIdx][this.pkField];
                this.deleteList.push(deleteObj);
            } else {
                this.setValidationMessages("To save deletions made to the grid's data, please enter the proper primary key field for the data to delete. This value can be defined as a string in the primaryKeyField parameter.")
            }
        })
    };

    addListeners() {
        if (this.hotInstance != null) {
            // Handles saving changes made to the grid by calling onChange and updating changeObj
            // Sends changeObj to Appian local var in changeData param
            this.hotInstance.addHook('afterChange', (changes) => {
                if (this.pkField === null) {
                    this.setValidationMessages("To save changes made to data in the grid, define a primary key for the primary record type in the primaryKeyFields parameter.");
                } else if (this.initParams.changeData === null) {
                    this.setValidationMessages("To save changes made to data in the grid, set a value for the changeData parameters.");
                } else {
                    // call handle change function
                    changes?.forEach(change => {
                        const [row, prop, oldValue, newValue] = change;
                        if (this.initParams.rows === null && oldValue !== null) {
                            this.setValidationMessages("Cannot edit newly created records.");
                        } else if (newValue !== oldValue)
                        {
                            let colIdx = this.hotInstance.propToCol(prop);
                            let cellMeta;
                            if (colIdx !== -1) {
                                cellMeta = this.hotInstance.getCellMeta(row, colIdx);
                                this.onChange(cellMeta, newValue);
                            }
                        }

                    });
                    Appian.Component.saveValue("changeData", Object.values(this.changeObj));
                }

                this.sendValidations();

            });

            this.hotInstance.addHook('beforeRemoveRow', (_, __, physicalRows) => {
                if (this.pkField === null) {
                    this.setValidationMessages("To save deletions made to data in the grid, define a primary key for the primary record type in the primaryKeyFields parameter.");
                } else if (this.initParams.deleteData === null) {
                    this.setValidationMessages("To save deletions made to data in the grid, set a value for the deleteData parameters.");
                } else {
                    this.onDelete(physicalRows);
                    Appian.Component.saveValue("deleteData", this.deleteList);
                }
                this.sendValidations();

            });

        } else {
            console.error("Hot Instance null");
        }
    }

}

export default GridComponent;