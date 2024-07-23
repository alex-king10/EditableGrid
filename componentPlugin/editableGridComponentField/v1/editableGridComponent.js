import { 
  getUserSecurityInfo, 
  doesRecordExistServlet, 
  getRecordFieldUUID 
} from "./constants.js";


// GLOBAL VAR
let dataMap = [];
let gridMode = "auto";
let colIdxMap = {};
let changeObj = {};
let userPermissionLevel;
let primaryKeyName;
let recordUUID;
let relatedRecords = {};
let columnHeaderData2 = [];

// CUSTOM CELL TYPES
Handsontable.cellTypes.registerCellType('relatedRecord', {
  type: "text",
  className: 'cellStyle-appianObject',
  readOnly: true,
  displayFields: ["fieldName"]
});

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

// INSTANTIATE GRID W/ DATA AND COLUMN
function setGridData2(rowsParam, changeObj)
{

  let currRowIdx;
  let currChangeItem;

  if (rowsParam != null) {
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
              displayFields?.forEach(displayField => {
                if (displayField in currRow[relField]) {
                  currRow[displayField] = currRow[relField][displayField];
                } else {
                  console.log(`Display field: ${displayField} not in object at index ${j}`);
                }
              });

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

  return dataMap;
}

function setColMetaData2(dataParam, columnConfigParam) {
  columnHeaderData2 = [];
  let queryInfo = null;
  let displayFields;

  // get field names
  if (dataParam != null && dataParam.length != 0) {
    queryInfo = Object.keys(dataParam[0]);
  }

  if (queryInfo != null) {
    for (let i = 0; i < queryInfo.length; i++) {
      // add colName: col Index to map
      colIdxMap[queryInfo[i]] = i;
      let currDataField = queryInfo[i];
      let currColConfig = null;
      let currColConfigList = [];

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

            // if related record type, add to global var relatedRecords w/ displayFields
            if ('type' in currColConfig && currColConfig.type == "relatedRecord") {
              if ('displayFields' in currColConfig) {
                displayFields = currColConfig.displayFields;
                relatedRecords[currDataField] = displayFields;
                // add new col object for each displayField - using fieldValues, fieldTitles (future) 
                // currColConfigList.push(currColConfig);
                let displayFieldObj;
                displayFields.forEach(displayField => {
                  displayFieldObj = {};
                  displayFieldObj["data"] = displayField;
                  displayFieldObj["editor"] = false;
                  displayFieldObj["title"] = displayField;
                  currColConfigList.push(displayFieldObj);
                });
              }
            } else {
              // add single item to list [{data: "colName"}]
              currColConfigList.push(currColConfig);
            }

            

            // add modified currColConfig to object
            // currColumnObject = currColConfig;

            break;
          }

        }
      } else { console.error("Column Config Param is null"); }

      // if currColumnObject still null --> not in config param
      if (currColConfig == null) {
        currColConfig = { title: currDataField, data: currDataField };
        currColConfigList.push(currColConfig);
      }

      columnHeaderData2.push(...currColConfigList);

    }

  } else {
    columnHeaderData2 = columnConfigParam;
    console.log("Query info null");
  }

  return columnHeaderData2;

}

function setGridHeight(dataParam, styleParam) {

  // default of 800
  let height = 800;

  if (styleParam != null && dataParam != null)
    {
      if ('height' in styleParam) {
          let heightValue = styleParam.height;
          if (heightValue == "AUTO")
            {
              let calcHeight = 46 + (dataParam.length * 41);

              // max calculated height of 1200 px. Defaults to 800.
              // min calculated height of 325 px
              if (calcHeight < 1201) {
                if (calcHeight > 325) {
                  height = calcHeight;
                } else {
                  height = 325;
                }
              }
          }
          else
          {
            let intHeight = parseInt(heightValue);
            if (!isNaN(intHeight))
              {
                height = intHeight;
              }
          }
      }
      else
      {
        // empty grid
        if (dataParam.length == 0) {
          height = 200;
        }
      }
  }

  return height;
}

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
    // let dataItem = dataMap[cellMeta.row];
    // console.log(dataItem);
    // changeObj[cellMeta.row] = dataItem;

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

      // primaryKeyName is a global var of the string value of the PK field
      if (primaryKeyName in gridRow && primaryKeyName != cellMeta.prop) {
        // pkItem[primaryKeyName] = gridRow.primaryKeyName;
        // add pk { locationAccount: 2 }
        dataItem[primaryKeyName] = gridRow[primaryKeyName];
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
      }
    }

    // calculate column configurations
    setColMetaData2(dataParam, configParam);

    // set Grid Data
    // initial load or updating dataParam
    if (dataMap.length == 0) {
      setGridData2(dataParam, changeObj);
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

    // if both dataMap and columnData are not null/empty
    if (!(dataMap.length == 0 && columnHeaderData2.length == 0)) {
      hotGrid.updateSettings({
        data: dataMap,
        columns: columnHeaderData2,
      })
    }
  
    // update grid settings
    hotGrid.updateSettings({
      // data: dataMap,
      // columns: columnHeaderData2,
      height: setGridHeight(dataParam, styleParam),
      stretchH: 'all',
      multiColumnSorting: true,
      mergeCells: true,
      customBorders: true,
      copyPaste: {
        columnsLimit: 25,
        rowsLimit: 200,
      },
      dropdownMenu: columnMenu,
      hiddenColumns: {
        indicators: true
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
          let colIdx = colIdxMap[prop];
          let cellMeta;
          if (colIdx != undefined) {
            cellMeta = hotGrid.getCellMeta(row, colIdx);
            onChange(cellMeta, newValue, [source]);
            Appian.Component.saveValue("changeData", Object.values(changeObj));
          }
        } 
  
      });
  
    });


  } catch (error) {
    console.error("An error occured creating the grid:", error);
  }


});