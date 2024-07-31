import { 
  getUserSecurityInfo, 
  doesRecordExistServlet,  
} from "./constants.js";


// GLOBAL VAR
let dataMap = [];
let colIdxMap = [];
let movedColTracker = {};
let changeObj = {};
let userPermissionLevel;
let primaryKeyName = null;
let recordUUID;
let relatedRecords = {};
let columnHeaderData2 = [];
let gridHeight = 800;
let primaryKeyFieldList = [];
let hiddenCols = [];

// CUSTOM CELL TYPES

async function doesRecordExist(recordUuid, id) {
  let result = await doesRecordExistServlet(recordUuid, id);
  if ('doesRecordExist?' in result) {
    return result['doesRecordExist?'];
  }

  return result;
}

// CUSTOM VALIDATOR
const pkValidator = (value, callback) => {

  setTimeout(() => {
    doesRecordExist(recordUUID, value).then( resultObj => {
      if (resultObj) {
        // prevent change
        callback(false);
      }  else {
        callback(true);
      }
    })
  }, 500);
};

// Register an alias
Handsontable.validators.registerValidator('primaryKeyValidator', pkValidator);

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

// INSTANTIATE GRID W/ DATA AND COLUMN
  // depends on relatedRecords created in setColMetaData
function setGridData2(rowsParam, changeObj)
{

  let currRowIdx;
  let currChangeItem;

  if (rowsParam != null && rowsParam.length != 0) {
    dataMap = rowsParam;
    if (Object.keys(changeObj).length == 0 && Object.keys(relatedRecords).length == 0) {
    // no updates to make to data var
      return dataMap;
    } else {
      let currRow;
      let displayFields;

      //update changed indices in dataMap var
      if (Object.keys(changeObj).length != 0) {
        for (let i = 0; i < Object.keys(changeObj).length; i++) {
          currRowIdx = Object.keys(changeObj)[i];
          currChangeItem = Object.values(changeObj)[i];
          // update row in data var with value from changeObj
          dataMap[currRowIdx] = Object.assign(dataMap[currRowIdx], currChangeItem);
        }
      }
          
      // process related records 
      if (Object.keys(relatedRecords).length > 0) {
        // loop over data
        for (let j = 0; j < dataMap.length; j++) {
          currRow = dataMap[j];
          // loop over related record
          Object.keys(relatedRecords).forEach(relField => {
             // { ownerRel: ['name'] }
             if (relField in currRow && currRow[relField] != null) {
              displayFields = relatedRecords[relField];

              // index into object, add specified fields to dataMap as flat key:value pair
              displayFields?.forEach(displayField => {
                if (displayField in currRow[relField]) {
                  currRow[displayField] = currRow[relField][displayField];
                } else {
                  console.log(`Display field: ${displayField} not in object at index ${j}`);
                }
              });

                // remove relField:{object} from data
              if (typeof(currRow[relField]) == 'object') {
                delete currRow[relField];
              }

             }
          });
          
        }
        
      }
      
    }
    
  } else if (columnHeaderData2.length != 0) {
    // if no data given, use colConfig as schema and set temp null values in cells
    let tempRow = {};
    columnHeaderData2?.forEach(colConfig => {
      if ('data' in colConfig) {
        tempRow[colConfig.data] = null;
      }
    });
    dataMap.push(tempRow);
  }

  // if they're both empty, handled in grid creation - no data or column value passed

  return dataMap;
}

// function to flatten the nested objects from first index of inputted data
  // used to structure the column meta data
  // *Note: depends on exemplary data in first row :/ not great
function getQueryInfo(dataItem) {
  let queryInfo = [];
  for (let key in dataItem) {
    if (dataItem.hasOwnProperty(key)) {
      if (typeof dataItem[key] !== 'object' || dataItem[key] == null) {
        queryInfo.push(key);
      } else {
        // adds keys of related data
        queryInfo.push(...Object.keys(dataItem[key]));
      }
    }
  }

  return queryInfo;
}

