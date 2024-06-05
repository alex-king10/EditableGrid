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


// GLOBAL VAR
let data = [];
let columnHeaderData = [];
let changeObj = {};

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
Handsontable.cellTypes.registerCellType('appianObject', {
  renderer: 'apn.userRenderer',
  editor: false,
  className: 'cellStyle-appianObject',
  readOnly: true,
  myCustomProperty: 'foo'
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
  // columnConfigParam?.forEach((colConfig) => {
  //   console.log(colConfig);

  // });
  let filteredMetaData = [];

  for (let i = 0; i < columnConfigParam.length; i++) {
    if ("readOnly" in Object.keys(columnConfigParam[i])) {
      if (columnConfigParam[i]["readOnly"] === false) {
        delete columnConfigParam[i].readOnly;
      }
    }
  }

  return columnConfigParam;
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

              // max of 1200 px
              if (calcHeight < 10001) {
                height = 10000;
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
          console.log("Height not in style");
        }
  }

  return height;
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
      colHeaders: setColumnData(colHeaderParam, dataParam),
      columns: setColMetaData(configParam),
      height: setGridHeight(dataParam, styleParam),
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
      manualColumnMove: true,
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

    hotGrid.render();


    // EVENT HANDLING
    hotGrid.addHook('afterChange', (changes, [source]) => {

      console.log([source]);
  
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



  } catch (error) {
    console.error("An error occured creating the grid:", error);
  }


});


  // // Get all rows in the table body
  // let rows = document.querySelectorAll('.handsontable tbody tr');

  // // Add event listeners to each row for mouseover and mouseout events
  // rows.forEach(row => {
  //   row.addEventListener('mouseover', function() {
  //     // Highlight the entire row by adding a CSS class
  //     this.classList.add('highlighted-row');
  //   });

  //   row.addEventListener('mouseout', function() {
  //     // Remove the highlighting CSS class when mouse moves out of the row
  //     this.classList.remove('highlighted-row');
  //   });
  // });

  // let cells = document.querySelectorAll(".handsontable tbody td, .handsontable thead th");

  // cells.forEach((cell) => {
  //   cell.addEventListener("mouseover", function () {
  //     // Get the cell's index within its row
  //     let cellIndex = this.cellIndex;

  //     console.log(cellIndex);
  //     // Highlight the entire column (including header) by adding a CSS class
  //     document
  //       .querySelectorAll(
  //         `.handsontable tbody td:nth-child(${
  //           cellIndex + 1
  //         }), .handsontable thead th:nth-child(${cellIndex + 1})`
  //       )
  //       .forEach((colCell) => {
  //         colCell.classList.add("highlighted-column");
  //       });
  //   });

  //   cell.addEventListener("mouseout", function () {
  //     // Remove the highlighting CSS class when mouse moves out of the column
  //     document.querySelectorAll(".highlighted-column").forEach((colCell) => {
  //       colCell.classList.remove("highlighted-column");
  //     });
  //   });
  // });


