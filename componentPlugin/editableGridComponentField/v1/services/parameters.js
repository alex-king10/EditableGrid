import {
  getUserSecurityInfo, 
  COLUMN_MENU,
  CONTEXT_MENU,
  ASCENDING_ICON_URL,
  DESCENDING_ICON_URL,
} from "../constants.js";

// Functions to handle and process parameter data from component configuration
// TO DO: move this to be a get function and a function level scope
// let columnHeaderData2 = [];

// getPKList - process list of primary key fields from UI
// param primaryKeyFieldsParam - list of field names of primary keys present in displayed data
// returns list of primary key field names
// errors - displays validation message to user if no value is given
export function getPKList(primaryKeyFieldsParam) {
    let primaryKeyFieldList = [];
  
    if (primaryKeyFieldsParam != null) {
      primaryKeyFieldList.push(...primaryKeyFieldsParam);
    } else {
      Appian.Component.setValidations(["Please enter the name of your record's primary key field if you would like to make changes to the record data."]);
    }
  
    return primaryKeyFieldList;
  }

// function queryInfo - flattens the nested objects from first index of inputted data
// param dataItem - rowsParam[0]
// returns flattened list of keys in data
// *Note: depends on exemplary data in first row
export function getQueryInfoFromData(dataItem) {
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

export function getQueryInfoFromColConfig(colConfig) {
  let queryInfo = [];
  for (let i = 0; i < colConfig.length; i++) {
    let currConfig = colConfig[i];
    if ('data' in currConfig && currConfig['data'] != null) {
      queryInfo.push(currConfig['data']);
    }
  }
  return queryInfo;
}


// function setColMetaData
// param queryInfo - flat array of keys in first row of data
// param columnConfigParam - 
// returns columnMetaData and relatedRecords as an object
export function getColMetaData(queryInfo, columnConfigParam) {
    // set column configuration data
    let columnConfigs = [];
    let relatedRecords = {};

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
        }
  
        // if currColumnObject still null --> not in config param
        if (currColConfig == null) {
          currColConfig = { title: currDataField, data: currDataField };
        }
  
        columnConfigs.push(currColConfig);
  
      }
  
    } else if (columnConfigParam != null && columnConfigParam.length != 0) {
      columnConfigs = columnConfigParam;
    }
  
    return { columnConfigs, relatedRecords };
  
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
export function getGridData(rowsParam, changeObj, relatedRecords, columnConfigs)
{

  let currRowIdx;
  let currChangeItem;
  let dataMap = [];

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
    
  } else if (columnConfigs.length != 0) {
    // if no data given, use colConfig as schema and set temp null values in cells
    let tempRow = {};
    columnConfigs?.forEach(colConfig => {
      if ('data' in colConfig) {
        tempRow[colConfig.data] = null;
      }
    });
    dataMap.push(tempRow);
  }

  // if they're both empty, handled in grid creation - no data or column value passed

  return dataMap;
}

// Returns and sets userPermission levels to globalVar userPermissionLevel
// Calls servlet to get permission of passed in group
export async function getUserPermission(securityParam) {
  let userPermissionLevel;
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

export function formatColumnHeader(TH) {
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



// Returns object of gridHeight and hiddenCols (list of column indices to hide)
// param styleParam - object from component config to define style of grid
// param dataLen - length of inputted data. Used to calculate grid height
// param primaryKeyFieldList - used to calc hiddenCols
export function getStyle(queryInfo, styleParam, dataLen, primaryKeyFieldList) {
  // set global var gridHeight
  let gridHeight = getGridHeight(dataLen, styleParam.height);
  
  // Add primary key visual indeces to global hiddenCols var
  let hiddenCols = [];
  if ((styleParam.showPrimaryKeys == false || styleParam.showPrimaryKeys == undefined)  && primaryKeyFieldList.length != 0 ) {
    let pkIndex;
    if (queryInfo != null) {
      primaryKeyFieldList.forEach(pkField => {
        pkIndex = queryInfo.indexOf(pkField);
        if (pkIndex != -1) {
          hiddenCols.push(pkIndex);
        }
      });
    }
  }

  return { gridHeight, hiddenCols };

}


// Returns an object of grid configuration options
// param gridHeight - int calculated from user input
// param hiddenCols - list of primary key field indices to hide
export function getGridOptions(gridHeight, hiddenCols, gridOptionsParam) {
  let options = {
    height: gridHeight,
    stretchH: 'all',
    multiColumnSorting: true,
    customBorders: true,
    copyPaste: {
      columnsLimit: 25,
      rowsLimit: 200,
    },
    dropdownMenu: COLUMN_MENU,
    hiddenColumns: {
      indicators: false,
      columns: hiddenCols,
      copyPasteEnabled: false,
    },
    headerClassName: 'htLeft my-class',
    contextMenu: CONTEXT_MENU,
    allowInsertColumn: false,
    filters: true,
    allowInsertRow: true,
    manualColumnMove: true,
    manualColumnResize: true,
    manualRowMove: false,
    minSpareRows: 1,
    rowHeights: 40,
    className: "htMiddle",
  };

  if (gridOptionsParam != null) {
    options = Object.assign(options, gridOptionsParam);
  }

  return options;

} 

export function getEditablePKList(primaryKeyFieldList, relatedRecords) {
  let relatedRecordFields = Object.values(relatedRecords).flat();
  const editablePKList = primaryKeyFieldList.filter(x => !relatedRecordFields.includes(x));
  return editablePKList;
}