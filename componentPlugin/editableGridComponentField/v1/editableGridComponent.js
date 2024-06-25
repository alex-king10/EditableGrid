import { 
  safeHtmlRenderer, 
  coverRenderer,
  progressBarRenderer, 
  userRenderer, 
  dropdownRenderer, 
  timeAndDateRenderer,
  getFormattedDate,
  customDateRenderer,
  longTextRenderer,
  fileRenderer,
  relatedRecordRenderer
} from "./customRenderers.js";

import {LOGGED_IN_USER_SERVLET_REQUEST_URL, getUserInfo, getGroupInfo } from "./constants.js";

// GLOBAL VAR
// let data = [];
let dataMap = [];
let gridMode = "auto";
let colIdxMap = {};
let changeObj = {};
const CUSTOM_CELL_TYPES = ["appianUser", "appianGroup", "appianDate"];
let currCustomCellTypes = [];
let columnHeaderData = [];
// const customGridOptions = ["formulas"];

// CREATE CUSTOM EDITORS

class PasswordEditor extends Handsontable.editors.TextEditor {
  createElements() {
    super.createElements();
    console.log(this);
    this.TEXTAREA = this.hot.rootDocument.createElement('input');
    this.TEXTAREA.setAttribute('type', 'password');
    this.TEXTAREA.setAttribute('data-hot-input', true); // Makes the element recognizable by HOT as its own component's element.
    this.textareaStyle = this.TEXTAREA.style;
    this.textareaStyle.width = 0;
    this.textareaStyle.height = 0;

    this.TEXTAREA_PARENT.innerText = '';
    this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
  }
}

class CustomObjectEditor extends Handsontable.editors.TextEditor {
  createElements() {
    super.createElements();

    // Create input element for editing
    this.TEXTAREA = this.hot.rootDocument.createElement("input");
    this.TEXTAREA.setAttribute("type", "text");
    this.TEXTAREA.setAttribute("data-hot-input", true);
    this.textareaStyle = this.TEXTAREA.style;
    this.textareaStyle.width = 0;
    this.textareaStyle.height = 0;

    this.TEXTAREA_PARENT.innerText = "";
    this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
  }

  prepare(row, col, prop, td, originalValue, cellProperties) {
    const idValue = originalValue && originalValue.id ? originalValue.id : "";
    originalValue = idValue;

    super.prepare(row, col, prop, td, originalValue, cellProperties);
    this.setValue(idValue);
  }

  saveValue(value, ctrlDown) {
    // Create an object with the new id value
    const newValue = { id: value[0] };
    let newValueArray = [];
    newValueArray.push(newValue);

    // super.saveValue(newValue, ctrlDown);
    super.saveValue(newValueArray, ctrlDown);
    // Save the new object back to the cell
    hotGrid.setDataAtCell(this.row, this.col, newValue);
  }

}


// CUSTOM SELECT EDITOR

class SelectEditor extends Handsontable.editors.BaseEditor {
  /**
   * Initializes editor instance, DOM Element and mount hooks.
   */
  init() {
    // Create detached node, add CSS class and make sure its not visible
    this.select = this.hot.rootDocument.createElement('SELECT');
    this.select.classList.add('htSelectEditor');
    this.select.style.display = 'none';

    // Attach node to DOM, by appending it to the container holding the table
    this.hot.rootElement.appendChild(this.select);
  }

  prepareOptions(optionsToPrepare) {
    let preparedOptions = {};
  
    if (Array.isArray(optionsToPrepare)) {
      for (let i = 0, len = optionsToPrepare.length; i < len; i++) {
        preparedOptions[optionsToPrepare[i]] = optionsToPrepare[i];
      }
  
    } else if (typeof optionsToPrepare === 'object') {
      preparedOptions = optionsToPrepare;
    }
  
    return preparedOptions;
  }
  