function setColMetaData2(dataParam, columnConfigParam) {
  // set column configuration data
  columnHeaderData2 = [];
  let queryInfo = null;

  // get field names
  if (dataParam != null && dataParam.length != 0) {
    queryInfo = getQueryInfo(dataParam[0]);
  }

  if (queryInfo != null) {
    for (let i = 0; i < queryInfo.length; i++) {
      let currDataField = queryInfo[i];
      let currColConfig = null;

      // find if currDataField in columnConfigParam
      if (columnConfigParam != null) {
        for (let j = 0; j < columnConfigParam.length; j++) {
          currColConfig = columnConfigParam[j];

          // if currDataField is in config param
          if (currColConfig.data == currDataField) {

            // if no title specified, use field name
            if (currColConfig.title == undefined) {
              currColConfig['title'] = currDataField;
            }

            if ('relationshipName' in currColConfig && currColConfig.relationshipName != null) {
              if (currColConfig.relationshipName in relatedRecords) {
                relatedRecords[currColConfig.relationshipName].push(currColConfig.data);
              } else {
                relatedRecords[currColConfig.relationshipName] = [currColConfig.data];
              }
            }

            break;
          }

        }
      } else { 
        // remove this later
        console.log("Column Config Param is null"); 
      }

      // if currColumnObject still null --> not in config param
      if (currColConfig == null) {
        currColConfig = { title: currDataField, data: currDataField };
      }

      columnHeaderData2.push(currColConfig);

    }

  } else if (columnConfigParam != null && columnConfigParam.length != 0) {
    columnHeaderData2 = columnConfigParam;
    console.log("Query info null");
  }

  return columnHeaderData2;

}

// Creates an ordered list of column headers to track their order
// Used in onChange logic
function setColumnIndexMap() {
  colIdxMap = [];
  // shouldnt ever be true bc of edge case handling
  if (dataMap.length != 0) {
    colIdxMap = Object.keys(dataMap[0]);
  }

  return colIdxMap;
}

// Updates ordered list of columns for onChange logic
// Called in 'afterColumnMove' hook
// Return - void
function updateColumnIndexMap(movedColumns, dropIndex) {
  let newArr = [];
  let movedColArr = colIdxMap.slice(movedColumns[0],  movedColumns[movedColumns.length - 1] + 1);

  for (let i = 0; i < colIdxMap.length; i++) {
    
     if (i == dropIndex) {
      // copy over moved columns
      newArr.push(...movedColArr);
    }
    if (!(movedColumns.includes(i))) {
      // copy unchanged columns
      newArr.push(colIdxMap[i]);
    }
  }

  colIdxMap = newArr;

}

// Returns grid height from component parameters
// Accepts "AUTO" or an integer value
// AUTO calculates a value based on num rows with a min of 325 and max of 800.
function getGridHeight(dataLen, heightParam) {

  // default
  let height = 800;

  // Grid Height Edge Cases
    // Grid is empty
  if (dataLen == null || dataLen == 0) {
    return 325;
  }

  // let heightValue = styleParam.height;
  if (heightParam == "AUTO" || heightParam == undefined)
    {
      let calcHeight = 46 + (dataLen * 41);

      // max calculated height of 1200 px. Defaults to 800.
      // min calculated height of 325 px
      if (calcHeight < 801) {
        if (calcHeight > 325) {
          height = calcHeight;
        } else {
          height = 325;
        }
      }
  }
  else
  {
    let intHeight = parseInt(heightParam);
    if (!isNaN(intHeight))
      {
        height = intHeight;
      }
  }
  
  return height;
}

// depends on colIdxMap - 
function setStyle(styleParam, dataLen) {
  // set global var gridHeight
  gridHeight = getGridHeight(dataLen, styleParam.height);
  
  // Add primary key visual indeces to global hiddenCols var
  if (styleParam.showPrimaryKeys == false && primaryKeyFieldList.length != 0 ) {
    let pkIndex;
    primaryKeyFieldList.forEach(pkField => {
      pkIndex = colIdxMap.indexOf(pkField);
      if (pkIndex != -1) {
        hiddenCols.push(pkIndex);
      }
    });
  }

}

