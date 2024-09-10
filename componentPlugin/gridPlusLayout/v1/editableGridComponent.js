import {
  CONTAINER_ID
} from "./constants.js";

import {
  getColMetaData,
  getGridData,
  getGridOptions,
  getUserPermission,
  getQueryInfoFromData,
  getQueryInfoFromColConfig,
  getHiddenColumns,
  getGridHeight,
  getParsedColumnConfigs,
  getPKField
} from "./services/parameters.js"

import GridComponent from "./components/GridComponent.js";

// Processes all values passed from component parameters
// param newValues - object of parameter values from component
// returns Object of processed parameter data. Used to create or update grid instance
function prepareGridParams(newValues) {
    // component parameters
    let dataParam = newValues.rows;
    let configParam = newValues.columnConfigs;
    let rowHeadersParam = newValues.rowHeaders;
    let showPrimaryKeysParam = newValues.showPrimaryKey;
    let heightParam = newValues.height;
    let primaryKeyFieldParam = newValues.primaryKeyFieldName;
    let hiddenFieldsParam = newValues.hiddenFields;

    let data = [];
    let dataValidationMessages = [];
    let queryInfo = null;

    let primaryKeyField = getPKField(primaryKeyFieldParam);

    let {colConfigs, colValidationMessages} = getParsedColumnConfigs(configParam);

    if (dataParam != null && dataParam.length != 0) {
      queryInfo = getQueryInfoFromData(dataParam[0]);
    } else {
      queryInfo = getQueryInfoFromColConfig(colConfigs);
    }

    // calculate column configurations
    let { columnConfigs, relatedRecords, columnsToValidate } = getColMetaData(queryInfo, colConfigs);

    ( {data, validationMessages: dataValidationMessages}  = getGridData(dataParam, {}, relatedRecords, columnConfigs));

    // find indices of primary keys. Pass them as hiddenColumn list to grid definition.
    queryInfo = columnConfigs.length !== 0? columnConfigs.map(x => x.data): queryInfo;
    let hiddenCols = getHiddenColumns(showPrimaryKeysParam, queryInfo, primaryKeyField, hiddenFieldsParam);

    let gridHeight;
    if (dataParam != null) {
      gridHeight = getGridHeight(dataParam.length, heightParam);
    } else {
      gridHeight = getGridHeight(0, heightParam);
    }

    let gridOptions = getGridOptions(gridHeight, hiddenCols, rowHeadersParam);

    let validationMessages = [...dataValidationMessages, ...colValidationMessages];

    // values needed for grid instantiation
    return { data, columnConfigs, gridOptions, primaryKeyField, columnsToValidate, validationMessages };
}

let grid;

function main() {


  let data, columnConfigs, gridOptions, primaryKeyField, columnsToValidate, validationMessages;

  try {

    Appian.Component.onNewValue(newValues => {

      let changeObj = newValues.changeData;
      let deleteObj = newValues.deleteData;

      // grid exists already - reload of screen
      if (grid != undefined) {
        grid.updateData();
        // on save in appian, change object is emptied
        if (changeObj != null && changeObj.length == 0) {
          grid.changeObj = {};
        }
        // on save in appian, delete list is emptied
        if (deleteObj != null && deleteObj.length == 0) {
          grid.deleteList = [];
        }

        grid.sendValidations();

      // initial grid load
      } else {

        // process parameters from component
        ({ data, columnConfigs, gridOptions, changeObj, primaryKeyField, columnsToValidate, validationMessages } = prepareGridParams(newValues, grid));
        
        // init and render grid
        grid = new GridComponent(CONTAINER_ID, newValues, data, columnConfigs, gridOptions, primaryKeyField, validationMessages);

        grid.initGrid();

        if (newValues.securityGroups !== null && newValues.securityGroups.length !== 0) {
          // servlet request to get user security permission levels
          getUserPermission(newValues.securityGroups).then(result => {
            grid.setUserPermissionLevel(result);
            grid.validateColumns(columnsToValidate);
          }).catch(error => {
            console.error(`Error fetching user security info: ${error}`);
          });
        } else {
          // if no groups set, all users have editor permissions
          grid.setUserPermissionLevel("editor");
          grid.validateColumns(columnsToValidate);
        }

        grid.sendValidations();

      }

    });


  } catch (error) {
    console.error(error);
  }

}

main();