    // Create options in prepare() method
  prepare(row, col, prop, td, originalValue, cellProperties) {
      // Remember to invoke parent's method
      super.prepare(row, col, prop, td, originalValue, cellProperties);

      const selectOptions = this.cellProperties.selectOptions;
      let options;

      if (typeof selectOptions === 'function') {
        options = this.prepareOptions(selectOptions(this.row, this.col, this.prop));
      } else {
        options = this.prepareOptions(selectOptions);
      }

      this.select.innerText = '';

      Object.keys(options).forEach((key) => {
        const optionElement = this.hot.rootDocument.createElement('OPTION');
        optionElement.value = key;
        optionElement.innerText = options[key];
        this.select.appendChild(optionElement);
      });
  }

  getValue() {
    return this.select.value;
  }
  
  setValue(value) {
    this.select.value = value;
  }
  
  open() {
    const {
      top,
      start,
      width,
      height,
    } = this.getEditedCellRect();
    const selectStyle = this.select.style;
  
    this._opened = true;
  
    selectStyle.height = `${height}px`;
    selectStyle.minWidth = `${width}px`;
    selectStyle.top = `${top}px`;
    selectStyle[this.hot.isRtl() ? 'right' : 'left'] = `${start}px`;
    selectStyle.margin = '0px';
    selectStyle.display = '';
  }
  
  focus() {
    this.select.focus();
  }
  
  close() {
    this._opened = false;
    this.select.style.display = 'none';
  }
  

}

Handsontable.editors.registerEditor('appianSelectEditor', SelectEditor);




// REGISTER CUSTOM RENDERERS

Handsontable.renderers.registerRenderer('my.progressBarRenderer', progressBarRenderer);
Handsontable.renderers.registerRenderer('my.coverRenderer', coverRenderer);
Handsontable.renderers.registerRenderer('my.fileRenderer', fileRenderer);
Handsontable.renderers.registerRenderer('apn.userRenderer', userRenderer);
Handsontable.renderers.registerRenderer('apn.dropdownRenderer', dropdownRenderer);
Handsontable.renderers.registerRenderer('apn.timeAndDateRenderer', timeAndDateRenderer);
Handsontable.renderers.registerRenderer('apn.customDateRenderer', customDateRenderer);
Handsontable.renderers.registerRenderer('apn.longTextRenderer', longTextRenderer);
Handsontable.renderers.registerRenderer('apn.relatedRecordRenderer', relatedRecordRenderer);

// CUSTOM CELL TYPES

// Register User Cell Type - appianObject
Handsontable.cellTypes.registerCellType('appianUser', {
  renderer: 'text',
  editor: false,
  className: 'cellStyle-appianObject',
  readOnly: true,
  displayField: 'displayField'
});

// Register Group Cell Type - appianObject
Handsontable.cellTypes.registerCellType('appianGroup', {
  renderer: 'text',
  editor: false,
  className: 'cellStyle-appianObject',
  readOnly: true,
});

// Register Long Text Cell Type
Handsontable.cellTypes.registerCellType('longText', {
  renderer: 'apn.longTextRenderer',
  myCustomProperty: 'foo',
});

// Register Date and Time Cell Type
Handsontable.cellTypes.registerCellType('appianDateAndTime', {
  renderer: 'apn.timeAndDateRenderer',
  // editor:  Handsontable.editors.NumericEditor,
  editor: false,
  className: 'cellStyle-appianObject',
  // readOnly: true,
});

// Register Custom Date Cell Type
Handsontable.cellTypes.registerCellType('appianDate', {
  // renderer: 'date',
  // type: 'date',
  renderer: Handsontable.renderers.DateRenderer,
  editor:  Handsontable.editors.DateEditor,
  className: 'cellStyle-appianObject',
  // readOnly: true,
});

// Register Appian Dropdown ? - will be an extension of their dropdown option
// maybe to do later. Will just do renderer for now
Handsontable.cellTypes.registerCellType('appianDropdown', {
  renderer: 'apn.dropdownRenderer',
  // editor:  Handsontable.editors.NumericEditor,
  className: 'cellStyle-appianObject',
  readOnly: true,
  choiceLabels: 'choiceLabels',
  choiceValues: 'choiceValues'
});

