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
// param grid - Grid instance reference if grid exists already (in case of page refresh)
// returns Object of processed parameter data. Used to create or update grid instance
function prepareGridParams(newValues, grid) {
    // component parameters
    let dataParam = newValues.rows;
    let configParam = newValues.columnConfigs;
    let gridOptionsParam = newValues.gridOptions;
    let styleParam = newValues.style;
    let changeDataParam = newValues.changeData;
    let securityParam = newValues.securityGroups;
    let primaryKeyFieldsParam = newValues.primaryKeyFields;

    // only included bc getGD depends on it. Not manipulated here only read
    let changeObj = changeDataParam;
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


    if (grid == undefined) {
      data = getGridData(dataParam, {}, relatedRecords, columnConfigs);
    } else {
      grid.updateData();
    }
    
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
    return { data, columnConfigs, gridOptions, changeObj, userPermissionLevel, editablePKFieldList };
}

let grid;

function main() {


  let data, columnConfigs, gridOptions, changeObj, userPermissionLevel, editablePKFieldList;

  try {
    
    Appian.Component.onNewValue(newValues => {

      // move this to only when grid == undefined?
      ({ data, columnConfigs, gridOptions, changeObj, userPermissionLevel, editablePKFieldList } = prepareGridParams(newValues, grid));

      // grid exists already - reload of screen
      if (grid != undefined) {
        // on save in appian, change object is emptied
        if (changeObj != null && changeObj.length == 0) {
          grid.changeObj = {};
        }
      } else {
        // init grid
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
