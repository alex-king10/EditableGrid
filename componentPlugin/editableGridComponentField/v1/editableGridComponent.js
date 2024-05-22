// import { data } from "./constants.js";
import { 
  safeHtmlRenderer, 
  coverRenderer,
  progressBarRenderer, 
  userRenderer, 
  dropdownRenderer, 
  timeAndDateRenderer,
  customDateRenderer,
  longTextRenderer,
  fileRenderer
} from "./customRenderers.js";

// import {
//   CustomObjectEditor
// } from "./customEditors.js";

// GLOBAL VAR
let data = [];
let columnHeaderData = [];
let columnMetaData = [];
let changeObj = {};
let columnWidths = [];
let sumColWidths = 0;

// CREATE CUSTOM EDITORS

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


// REGISTER CUSTOM RENDERERS

Handsontable.renderers.registerRenderer('my.progressBarRenderer', progressBarRenderer);
Handsontable.renderers.registerRenderer('my.coverRenderer', coverRenderer);
Handsontable.renderers.registerRenderer('my.fileRenderer', fileRenderer);
Handsontable.renderers.registerRenderer('apn.userRenderer', userRenderer);
Handsontable.renderers.registerRenderer('apn.dropdownRenderer', dropdownRenderer);
Handsontable.renderers.registerRenderer('apn.timeAndDateRenderer', timeAndDateRenderer);
Handsontable.renderers.registerRenderer('apn.customDateRenderer', customDateRenderer);
Handsontable.renderers.registerRenderer('apn.longTextRenderer', longTextRenderer);

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

// Register Long Text Cell Type
Handsontable.cellTypes.registerCellType('longText', {
  renderer: 'apn.longTextRenderer',
  myCustomProperty: 'foo',
});

// Register Date and Time Cell Type
Handsontable.cellTypes.registerCellType('appianDateAndTime', {
  renderer: 'apn.timeAndDateRenderer',
  // editor:  Handsontable.editors.NumericEditor,
  className: 'cellStyle-appianObject',
  // readOnly: true,
});