// 'apn.relatedRecordRenderer
Handsontable.cellTypes.registerCellType('appianRelatedRecord', {
  renderer: 'apn.relatedRecordRenderer',
  className: 'cellStyle-appianObject',
  readOnly: true,
  displayField: 'displayField'
});

// REGISTER EDITORS
Handsontable.editors.registerEditor('appianPasswordEditor', PasswordEditor);


// DATA PROCESSING FUNCTIONS
  // handles differentiation b/w data types
async function preprocessData(fieldMetaData, data) {
  let type = fieldMetaData.type;
  let displayField;
  if ('displayField' in fieldMetaData) { displayField = fieldMetaData.displayField; }

  let newData = "";
  if (type == 'appianUser') {
    if ('id' in data) { data = data.id; }
    newData = await getUserInfo(data, displayField);
  } else if (type == 'appianGroup') {
    if ('id' in data) { data = data.id; }
    newData = await getGroupInfo(data);
  } else if (type == 'appianDate') {
    // newData = getFormattedDate(data);
    newData = new Date(data);
    newData = getFormattedDate(newData);

  }

  return newData;
}


// INSTANTIATE GRID W/ DATA AND COLUMN
async function setGridData(rowsParam, currCustomCellTypes)
{

  dataMap = [];
  let currRow = [];
  let currMapRow = [];

  if (rowsParam != null)
  {
    for (let i = 0; i < rowsParam.length; i++) {

      // figure out why i can't remove this
      if ((Object.keys(changeObj).length != 0 && changeObj[i] != undefined)) {
        currRow = Object.values(changeObj[i]);
      } else {
        // currRow =  Object.values(rowsParam[i]);
        currMapRow = rowsParam[i];
      }
      // Collect promises
      let promises = [];

      // check if data needs to be preprocessed
      currCustomCellTypes.forEach((customCell) => {
        let field = Object.keys(customCell)[0];
        let fieldMetaData = customCell[field];
        let currData = currMapRow[field];

        if (field in currMapRow) {
          if (fieldMetaData.type == "appianDate") {
            let newData = new Date(currData);
            newData = getFormattedDate(newData);
            currMapRow[field] = newData;
          } else {
            promises.push(
              preprocessData(fieldMetaData, currData).then(newData => {
                currMapRow[field] = newData.content;
              }).catch(error => {
                console.error(error);
              })
            );
          }
          

        }

      });

      await Promise.all(promises);
      
      dataMap.push(currMapRow);
    }
    
  }
  
  console.log(dataMap);
  hotGrid.updateSettings({data: dataMap});

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

      // check if currColumnObject is a special type
      if ('type' in currColumnObject) {
        if ( CUSTOM_CELL_TYPES.includes(currColumnObject.type) ) {
          let colObj = {};
          let colData = {};
          colData['type'] = currColumnObject.type;
          if ('displayField' in currColumnObject) {
            colData['displayField'] = currColumnObject.displayField;
          }
          colObj[currColumnObject.data] = colData;

          currCustomCellTypes.push(colObj);

        }
      }
      columnHeaderData2.push(currColumnObject);

    }

  } else {
    console.error("Query info null");
  }

  columnHeaderData = columnHeaderData2;
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

function setStyle(styleParam) {

  if (styleParam != null) {

    // set highlight color - not working ATM
    if ('highlightColor' in styleParam) {
      const highlightColor = styleParam.highlightColor;
      const area = document.querySelector('.area');
      if (area) {
        area.style.background = `${highlightColor} !important`;
      } else {
        console.log(area);
      }
    }

    // set mode (worksheet or auto)
    if ('mode' in styleParam) {
      if (styleParam.mode == "worksheet") {
        gridMode = "worksheet";
        hotGrid.updateSettings({
          // style edits needed on these
          rowHeaders: true,
          colHeaders: true,
        });
      } else {
        gridMode = "auto";
        hotGrid.updateSettings({
          rowHeaders: false,
        });
      }

    }
  }


}



// HANDLE CHANGES IN DATA
function onChange(cellMeta, newValue, source)
{

  if (cellMeta != null)
  {
    
    let dataItem = dataMap[cellMeta.row];
    // let fieldName = columnHeaderData[cellMeta.visualCol];

    console.log(dataItem);
    changeObj[cellMeta.row] = dataItem;

  }

}



