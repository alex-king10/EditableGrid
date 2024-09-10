import {
  getUserSecurityInfo, 
  COLUMN_MENU,
  CONTEXT_MENU_VIEWER,
  ASCENDING_ICON_URL,
  DESCENDING_ICON_URL,
} from "../constants.js";

import {
  handleValidationMessages_Validator,
  handleValidationMessages_ColConfig
} from "../utils/utils.js";

// Functions to handle and process parameter data from component configuration

// getPKField - returns the indexed array of the PK Field
export function getPKField(primaryKeyFieldParam) {
  if (Array.isArray(primaryKeyFieldParam)) { return primaryKeyFieldParam[0]; }
  return primaryKeyFieldParam;
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



export function getParsedColumnConfigs(colConfigStrArr) {
  let colConfig = [];
  let validationMessages = [];

  if (colConfigStrArr != null) {
    let colConfigJSON;
    colConfigStrArr.forEach(colConfigStr => {
      // cast colConfig from str to JSON
      colConfigJSON = JSON.parse(colConfigStr);

      // handle nested JSON validator
      if ('validator' in colConfigJSON) {
        let customValidator = JSON.parse(colConfigJSON['validator']);
        // handle invalid validator input
        if ('validationMessage' in customValidator) { 
          let formattedValMessages = handleValidationMessages_Validator(colConfigJSON, customValidator);
          validationMessages.push(...formattedValMessages); 
          delete colConfigJSON['validator'];
        }
        else { colConfigJSON['validator'] = customValidator; }
      }

      // handle invalid colConfig param
      if ('validationMessage' in colConfigJSON) {
        let formattedValMessages = handleValidationMessages_ColConfig(colConfigJSON);
        validationMessages.push(...formattedValMessages);
      }

      colConfig.push(colConfigJSON);

    });
  }
  return {colConfigs: colConfig, colValidationMessages: validationMessages};
}


// function setColMetaData
// param queryInfo - flat array of keys in first row of data
// param columnConfigParam -
// returns columnMetaData and relatedRecords as an object
export function getColMetaData(queryInfo, columnConfigParam) {
    // set column configuration data
    let columnConfigs = [];
    let relatedRecords = {};
    let columnsToValidate = [];
    let colIdx = 0;

    if (queryInfo !== null) {
      if (columnConfigParam !== null) {
        columnConfigParam.forEach((currColConfig) => {
          if ('data' in currColConfig && queryInfo.includes(currColConfig['data'])) {
            // if no title specified, use field name
            if (currColConfig.title === undefined) {
              currColConfig['title'] = currColConfig['data'];
            }
            columnConfigs.push(currColConfig);
  
            // create list of columns to validate with custom validators
            if (currColConfig.validator) {
              columnsToValidate.push(colIdx);
            }
  
            // create related records array of {field: [fieldsToDisplay]}
            if ('relationshipName' in currColConfig && currColConfig.relationshipName != null) {
              if (currColConfig.relationshipName in relatedRecords) {
                relatedRecords[currColConfig.relationshipName].push(currColConfig.data);
              } else {
                relatedRecords[currColConfig.relationshipName] = [currColConfig.data];
              }
            }

            colIdx += 1;
  
          }
        })
      }
    } else if (columnConfigParam !== null && columnConfigParam.length !== 0) {
      columnConfigs = columnConfigParam;
    }
  
    return { columnConfigs, relatedRecords, columnsToValidate };
  
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
// returns dataMap and validationMessage
export function getGridData(rowsParam, changeObj, relatedRecords, columnConfigs)
{

  let dataMap = [];
  let validationMessage = [];

  if (rowsParam != null && rowsParam.length != 0) {
    dataMap = rowsParam;
    
    let currRow;
    let displayFields;
    let relatedRecordCheck = false;
    let queryColDiff;

    // process related records
    for (let j = 0; j < dataMap.length; j++) {
      currRow = dataMap[j];
      // for each row, loop over related records
      if (relatedRecords.length !== 0) {
        Object.keys(relatedRecords).forEach(relField => {
          // { ownerRel: ['name'] }
          if (relField in currRow && currRow[relField] !== null) {
            displayFields = relatedRecords[relField];

            // check if relationship is 1:N
            if (Array.isArray(currRow[relField])) {
              currRow = get1_NRecordData(relField, displayFields, currRow);

            } else {
              // index into object, add specified fields to dataMap as flat key:value pair
              displayFields?.forEach(displayField => {
                if (displayField in currRow[relField]) {
                  currRow[displayField] = currRow[relField][displayField];
                }
              });
            }

            // remove relField:{object} from data
            if (typeof(currRow[relField]) === 'object' || Array.isArray(currRow[relField])) {
              delete currRow[relField];
            }
          }
        });
      }

      // remove data items not defined in columnConfig
      if (columnConfigs.length !== 0) {
        let validCols = columnConfigs.map(x => x.data);
        currRow = Object.keys(currRow).reduce((acc, key) => {
          if (validCols.includes(key)) {
            acc[key] = currRow[key];
          }
          return acc;
        }, {});
      }
      
      // check if there are undefined related records
      if (!relatedRecordCheck) {
        queryColDiff = columnConfigs.length - Object.keys(currRow).length;
        if (queryColDiff === 0) {
          relatedRecordCheck = true;
        }
      }

      dataMap[j] = currRow;
      
    }

    if (!relatedRecordCheck) {
      validationMessage.push("Error displaying data: If showing related record data, please define the relationship between the primary record type and related record type in the columnConfig parameter.");
      Appian.Component.setValidations(validationMessage);
    }
  } else if (columnConfigs.length !== 0) {
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
  return { data: dataMap, validationMessages: validationMessage };
}

// Returns and sets userPermission levels to globalVar userPermissionLevel
// Calls servlet to get permission of passed in group
export async function getUserPermission(securityParam) {
  let userPermissionLevel;
  let groups = {};

  if ('editor' in securityParam) {
    if (Array.isArray(securityParam['editor'])) {groups['editor'] = securityParam.editor.map(x => x.id); }
    else { groups['editor'] = [securityParam.editor.id]; }
  }
  if ('viewer' in securityParam) { 
    if (Array.isArray(securityParam['viewer'])) { groups['viewer'] = securityParam.viewer.map(x => x.id);  }
    else { groups['viewer'] = [securityParam.viewer.id]; }
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

export function getHiddenColumns(showPrimaryKeysParam, queryInfo, primaryKeyField, hiddenFieldsParam) {
  // Add primary key visual indeces to global hiddenCols var
  let hiddenCols = [];
  if (!Array.isArray(hiddenFieldsParam)) { hiddenFieldsParam = [hiddenFieldsParam]; }
  if (showPrimaryKeysParam === false || showPrimaryKeysParam === undefined) { hiddenFieldsParam.push(primaryKeyField); }

  if (hiddenFieldsParam.length !== 0) {
    let indx;
    if (queryInfo !== null) {
      hiddenFieldsParam.forEach(hiddenField => {
        indx = queryInfo.indexOf(hiddenField);
          if (indx != -1) {
            hiddenCols.push(indx);
          }
      });
    }
    
  }

  return hiddenCols;
}

// Returns grid height from component parameters
// Accepts "AUTO", an integer value, or undefined (if not set)
// AUTO calculates a value based on num rows with a min of 325 and max of 800.
function getAutoGridHeightHelper(dataLen, heightParam) {

  // default
  let height = 800;

  // Grid Height Edge Cases
    // Grid is empty
  if (dataLen == null || dataLen == 0) {
    return 325;
  }

  // let heightValue = styleParam.height;
  if (heightParam == "auto" || heightParam == undefined)
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
  
  return height;
}

// If SHORT, MEDIUM, TALL, sets grid height to 10 minus that height.
function getGridHeightHelper(heightParam) {
  let height;
  if (typeof heightParam === 'string') {
    let idx = heightParam.indexOf('px');
    if (idx !== -1) {
      height = heightParam.slice(0, idx);
      let intHeight = parseInt(height);
      if (intHeight !== NaN) { return intHeight - 10;}
    }
  }
}

// Gets grid height from component parameters.
// If auto, calculates auto height. If SHORT, MEDIUM, TALL, sets grid height to 10 minus that height.
export function getGridHeight(dataLen, heightParam) {
  if (heightParam === "auto" || heightParam == undefined) {
    // heightParam will always be auto. Can remove this
    return getAutoGridHeightHelper(dataLen, heightParam);
  } else {
    return getGridHeightHelper(heightParam);
  }
}

// Returns an object of grid configuration options
// param gridHeight - int calculated from user input
// param hiddenCols - list of primary key field indices to hide
// param rowHeadersParam - show row headers
export function getGridOptions(gridHeight, hiddenCols, rowHeadersParam) {
  if (rowHeadersParam === null) { rowHeadersParam = true; }

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
    headerClassName: 'htLeft myColHeader',
    contextMenu: CONTEXT_MENU_VIEWER,
    allowInsertColumn: false,
    filters: true,
    allowInsertRow: true,
    manualColumnMove: true,
    manualColumnResize: true,
    manualColumnFreeze: true,
    manualRowMove: true,
    minSpareRows: 1,
    rowHeights: 40,
    className: "htMiddle",
    rowHeaders: rowHeadersParam,
  };

  return options;

} 

export function getEditablePKList(primaryKeyFieldList, relatedRecords) {
  let relatedRecordFields = Object.values(relatedRecords).flat();
  const editablePKList = primaryKeyFieldList.filter(x => !relatedRecordFields.includes(x));
  return editablePKList;
}
