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


// function getEditablePKList(primaryKeyFieldList, relatedRecords) {
//   let relatedRecordFields = Object.values(relatedRecords).flat();
//   const editablePKList = primaryKeyFieldList.filter(x => !relatedRecordFields.includes(x));
//   return editablePKList;
// }


// INSTANTIATE GRID W/ DATA AND COLUMN
  // depends on relatedRecords created in setColMetaData
// function setGridData(rowsParam, changeObj)
// {

//   let currRowIdx;
//   let currChangeItem;

//   if (rowsParam != null && rowsParam.length != 0) {
//     dataMap = rowsParam;
//     if (Object.keys(changeObj).length == 0 && Object.keys(relatedRecords).length == 0) {
//     // no updates to make to data var
//       return dataMap;
//     } else {
//       let currRow;
//       let displayFields;

//       //update changed indices in dataMap var
//       if (Object.keys(changeObj).length != 0) {
//         for (let i = 0; i < Object.keys(changeObj).length; i++) {
//           currRowIdx = Object.keys(changeObj)[i];
//           currChangeItem = Object.values(changeObj)[i];
//           // update row in data var with value from changeObj
//           dataMap[currRowIdx] = Object.assign(dataMap[currRowIdx], currChangeItem);
//         }
//       }

//       // process related records 
//       if (Object.keys(relatedRecords).length > 0) {
//         // loop over data
//         for (let j = 0; j < dataMap.length; j++) {
//           currRow = dataMap[j];
//           // loop over related record
//           Object.keys(relatedRecords).forEach(relField => {
//              // { ownerRel: ['name'] }
//              if (relField in currRow && currRow[relField] != null) {
//               displayFields = relatedRecords[relField];

//               // check if relationship is 1:N
//               if (Array.isArray(currRow[relField])) {
//                 currRow = get1_NRecordData(relField, displayFields, currRow);

//               } else {
//                 // index into object, add specified fields to dataMap as flat key:value pair
//                 displayFields?.forEach(displayField => {
//                   if (displayField in currRow[relField]) {
//                     currRow[displayField] = currRow[relField][displayField];
//                   } else {
//                     console.log(`Display field: ${displayField} not in object at index ${j}`);
//                   }
//                 });
//               }

//               // remove relField:{object} from data
//               if (typeof(currRow[relField]) == 'object' || Array.isArray(currRow[relField])) {
//                 delete currRow[relField];
//               }

//              }
//           });
          
//         }
        
//       }
      
//     }
    
//   } else if (columnHeaderData2.length != 0) {
//     // if no data given, use colConfig as schema and set temp null values in cells
//     let tempRow = {};
//     columnHeaderData2?.forEach(colConfig => {
//       if ('data' in colConfig) {
//         tempRow[colConfig.data] = null;
//       }
//     });
//     dataMap.push(tempRow);
//   }

//   // if they're both empty, handled in grid creation - no data or column value passed

//   return dataMap;
// }

// updates dataMap with changeObj
// function updateGridData(dataMap, changeObj)
// {

//   let currRowIdx;
//   let currChangeItem;

//   if (dataMap != null && dataMap.length != 0) {
//     // redundant?
//     // dataMap = rowsParam;
//     if (Object.keys(changeObj).length == 0) {
//     // no updates to make to data var
//       return dataMap;
//     } else {
//       //update changed indices in dataMap var
//       if (Object.keys(changeObj).length != 0) {
//         for (let i = 0; i < Object.keys(changeObj).length; i++) {
//           currRowIdx = Object.keys(changeObj)[i];
//           currChangeItem = Object.values(changeObj)[i];
//           // update row in data var with value from changeObj
//           dataMap[currRowIdx] = Object.assign(dataMap[currRowIdx], currChangeItem);
//         }
//       }
      
//     }
    
//   } 

//   // if they're both empty, handled in grid creation - no data or column value passed
//   return dataMap;
// }


// HANDLE CHANGES IN DATA
// function onChange(primaryKeyFieldList, cellMeta, newValue)
// {

//   if (cellMeta != null)
//   {
//     let dataItem = {};
//     let gridRow;

//     if (cellMeta.row in changeObj) {
//       changeObj[cellMeta.row][cellMeta.prop] = newValue;
//     } else {
//     // add PK if exists
//       // access data at modified row
//       gridRow = dataMap[cellMeta.row];

//       // add new change { name : 'test' }
//       dataItem[cellMeta.prop] = newValue;

//       // add primary keys (parent and related) to changeObj at this record
//         // only 0 if pkName not given in recordTypeInfo - shows a validation message
//       if (primaryKeyFieldList.length != 0) {
//         primaryKeyFieldList.forEach(pkField => {
//           if (pkField in gridRow && cellMeta.prop != pkField) {
//             dataItem[pkField] = gridRow[pkField];
//           }
//         })
//       }

//       changeObj[cellMeta.row] = dataItem;
      
//     }

//   }

// }



// new code

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

      // check if grid.data exists already before calling. Otherwise use existing grid object and call update?
        // update will just be a more specific calculation of parameters
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
// end of new code
