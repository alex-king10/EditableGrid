import { 
  getUserSecurityInfo, 
  getGridOptions,
  ASCENDING_ICON_URL,
  DESCENDING_ICON_URL
} from "./constants.js";

// GLOBAL VAR
let dataMap = [];
let changeObj = {};
let userPermissionLevel;
let relatedRecords = {};
let columnHeaderData2 = [];

// process record type info
function getPKList(primaryKeyFieldsParam) {
  let primaryKeyFieldList = [];

  if (primaryKeyFieldsParam != null) {
    primaryKeyFieldList.push(...primaryKeyFieldsParam);
  } else {
    Appian.Component.setValidations(["Please enter the name of your record's primary key field if you would like to make changes to the record data."]);
  }

  return primaryKeyFieldList;
}

function getEditablePKList(primaryKeyFieldList, relatedRecords) {
  let relatedRecordFields = Object.values(relatedRecords).flat();
  const editablePKList = primaryKeyFieldList.filter(x => !relatedRecordFields.includes(x));
  return editablePKList;
}

// Returns a flattened row of data from a related record field
// param currRow - reference to current row in grid data to be manipulated
// param displayFields - list of related record fields to display
// param recordField - name of 1_N record field
function get1_NRecordData(recordField, displayFields, currRow) {
  let dataList = currRow[recordField];

  for (let i = 0; i < dataList.length; i++) {
    let dataObj = dataList[i];
    displayFields?.forEach(displayField => {
      if (currRow[displayField] == undefined) {
        currRow[displayField] = [ dataObj[displayField]];
      } else {
        currRow[displayField].push(dataObj[displayField]);
      }
    })
  }

  return currRow;
}

// INSTANTIATE GRID W/ DATA AND COLUMN
  // depends on relatedRecords created in setColMetaData
function setGridData(rowsParam, changeObj)
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

              // check if relationship is 1:N
              if (Array.isArray(currRow[relField])) {
                currRow = get1_NRecordData(relField, displayFields, currRow);

              } else {
                // index into object, add specified fields to dataMap as flat key:value pair
                displayFields?.forEach(displayField => {
                  if (displayField in currRow[relField]) {
                    currRow[displayField] = currRow[relField][displayField];
                  } else {
                    console.log(`Display field: ${displayField} not in object at index ${j}`);
                  }
                });
              }

              // remove relField:{object} from data
              if (typeof(currRow[relField]) == 'object' || Array.isArray(currRow[relField])) {
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

// updates dataMap with changeObj
function updateGridData(rowsParam, changeObj)
{

  let currRowIdx;
  let currChangeItem;

  if (rowsParam != null && rowsParam.length != 0) {
    dataMap = rowsParam;
    if (Object.keys(changeObj).length == 0) {
    // no updates to make to data var
      return dataMap;
    } else {
      //update changed indices in dataMap var
      if (Object.keys(changeObj).length != 0) {
        for (let i = 0; i < Object.keys(changeObj).length; i++) {
          currRowIdx = Object.keys(changeObj)[i];
          currChangeItem = Object.values(changeObj)[i];
          // update row in data var with value from changeObj
          dataMap[currRowIdx] = Object.assign(dataMap[currRowIdx], currChangeItem);
        }
      }
      
    }
    
  } 
  // else if (columnHeaderData2.length != 0) {
  //   // if no data given, use colConfig as schema and set temp null values in cells
  //   let tempRow = {};
  //   columnHeaderData2?.forEach(colConfig => {
  //     if ('data' in colConfig) {
  //       tempRow[colConfig.data] = null;
  //     }
  //   });
  //   dataMap.push(tempRow);
  // }

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
      if (!(typeof dataItem[key] == 'object' || Array.isArray(dataItem[key])) || dataItem[key] == null) {
        queryInfo.push(key);
      } else {
        if (Array.isArray(dataItem[key]) && dataItem[key].length > 0) {
          if (typeof dataItem[key][0] == 'object') {
            queryInfo.push(...Object.keys(dataItem[key][0]));
          }
        } else {
          // adds keys of related data
          queryInfo.push(...Object.keys(dataItem[key]));
        }
      }
    }
  }

  return queryInfo;
}

