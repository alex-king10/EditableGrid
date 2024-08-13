import { 

  ASCENDING_ICON_URL,
  DESCENDING_ICON_URL,
  CONTAINER_ID
} from "./constants.js";

import {
  getPKList, 
  getQueryInfo, 
  getColMetaData,
  getGridData,
  getGridOptions,
  getStyle,
  getUserPermission
} from "./services/parameters.js"

import GridComponent from "./components/GridComponent.js";


function getEditablePKList(primaryKeyFieldList, relatedRecords) {
  let relatedRecordFields = Object.values(relatedRecords).flat();
  const editablePKList = primaryKeyFieldList.filter(x => !relatedRecordFields.includes(x));
  return editablePKList;
}


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

// function formatColumnHeader(TH) {
//   let sort = TH.getAttribute("aria-sort");
//   let img = TH.querySelector('.relative .newSortIcon');
//   const divContainer = TH.querySelector('.relative');

//   if (img) {
//     img.remove();
//   }

//   if (sort != "none") {
//     img = document.createElement('img');
//     img.src = sort == "ascending" ? ASCENDING_ICON_URL: (sort == "descending"? DESCENDING_ICON_URL: ""); // Path to your SVG file
//     img.className = 'newSortIcon';
//     img.style.width = '16px';
//     img.style.height = '15px';

//     const span = document.createElement('span');
//     span.className = 'newSortIcon';
//     span.appendChild(img);

//     if (divContainer) {
//       divContainer.appendChild(span);
//     } else {
//       console.error("Div Container null");
//     }
//   } 
// }


// new code

function prepareGridParams(newValues) {
    // component parameters
    let dataParam = newValues.rows;
    let configParam = newValues.columnConfigs;
    let gridOptionsParam = newValues.gridOptions;
    let styleParam = newValues.style;
    let changeDataParam = newValues.changeData;
    let securityParam = newValues.securityGroups;
    let primaryKeyFieldsParam = newValues.primaryKeyFields;

    // temporary - implementing initial load only now. will add logic to check if later load
    let changeObj = {};
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

    // set Grid Data
    // initial load or updating dataParam --> change this to be gridObject.initData(dataParam, relatedObject);
      // move all init and update data logic to grid class?
    data = getGridData(dataParam, changeObj, relatedRecords, columnConfigs);

    // Empty changeObj - Either initial load of comp. or after "Save Change"
    if (changeDataParam != null && changeDataParam.length == 0) {
      changeObj = {};
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
    let userPermissionLevel;

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


function main() {

  let grid;
  let data, columnConfigs, gridOptions, changeObj, userPermissionLevel, editablePKFieldList;

  try {
    
    Appian.Component.onNewValue(newValues => {

      console.log(newValues);
      // check if grid.data exists already before calling. Otherwise use existing grid object and call update?
        // update will just be a more specific calculation of parameters
      ({ data, columnConfigs, gridOptions, changeObj, userPermissionLevel, editablePKFieldList } = prepareGridParams(newValues));
  
      grid = new GridComponent(CONTAINER_ID, data, columnConfigs, gridOptions, changeObj, userPermissionLevel, editablePKFieldList);
      grid.initGrid();
      grid.addListeners();
  
    });

    // if (grid != undefined)  {
      
    //   grid.addListeners();
    // }
    
  
  } catch (error) {
    console.error(error);
  }
}

main();
// end of new code
