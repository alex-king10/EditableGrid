import { 
  CONTAINER_ID
} from "./constants.js";

import {
  getPKList,  
  getColMetaData,
  getGridData,
  getGridOptions,
  getUserPermission,
  getEditablePKList,
  getQueryInfoFromData,
  getQueryInfoFromColConfig,
  getHiddenColumns,
  getGridHeight
} from "./services/parameters.js"

import GridComponent from "./components/GridComponent.js";

// Processes all values passed from component parameters
// param newValues - object of parameter values from component
// returns Object of processed parameter data. Used to create or update grid instance
function prepareGridParams(newValues) {
    // component parameters
    let dataParam = newValues.rows;
    let configParam = newValues.columnConfigs;
    let gridOptionsParam = newValues.gridOptions;
    let showPrimaryKeysParam = newValues.showPrimaryKeys;
    let heightParam = newValues.height;
    let primaryKeyFieldsParam = newValues.primaryKeyFields;

    let data = [];
    let queryInfo = null;

    let primaryKeyFieldList = getPKList(primaryKeyFieldsParam);

    if (dataParam != null && dataParam.length != 0) {
      queryInfo = getQueryInfoFromData(dataParam[0]);
    } else {
      queryInfo = getQueryInfoFromColConfig(configParam);
    }
    
    // calculate column configurations 
    let { columnConfigs, relatedRecords, columnsToValidate } = getColMetaData(queryInfo, configParam);

    data = getGridData(dataParam, {}, relatedRecords, columnConfigs);
    
    // find indices of primary keys. Pass them as hiddenColumn list to grid definition.
    let hiddenCols = getHiddenColumns(showPrimaryKeysParam, queryInfo, primaryKeyFieldList);

    let gridHeight;
    if (dataParam != null) {
      gridHeight = getGridHeight(dataParam.length, heightParam);
    } else {
      gridHeight = getGridHeight(0, heightParam);
    }

    let gridOptions = getGridOptions(gridHeight, hiddenCols, gridOptionsParam);

    let editablePKFieldList = getEditablePKList(primaryKeyFieldList, relatedRecords);
    
    // values needed for grid instantiation
    return { data, columnConfigs, gridOptions, editablePKFieldList, columnsToValidate };
}

let grid;

function main() {


  let data, columnConfigs, gridOptions, editablePKFieldList, columnsToValidate;

  try {
    
    Appian.Component.onNewValue(newValues => {

      let changeObj = newValues.changeData;

      // If a has a custom validator or is a dropdown type
      // validate it on grid load


      // grid exists already - reload of screen
      if (grid != undefined) {
        grid.updateData();
        // on save in appian, change object is emptied
        if (changeObj != null && changeObj.length == 0) {
          grid.changeObj = {};
        }


      } else {
        // process parameters from component
        ({ data, columnConfigs, gridOptions, changeObj, editablePKFieldList, columnsToValidate } = prepareGridParams(newValues, grid));
        // init and render grid
        grid = new GridComponent(CONTAINER_ID, data, columnConfigs, gridOptions, editablePKFieldList);
        
        // servlet request to get user security permission levels
        getUserPermission(newValues.securityGroups).then(result => {
          grid.setUserPermissionLevel(result);
        }).catch(error => {
          console.error(`Error fetching user security info: ${error}`);
        });

        //Enforces validations before rendering
        grid.initGrid();
        grid.validateColumns(columnsToValidate);
      }
      
  
    });

    // never triggered - can try adding an event listener to see if the onNewValue function is finished
    // if (grid != undefined)  {
    //   console.log("Save EGC");
    //   Appian.Component.saveValue("changeData", Object.values(grid.changeObj));
    // }
    
  
  } catch (error) {
    console.error(error);
  }
  
}

main();