// Register Custom Date Cell Type
Handsontable.cellTypes.registerCellType('appianDate', {
  renderer: 'apn.customDateRenderer',
  // editor:  Handsontable.editors.NumericEditor,
  className: 'cellStyle-appianObject',
  readOnly: true,
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


// INSTANTIATE GRID W/ DATA AND COLUMN
function setGridData(rowsParam)
{
  // if (rowsParam == null)
  // {
  //   return data;
  // }
  data = [];
  let currRow = [];

  if (rowsParam != null)
  {
    for (let i = 0; i < rowsParam.length; i++)
    {
      if ((Object.keys(changeObj).length != 0 && changeObj[i] != undefined)) {
        currRow = changeObj[i];
      } else {
        currRow = Object.values(rowsParam[i]);
      }

      // currRow = Object.values(rowsParam[i]);
      data.push(currRow);
    }
    // reset changeObj?
    // changeObj = {};
  }
  
  console.log(data);
  return data;
}

function setColumnData(colHeaderParam, dataParam)
{
  columnHeaderData = [];

  if (colHeaderParam != null)
  {
    columnHeaderData = colHeaderParam;
    return colHeaderParam;
  } else {
    if (dataParam != null)
    {
      columnHeaderData = Object.keys(dataParam[0]);

    }
  }


  return columnHeaderData;

}

function setColMetaData(columnConfigParam)
{
  if (columnConfigParam != null) {
    let filteredMetaData = [];

    for (let i = 0; i < columnConfigParam.length; i++) {
      if ("readOnly" in Object.keys(columnConfigParam[i])) {
        if (columnConfigParam[i]["readOnly"] === false) {
          delete columnConfigParam[i].readOnly;
        }
      }
    }
  }

  columnMetaData = columnConfigParam;
  return columnConfigParam;
}

function setColMetaData2(dataParam, columnConfigParam) {
  let columnHeaderData2 = [];
  let queryInfo = null;

  if (dataParam != null) {
    queryInfo = Object.keys(dataParam[0]);
    console.log(queryInfo);
  }

  if (queryInfo != null) {
    for (let i = 0; i < queryInfo.length; i++) {
      let currDataField = queryInfo[i];
      let currColumnObject = null;
      // console.log("currDataField");
      // console.log(currDataField);

      // find if currDataField in columnConfigParam
      if (columnConfigParam != null) {
        for (let j = 0; j < columnConfigParam.length; j++) {
          let currColConfig = columnConfigParam[j];

          // if currDataField is in config param
          if (currColConfig.field == currDataField) {
            // if no title specified, use field name
            if (currColConfig.title == undefined) {
              currColConfig['title'] = currDataField;
            }

            // remove 'field' from object
            delete currColConfig.field;

            // add modified currColConfid to object
            currColumnObject = currColConfig;

            break;
          }

          // if (Object.hasOwn(columnConfigParam[j], 'field')) {

          //   console.log(columnConfigParam[j].field);

          //   if (columnConfigParam[j].field == currDataField) {

          //     let fieldName = columnConfigParam[j].field;

          //     currColumnObject = columnConfigParam[j];
          //     break;
          //   }
          // }
        }
      } else { console.error("Column Config Param is null"); }

      // console.log(currDataField);
      // console.log(currColumnObject);
      // if currColumnObject still null --> not in config param
      if (currColumnObject == null) {
        currColumnObject = { title: currDataField };
      }

      columnHeaderData2.push(currColumnObject);

    }

  } else {
    console.error("Query info null");
  }

  console.log(columnHeaderData2);
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
              let calcHeight = 41 + (dataParam.length * 41);

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

function adjustOuterContainerWidth() {
  const myGrid = document.getElementById('myGrid');
  const innerContainer = document.getElementsByClassName('wtHider');

  console.log(innerContainer);

  let innerWidthArr = [];
  // Get the width of the inner container
  for (let i = 0; i < innerContainer.length; i++) {
    innerWidthArr.push(innerContainer[i].offsetWidth);
  }
  
  const initInnerWidth = innerContainer[0].offsetWidth;

  // Get the width of the outer container
  const outerWidth = myGrid.offsetWidth;

  console.log(`initInnerWidth: ${initInnerWidth}`);
  console.log(`innerWidthArr: ${innerWidthArr}`);
  console.log(`outerWidth: ${outerWidth}`);

  // Set the outer container's width to match the inner container's width if the inner width is smaller
  if (initInnerWidth < outerWidth) {
    console.log('initInnerWidth < outerWidth');
    myGrid.style.width = `${initInnerWidth}px`;

    console.log(myGrid.offsetWidth);
  } else {
    // Optionally, reset the width to auto if you want to handle the case where the inner width is larger
    myGrid.style.width = '100%';
  }
}

// HANDLE CHANGES IN DATA
function onChange(cellMeta, newValue, source)
{

  if (cellMeta != null)
  {
    
    let dataItem = data[cellMeta.row];
    let fieldName = columnHeaderData[cellMeta.visualCol];

    // console.log(dataItem);
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
      "alignment",
      "---------",
      "filter_by_condition",
      "filter_by_condition2",
      "filter_operators",
      "filter_by_value",
      "filter_action_bar"
    ];

  
    // update grid settings
    hotGrid.updateSettings({
      data: setGridData(dataParam),
      // colHeaders: setColumnData(colHeaderParam, dataParam),
      columns: setColMetaData2(dataParam, configParam),
      // columns: setColMetaData(configParam),
      height: setGridHeight(dataParam, styleParam),
     stretchH: 'all',
      multiColumnSorting: true,
      mergeCells: true,
      customBorders: true,
      copyPaste: true,
      dropdownMenu: columnMenu,
      hiddenColumns: {
        indicators: true
      },
      contextMenu: contextMenu,
      allowInsertColumn: false,
      filters: true,
      allowInsertRow: true,
      manualColumnMove: false,
      manualColumnResize: true,
      rowHeaders: false,
      manualRowMove: false,
      rowHeights: 40,
      className: "htMiddle",
    });

    if (gridOptionsParam != null)
    {   
      hotGrid.updateSettings(gridOptionsParam);
    } else {
      console.log("gridOptions param is null");
    }

    // hotGrid.render();


    // EVENT HANDLING
    hotGrid.addHook('afterChange', (changes, [source]) => {

      // console.log([source]);
  
      // call handle change function
      changes?.forEach(([row, prop, oldValue, newValue]) => {
  
        if (newValue != oldValue)
        {
          let cellMeta = hotGrid.getCellMeta(row, prop);
          onChange(cellMeta, newValue, [source]);
          // console.log(changeObj);
          Appian.Component.saveValue("changeData", changeObj);
        }
  
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

    hotGrid.addHook('afterColumnSort', (currentSortConfig, destinationSortConfigs) => {
      console.log(currentSortConfig);
      console.log(destinationSortConfigs);
    });

    // // calculate column widths and reset if needed

    // const columnPlugin = hotGrid.getPlugin('autoColumnSize');

    // // set widths of all columns on init render
    //   // retrieves widths of all columns
    // if (columnHeaderData != null) {
    //   for (let i = 0; i < columnHeaderData.length; i++) {
    //     let colWidth = columnPlugin.getColumnWidth(i);
    //     console.log(`colWidth for column ${i}: ${colWidth}`);
    //     columnWidths.push(colWidth);
    //     sumColWidths += colWidth;
    //   }
    // }

    // console.log(columnWidths);

    // // if column is resized, track new values. Make bigger if needed.
    hotGrid.addHook('beforeColumnResize', (newSize, column, isDoubleClick) => {
      console.log('beforeColumnResize');
      console.log(newSize, column, isDoubleClick);

      adjustOuterContainerWidth();

      // use something like getColumnWidth
      // console.log(`sumColWidths: ${sumColWidths}`);

      // will be number of columns/wtHider width
        // need to do a query selector to get the width of div of .wtHider
      // let minColWidth = 200;

      // handle change
      // sumColWidths -= columnWidths[column];

      // if (newSize > minColWidth) {
      //   console.log(`New Size (${newSize}) greater than min width (${minColWidth})`);

      //   columnWidths[column] = newSize;
      //   sumColWidths += newSize;
      // } else {
      //   console.log(`New Size (${newSize}) less than min width (${minColWidth})`);
      //   sumColWidths += minColWidth;
      //   columnWidths[column] = minColWidth;
        // hotGrid.updateSettings({colWidths: columnWidths});
      // }

    //   console.log(columnWidths);


    });


  } catch (error) {
    console.error("An error occured creating the grid:", error);
  }


});