// Returns and sets userPermission levels to globalVar userPermissionLevel
// Calls servlet to get permission of passed in group
async function getUserPermission(securityParam) {
  let groups = {};
  if (securityParam != null) {
    if ('editor' in securityParam) { groups['editor'] = securityParam.editor.id; }
    if ('viewer' in securityParam) { groups['viewer'] = securityParam.viewer.id; }
  }

  let permissionObj = await getUserSecurityInfo(groups);

  if (!('editor' in permissionObj) && !('viewer' in permissionObj) ) {
    // default if none specified - all users can edit
    userPermissionLevel = "editor";
    return userPermissionLevel;
  }
  
  if ('editor' in permissionObj && permissionObj.editor == true) { userPermissionLevel = "editor"; }
  else if ('viewer' in permissionObj ) {
    if (permissionObj.viewer == true) { userPermissionLevel = "viewer"; }
    else { userPermissionLevel = "editor"; }
  } else {
    userPermissionLevel = "viewer";
  }


  return userPermissionLevel;
}

// HANDLE CHANGES IN DATA
function onChange(cellMeta, newValue, source)
{

  if (cellMeta != null)
  {
    let dataItem = {};
    let gridRow;

    if (cellMeta.row in changeObj) {
      changeObj[cellMeta.row][cellMeta.prop] = newValue;
    } else {
    // add PK if exists
      // access data at modified row
      gridRow = dataMap[cellMeta.row];

      // add new change { name : 'test' }
      dataItem[cellMeta.prop] = newValue;

      // add primary keys (parent and related) to changeObj at this record
        // only 0 if pkName not given in recordTypeInfo - shows a validation message
      if (primaryKeyFieldList.length != 0) {
        primaryKeyFieldList.forEach(pkField => {
          if (pkField in gridRow && cellMeta.prop != pkField) {
            dataItem[pkField] = gridRow[pkField];
          }
        })
      }

      changeObj[cellMeta.row] = dataItem;
      
    }

  }

}


let hotGrid;
try {

// init grid
  const container = document.getElementById("myGrid");
  hotGrid = new Handsontable(container, {
    licenseKey: "non-commercial-and-evaluation",
  });
} catch (error) {
  console.error(`An error occurred ${error}`);
}