function setColMetaData(queryInfo, columnConfigParam) {
  // set column configuration data
  columnHeaderData2 = [];
  // let queryInfo = null;

  // get field names
  // if (dataParam != null && dataParam.length != 0) {
  //   queryInfo = getQueryInfo(dataParam[0]);
  // }

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

              // currColConfig['readOnly'] = true;
              currColConfig['editor'] = false;
              currColConfig['headerClassName'] = 'my-class header-readOnly';
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

// Returns grid height from component parameters
// Accepts "AUTO", an integer value, or undefined (if not set)
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

// Returns object of gridHeight and hiddenCols (list of column indices to hide)
  // param styleParam - object from component config to define style of grid
  // param dataLen - length of inputted data. Used to calculate grid height
  // param primaryKeyFieldList - used to calc hiddenCols
function getStyle(queryInfo, styleParam, dataLen, primaryKeyFieldList) {
  // set global var gridHeight
  let gridHeight = getGridHeight(dataLen, styleParam.height);
  
  // Add primary key visual indeces to global hiddenCols var
  let hiddenCols = [];
  if ((styleParam.showPrimaryKeys == false || styleParam.showPrimaryKeys == undefined)  && primaryKeyFieldList.length != 0 ) {
    let pkIndex;
    primaryKeyFieldList.forEach(pkField => {
      pkIndex = queryInfo.indexOf(pkField);
      if (pkIndex != -1) {
        hiddenCols.push(pkIndex);
      }
    });
  }

  return { gridHeight, hiddenCols };

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
function onChange(primaryKeyFieldList, cellMeta, newValue)
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

function formatColumnHeader(TH) {
  let sort = TH.getAttribute("aria-sort");
  let img = TH.querySelector('.relative .newSortIcon');
  const divContainer = TH.querySelector('.relative');

  if (img) {
    img.remove();
  }

  if (sort != "none") {
    img = document.createElement('img');
    img.src = sort == "ascending" ? ASCENDING_ICON_URL: (sort == "descending"? DESCENDING_ICON_URL: ""); // Path to your SVG file
    img.className = 'newSortIcon';
    img.style.width = '16px';
    img.style.height = '15px';

    const span = document.createElement('span');
    span.className = 'newSortIcon';
    span.appendChild(img);

    if (divContainer) {
      divContainer.appendChild(span);
    } else {
      console.error("Div Container null");
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
  let primaryKeyFieldsParam = newValues.primaryKeyFields;

  console.log("newValues");
  console.log(newValues);

  try {

    if (hotGrid == null || hotGrid == undefined) {
      console.error(`Hot grid null or undefined: ${hotGrid}`);
    }

    let primaryKeyFieldList = getPKList(primaryKeyFieldsParam);

    let queryInfo;
    if (dataParam != null && dataParam.length != 0) {
       queryInfo = getQueryInfo(dataParam[0]);
    }
    
    // calculate column configurations
    setColMetaData(queryInfo, configParam);

    let editablePKFieldList = getEditablePKList(primaryKeyFieldList, relatedRecords);

    // set Grid Data
    // initial load or updating dataParam
    if (dataMap.length == 0) {
      
      setGridData(dataParam, changeObj);

    } 
    else {
      updateGridData(dataMap, changeObj);
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

      // Clear validation message
      Appian.Component.setValidations([]);

    } else {
      Appian.Component.setValidations(["No data to display. Please enter values for row or columnConfig parameters."]);
    }

    // set style of grid - includes height and showPK boolean
    let gridHeight, hiddenCols;
    if (dataParam != null) {
      ({ gridHeight, hiddenCols } = getStyle(queryInfo, styleParam, dataParam.length, primaryKeyFieldList));
    } else {
      ({ gridHeight, hiddenCols } = getStyle(queryInfo, styleParam, 0, primaryKeyFieldList));
    }

    let gridOptions = getGridOptions(gridHeight, hiddenCols);
    hotGrid.updateSettings(gridOptions);

    if (gridOptionsParam != null)
    {   
      hotGrid.updateSettings(gridOptionsParam);
    } else {
      console.log("gridOptions param is null");
    }

    // handle column header formatting on sort
    hotGrid.updateSettings({
      afterGetColHeader: function(column, TH) {
        if (column > -1) { formatColumnHeader(TH); } 
      }
    });

    // Handles and reverts invalid changes made to the grid
      // If user permission is viewer and not edit
      // If a PK is changed to a non-unique value (makes a servlet request)
    hotGrid.addHook('beforeChange', (changes, source) => {
      changes?.forEach(change => {
        const [row, prop, oldValue, newValue] = change;
        
        if (userPermissionLevel == "viewer") {
          change[3] = oldValue;
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
          let colIdx = hotGrid.propToCol(prop);
          let cellMeta;
          if (colIdx != -1) {
            cellMeta = hotGrid.getCellMeta(row, colIdx);
            onChange(editablePKFieldList, cellMeta, newValue);
            Appian.Component.saveValue("changeData", Object.values(changeObj));
          } else {
            console.error("Prop not found in column index map");
          }
        } 
  
      });
  
    });

  }

   catch (error) {
    console.error("An error occured creating the grid:", error);
  }


});