async function getLoggedInUser() {
  const myURL = LOGGED_IN_USER_SERVLET_REQUEST_URL;
  

  // handle readableStream
    // add include credentials
  fetch(myURL, {
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.body;
  })
  .then( readableStream => {
    const reader = readableStream.getReader();
    const decoder = new TextDecoder();
    let result = '';

    function read() {
      reader.read().then(( { done, value }) => {
        if (done) {
          console.log("Stream done");
          // console.log(result);
          return;
        }

        result += decoder.decode(value, { stream: true});
        read();
      }).catch(error=> {
        console.error('Error reading stream:', error);
      });
    }

    read();
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });

}

let hotGrid;
try {

  // getLoggedInUser();

// init grid
  const container = document.getElementById("myGrid");
  hotGrid = new Handsontable(container, {
    licenseKey: "non-commercial-and-evaluation",
    // formulas: {
    //   engine: HyperFormula,
    // },
  });
} catch (error) {
  console.error(`An error occurred ${error}`);
}

Appian.Component.onNewValue(newValues => {

  // retrieve component parameters
  let dataParam = newValues.rows;
  let colHeaderParam = newValues.headerCells;
  let configParam = newValues.columnConfigs;
  let darkModeParam = newValues.darkMode;
  let gridOptionsParam = newValues.gridOptions;
  let styleParam = newValues.style;
  let changeDataParam = newValues.changeData;

  console.log("newValues");
  console.log(newValues);


  try {

    if (hotGrid == null || hotGrid == undefined) {
      console.error(`Hot grid null or undefined: ${hotGrid}`);
    }

    let contextMenu = [
      "row_above",
      "row_below",
      "remove_row",
      "---------",
      "undo",
      "redo",
      "cut",
      "copy",
      "---------",
      "borders",
      "mergeCells",
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

    setStyle(styleParam);
    // setColMetaData2(dataParam, configParam);
    // setGridData(dataParam, currCustomCellTypes);

  
    // update grid settings
    hotGrid.updateSettings({
      columns: setColMetaData2(dataParam, configParam),
      data: setGridData(dataParam, currCustomCellTypes),
      // data: setGridData(dataParam),
      // colHeaders: setColumnData(colHeaderParam, dataParam),
      // columns: setColMetaData(configParam),
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
      minSpareRows: 1,
      manualRowMove: false,
      rowHeights: 40,
      className: "htMiddle",
    });

    // setGridData(dataParam, currCustomCellTypes);

    if (gridOptionsParam != null)
    {   
      hotGrid.updateSettings(gridOptionsParam);
    } else {
      console.log("gridOptions param is null");
    }

    // hotGrid.render();


    // EVENT HANDLING
    hotGrid.addHook('afterChange', (changes, [source]) => {

      // call handle change function
      changes?.forEach(([row, prop, oldValue, newValue]) => {
        if (newValue != oldValue)
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

    hotGrid.addHook('beforeChange', (changes, [source]) => {
      changes?.forEach(([row, prop, oldValue, newValue]) => {
        console.log([row, prop, oldValue, newValue]);
      });
    });

    // Function to call after a new row has been created
    hotGrid.addHook('afterCreateRow', (row, amount) => {
      console.log(`${amount} row(s) were created, starting at index ${row}`);
      // need to specially handle this edit - find last PK and increment?
    });

    hotGrid.addHook('afterColumnMove', (movedColumns, finalIndex, dropIndex, movePossible, orderChanged) => {
      console.log(movedColumns, finalIndex, dropIndex, movePossible, orderChanged);
      // let cellMeta = hotGrid.getCellMeta(1,1);
      // console.log(cellMeta);
    });


    // hotGrid.addHook('afterColumnSort', (currentSortConfig, destinationSortConfigs) => {
    //   console.log(currentSortConfig);
    //   console.log(destinationSortConfigs);
    // });



  } catch (error) {
    console.error("An error occured creating the grid:", error);
  }


});