Appian.Component.onNewValue(newValues => {

  // retrieve component parameters
  let dataParam = newValues.rows;
  let configParam = newValues.columnConfigs;
  let gridOptionsParam = newValues.gridOptions;
  let styleParam = newValues.style;
  let changeDataParam = newValues.changeData;
  let securityParam = newValues.securityGroups;
  let recordTypeInfoParam = newValues.recordTypeInfo;

  console.log("newValues");
  console.log(newValues);

  try {

    if (hotGrid == null || hotGrid == undefined) {
      console.error(`Hot grid null or undefined: ${hotGrid}`);
    }

    let contextMenu = [
      "row_above",
      "row_below",
      "---------",
      "undo",
      "redo",
      "cut",
      "copy",
      "---------",
      "borders",
      "---------",
      "hidden_columns_hide",
      "hidden_columns_show",

    ];

    let columnMenu = [
      "filter_by_condition",
      "filter_by_condition2",
      "filter_operators",
      "filter_by_value",
      "filter_action_bar"
    ];

    // find global var - record type UUID and primaryKey
    if (recordTypeInfoParam != null) {
      if ('recordTypeUUID' in recordTypeInfoParam) {
        recordUUID = recordTypeInfoParam.recordTypeUUID;
      }

      if ('primaryKeyField' in recordTypeInfoParam) {
        primaryKeyName = recordTypeInfoParam.primaryKeyField;
        primaryKeyFieldList.push(primaryKeyName);
      } else {
        // Show error to user that primaryKey is required
        Appian.Component.setValidations(["Please enter a valid primaryKeyField value in the recordTypeInfo component parameter."]);
      }

      if ('relatedPKFields' in recordTypeInfoParam) {
        primaryKeyFieldList.push(...recordTypeInfoParam.relatedPKFields);
      }
    }

    // calculate column configurations
    setColMetaData2(dataParam, configParam);

    // set Grid Data
    // initial load or updating dataParam
    if (dataMap.length == 0) {
      
      setGridData2(dataParam, changeObj);
      
      // only called on initial load
      if (Object.keys(changeObj).length == 0) {
        setColumnIndexMap();
      }

    } else {
      setGridData2(dataMap, changeObj);
    }

    // Empty changeObj - Either initial load of comp. or after "Save Change"
    if (changeDataParam != null && changeDataParam.length == 0) {
      changeObj = {};
    }

    // get permission level for current user
    getUserPermission(securityParam).catch(error => {
      console.error("Error fetching user security info:", error);
    });

    // set style of grid - includes height and showPK?
    setStyle(styleParam, dataParam.length);

    // if both dataMap and columnData are not null/empty
    if (!(dataMap.length == 0 && columnHeaderData2.length == 0)) {
      hotGrid.updateSettings({
        data: dataMap,
        columns: columnHeaderData2,
      })

      // Clear validation message
      Appian.Component.setValidations([]);

    } else {
      Appian.Component.setValidations(["No data to display. Please enter values for row or columnConfig parameters."]);
    }
  
    // update grid settings
    hotGrid.updateSettings({
      // data: dataMap,
      // columns: columnHeaderData2,
      height: gridHeight,
      // height: setGridHeight(dataParam, styleParam),
      stretchH: 'all',
      multiColumnSorting: true,
      customBorders: true,
      copyPaste: {
        columnsLimit: 25,
        rowsLimit: 200,
      },
      dropdownMenu: columnMenu,
      hiddenColumns: {
        indicators: false,
        columns: hiddenCols,
        copyPasteEnabled: false,
      },
      contextMenu: contextMenu,
      allowInsertColumn: false,
      filters: true,
      allowInsertRow: true,
      manualColumnMove: true,
      manualColumnResize: true,
      manualRowMove: false,
      minSpareRows: 1,
      rowHeights: 40,
      // comments: true,
      className: "htMiddle",
    });

    if (gridOptionsParam != null)
    {   
      hotGrid.updateSettings(gridOptionsParam);
    } else {
      console.log("gridOptions param is null");
    }

    // Handles and reverts invalid changes made to the grid
      // If user permission is viewer and not edit
      // If a PK is changed to a non-unique value (makes a servlet request)
    hotGrid.addHook('beforeChange', (changes, source) => {
      changes?.forEach(change => {
        const [row, prop, oldValue, newValue] = change;
        
        if (userPermissionLevel == "viewer") {
          change[3] = oldValue;
        } 
        // checking if PK is unique
        // else if (newValue != oldValue && userPermissionLevel == "editor") {
        //   if (prop == primaryKeyName) {
        //     doesRecordExist(recordUUID, newValue).then( resultObj => {
        //       if (resultObj) {
        //         change[3] = oldValue;
        //       }
        //     });
        //   } 
        // } 
      })
    });

    // Handles saving changes made to the grid by calling onChange and updating changeObj
      // Sends changeObj to Appian local var in changeData param
    hotGrid.addHook('afterChange', (changes, [source]) => {
      // call handle change function
      changes?.forEach(change => {
        const [row, prop, oldValue, newValue] = change;

        if (newValue != oldValue && userPermissionLevel == "editor")
        {
          let colIdx = colIdxMap.indexOf(prop);
          // let colIdx = colIdxMap[prop];
          let cellMeta;
          if (colIdx != -1) {
            cellMeta = hotGrid.getCellMeta(row, colIdx);
            onChange(cellMeta, newValue, [source]);
            Appian.Component.saveValue("changeData", Object.values(changeObj));
          } else {
            console.error("Prop not found in column index map");
          }
        } 
  
      });
  
    });

    hotGrid.addHook(
      "afterColumnMove",
      (movedColumns, finalIndex, dropIndex, movePossible, orderChanged) => {

        // uses movedColTracker to see if the hook has been triggered multiple times for the same move (a bug in HoT)
        if (Object.keys(movedColTracker).length == 0 || !(arraysEqual(movedColTracker.movedColumns, movedColumns) && movedColTracker.dropIndex == dropIndex && movedColTracker.currProp == colIdxMap[finalIndex]) ) {
          if (orderChanged) {
            let currProp = colIdxMap[movedColumns[0]];

            updateColumnIndexMap(movedColumns, dropIndex); 
            movedColTracker['movedColumns'] = [...movedColumns];
            movedColTracker['dropIndex'] = dropIndex;
            movedColTracker['currProp'] = currProp;
            console.log("colIdxMap changed");
            console.log(colIdxMap);
            console.log(movedColTracker);
          }
        }
       
      }
    );


  } catch (error) {
    console.error("An error occured creating the grid:", error);
  }


});