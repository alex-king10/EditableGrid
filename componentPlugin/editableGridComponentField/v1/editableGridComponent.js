import { getUserSecurityInfo, doesRecordExistServlet, getRecordFieldUUID } from "./constants.js";
import { 
  userRenderer, 
} from "./customRenderers.js";


// GLOBAL VAR
let dataMap = [];
let gridMode = "auto";
let colIdxMap = {};
let changeObj = {};
let userPermissionLevel;
let primaryKeyName;
let recordUUID;


// REGISTER CUSTOM RENDERERS

Handsontable.renderers.registerRenderer('apn.userRenderer', userRenderer);

// CUSTOM CELL TYPES

// Register Group/User Shared Cell Type - appianObject
  // editor - can't cast from dictionary to user error when saving in Appian interface
Handsontable.cellTypes.registerCellType('appianObject', {
  renderer: 'apn.userRenderer',
  editor: false,
  // editor: CustomObjectEditor,
  className: 'cellStyle-appianObject',
  readOnly: true,
  // myCustomProperty: 'foo'
});

async function doesRecordExist(recordUuid, id) {
  let result = await doesRecordExistServlet(recordUuid, id);
  if ('doesRecordExist?' in result) {
    return result['doesRecordExist?'];
  }

  return result;
}

async function getPKField(recordUuid, pkFieldName) {
  let result = await getRecordFieldUUID(recordUuid, pkFieldName);

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

  dataMap = [];
  let currRow = [];
  let currMapRow = [];
  let currRowIdx;

  if (rowsParam != null) {
    dataMap = rowsParam;
    if (Object.keys(changeObj).length == 0) {
      // no updates to make to data var
      return dataMap;
    } else {
      //update changed indices in data var
      for (let i = 0; i < Object.keys(changeObj).length; i++) {
        // if (Object.keys(changeObj).length != 0) {
          // maube check if Object.values(changeObj)[currRowIdx] is valid
          currRowIdx = Object.keys(changeObj)[i];
          // update row in data var with value from changeObj
          dataMap[currRowIdx] = Object.values(changeObj)[i];
        // }
      }
    }
    
  }
  // console.log(dataMap);
  return dataMap;
}

// INSTANTIATE GRID W/ DATA AND COLUMN
function setGridData(rowsParam)
{

  dataMap = [];
  let currRow = [];
  let currMapRow = [];

  if (rowsParam != null)
  {
    for (let i = 0; i < rowsParam.length; i++)
    {
      if ((Object.keys(changeObj).length != 0 && changeObj[i] != undefined)) {
        currRow = Object.values(changeObj[i]);
        currMapRow = changeObj[i];
      } else {
        currRow =  Object.values(rowsParam[i]);
        currMapRow = rowsParam[i];
      }

      dataMap.push(currMapRow);
    }

  }
  
  // console.log(dataMap);
  return dataMap;
}

function setColMetaData2(dataParam, columnConfigParam) {
  let columnHeaderData2 = [];
  let queryInfo = null;

  // get field names
  if (dataParam != null) {
    queryInfo = Object.keys(dataParam[0]);
  }

  if (queryInfo != null) {
    for (let i = 0; i < queryInfo.length; i++) {
      // add colName: col Index to map
      colIdxMap[queryInfo[i]] = i;
      let currDataField = queryInfo[i];
      let currColumnObject = null;

      // find if currDataField in columnConfigParam
      if (columnConfigParam != null) {
        for (let j = 0; j < columnConfigParam.length; j++) {
          let currColConfig = columnConfigParam[j];
          // currColumnObject = currColConfig;

          // if currDataField is in config param
          if (currColConfig.data == currDataField) {
            // if no title specified, use field name
            if (currColConfig.title == undefined && gridMode != "worksheet") {
              currColConfig['title'] = currDataField;
            }

            // add modified currColConfig to object
            currColumnObject = currColConfig;

            break;
          }

        }
      } else { console.error("Column Config Param is null"); }

      // if currColumnObject still null --> not in config param
      if (currColumnObject == null) {
        if (gridMode == "worksheet") {
          currColumnObject = { data: currDataField };
        } else {
          currColumnObject = { title: currDataField, data: currDataField };
        }
      }

      columnHeaderData2.push(currColumnObject);

    }

  } else {
    console.error("Query info null");
  }

  return columnHeaderData2;

}

function setGridHeight(dataParam, styleParam) {

  let height = 800;

  if (styleParam != null)
    {
      if ('height' in styleParam) 
        {
          let heightValue = styleParam.height;
          if (heightValue == "AUTO")
            {
              let calcHeight = 46 + (dataParam.length * 41);

              if (dataParam.length == 0) {
                calcHeight = 200;
              }

              // max of 1200 px
              if (calcHeight < 1201) {
                height = calcHeight;
              } else {
                console.log(`Number of records is too high to display auto height of ${calcHeight}. Setting height to ${height}.`);
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
          if (dataParam.length == 0) {
            height = 200;
          }
          console.log("Height not in style");
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

  console.log(groups);

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
    
    let dataItem = dataMap[cellMeta.row];

    console.log(dataItem);
    changeObj[cellMeta.row] = dataItem;

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

    // set Grid Data
    // reset changeObj if component wrote back an empty object
    setGridData2(dataParam, changeObj);
    // Either initial load of comp. or after "Save Change"
    if (changeDataParam != null && changeDataParam.length == 0) {
      changeObj = {};
    } 

    // get permission level for current user
    getUserPermission(securityParam).then( permissionObj => {
      console.log("Permission Object:", permissionObj);
    })
    .catch(error => {
      console.error("Error fetching user security info:", error);
    });
  
    // update grid settings
    hotGrid.updateSettings({
      data: dataMap,
      columns: setColMetaData2(dataParam, configParam),
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
        else if (newValue != oldValue && userPermissionLevel == "editor") {
          let colIdx = colIdxMap[prop];
          if (colIdx != undefined) {
            if (prop == primaryKeyName) {
              doesRecordExist(recordUUID, newValue).then( resultObj => {
                if (resultObj) {
                  change[3] = oldValue;
                }
              });
            } 
          }
        } 
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