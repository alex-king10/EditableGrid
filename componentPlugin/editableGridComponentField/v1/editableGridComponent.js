import { 
  CONTAINER_ID
} from "./constants.js";

import {
  getPKList, 
  getQueryInfo, 
  getColMetaData,
  getGridData,
  getGridOptions,
  getStyle,
  getUserPermission,
  getEditablePKList
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
    let styleParam = newValues.style;
    let changeDataParam = newValues.changeData;
    let securityParam = newValues.securityGroups;
    let primaryKeyFieldsParam = newValues.primaryKeyFields;

    let data = [];
    let queryInfo = null;

    let primaryKeyFieldList = getPKList(primaryKeyFieldsParam);

    if (dataParam != null && dataParam.length != 0) {
      queryInfo = getQueryInfo(dataParam[0], "dataParam");
    } else {
      queryInfo = getQueryInfo(configParam, "colConfigParam");
    }
    
    // calculate column configurations 
    let { columnConfigs, relatedRecords } = getColMetaData(queryInfo, configParam);

    data = getGridData(dataParam, {}, relatedRecords, columnConfigs);
    
    // set style of grid - includes height and showPK boolean
    let gridHeight, hiddenCols;
    if (dataParam != null) {
      ({ gridHeight, hiddenCols } = getStyle(queryInfo, styleParam, dataParam.length, primaryKeyFieldList));
    } else {
      ({ gridHeight, hiddenCols } = getStyle(queryInfo, styleParam, 0, primaryKeyFieldList));
    }

    let gridOptions = getGridOptions(gridHeight, hiddenCols, gridOptionsParam);

    // let userPermissionLevel = getUserPermission(securityParam);
    let userPermissionLevel = "editor";

    // get permission level for current user
    getUserPermission(securityParam).then(result => {
      userPermissionLevel = result;
    })
    .catch(error => {
      console.error("Error fetching user security info:", error);
    });

    let editablePKFieldList = getEditablePKList(primaryKeyFieldList, relatedRecords);
    

    // values needed for grid instantiation
    return { data, columnConfigs, gridOptions, userPermissionLevel, editablePKFieldList };
}

let grid;

function main() {


  let data, columnConfigs, gridOptions, userPermissionLevel, editablePKFieldList;

  try {
    
    Appian.Component.onNewValue(newValues => {

      let changeObj = newValues.changeData;
      // grid exists already - reload of screen
      if (grid != undefined) {
        grid.updateData();
        // on save in appian, change object is emptied
        if (changeObj != null && changeObj.length == 0) {
          grid.changeObj = {};
        }
      } else {
        // process parameters from component
        ({ data, columnConfigs, gridOptions, changeObj, userPermissionLevel, editablePKFieldList } = prepareGridParams(newValues, grid));
        // init and render grid
        grid = new GridComponent(CONTAINER_ID, data, columnConfigs, gridOptions, {}, userPermissionLevel, editablePKFieldList);
        grid.initGrid();
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
