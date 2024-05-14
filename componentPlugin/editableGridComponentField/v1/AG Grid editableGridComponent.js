import {LICENSE_KEY, THEME_MAP, CELL_CLASS_RULES_MAP, LOGGED_IN_USER_SERVLET_REQUEST_URL  } from './constants.js';

// agGrid.LicenseManager.setLicenseKey(LICENSE_KEY);


// CONSTANT AND GLOBAL VAR DEFINITION

//global var
let gridData = [];
let columnDataMap = {};
let columnData = [];
let changesObj = {};


const siteColorMap = {
    // change to be dynamic later
    "backgroundColor": "#46708c",
    "accentColor": "#1d659c",
}

const defaultColDef = { 
    sortable:true, 
    filter: true, 
    // floatingFilter: true, 
    editable: true, 
    enableRowGroup: true,
    enablePivot: true,
    // allow every column to be aggregated
    enableValue: true,
    // changes context meny to only have filter
    menuTabs: ['filterMenuTab']
}

const sideBarDef = {
    toolPanels: ["columns", "filters"],
    position: "left",
    defaultToolPanel: 'columns',
}

// Grid Options: default grid configurations
let gridOptions = {
  // Row Data: The data to be displayed.
    rowData:  getGridData(),
    onRowDataUpdated: (event) => {
        getGridData();
    },
  // Column Definitions: Defines & controls grid columns.
    columnDefs: getColumnData(),
    defaultColDef: defaultColDef,
//  Filtering - customize definition later - use customComponent tutorial as example
    sideBar: sideBarDef,
//  Editing Events
    onCellValueChanged: onCellValueChanged,
    undoRedoCellEditing: true,
//   other param
    allowDragFromColumnsToolPanel: true,
    getRowId: (params) => params.data.id,
    enableRangeSelection: true,
    columnHoverHighlight: true,
    enterNavigatesVerticallyAfterEdit: true,
    statusBar: {
        statusPanels: [
            {
                statusPanel: 'agTotalAndFilteredRowCountComponent',
                align: 'left',
            },
            { statusPanel: 'agSelectedRowCountComponent' },
            {
                statusPanel: 'agAggregationComponent',
                statusPanelParams: {
                    aggFuncs: ['count']
                }
            }
        ]
    },

};

//EVENT HANDLING
function onCellValueChanged(params) {

    var rowId = params.node.id;
    var rowData = params.data;

    changesObj[rowId] = rowData;

    const servletResponse = fetch(
        LOGGED_IN_USER_SERVLET_REQUEST_URL,
        {
          method: "GET",
          credentials: "include"
        }
      );

      console.log(servletResponse);

      servletResponse.then(response => {
        console.log(response);

        if (response.ok) {
            return response.json();
        } else if (response.status === 404) {
            return response.json();
        } else {
            throw new Error('Error from servlet :(')
        }
      }).then(data => {
        console.log("YAy");
        console.log(data);
      }).catch(error => {
        console.log("ERror");
        console.log(error);
      });


    Appian.Component.saveValue('changeData', changesObj);

}

function onFilterTextBoxChanged() {
    api.setGridOption(
        'quickFilterText',
        document.getElementById('filter-text-box').value
      );
}

//Grid Configuration
// Create grid
const myGridElement = document.querySelector('#myGrid');
//grid placed inside of DOM element
const api = agGrid.createGrid(myGridElement, gridOptions);

Appian.Component.onNewValue(newValues => {

    let dataParam = newValues.rows;
    let columnParam = newValues.headerCells;
    let configParam = newValues.columnConfigs;
    let darkModeParam = newValues.darkMode;
    let gridOptionsParam = newValues.gridOptions;
    let changeDataParam = newValues.changeData;

    console.log("newValues");
    console.log(newValues);


    if (gridOptionsParam && gridOptionsParam.length != 0) {
        setGridOptions(gridOptionsParam);
    }

    setColumnData(columnParam, configParam);

    setGridData(dataParam);

    // this will now be called darkMode: true (default false)
    setTheme(darkModeParam);

    // reset change data - triggered by "save changes" in interface
    if (changeDataParam == 0 && changesObj.length != 0) {
        // when local var in appian set to {}, this also sets to empty
        changesObj = {};
        // trigger an update of new data stored in the gridData object
        Appian.Component.saveValue("rows", gridData);
    }


});


// GRID OPTIONS
function setGridOptions(gridOptionsParam) {

    // TO DO: add further grid options from Appian designer to predet. ones
    // gridOptions = {...gridOptions, ...gridOptionsParam};

    // iterates through gridOptions param and sets each to grid configurations
    for (let key in gridOptionsParam) {
        if (gridOptionsParam.hasOwnProperty(key)) {
            var value = gridOptionsParam[key];

            // console.log(`key: ${key}, value: ${value}`);

            if (value.length > 1) {
                // TO DO: has not been tested - is it even needed?
                api.setGridOption(key, ...value);
            } else {
                api.setGridOption(key, value);
            }
        }
    }
}

//COLUMN DEFINTIONS
function setColumnData(columnParam, configParam) {
    columnData = [];
    columnDataMap = {};
    var currObj;

    for (var i = 0; i < columnParam.length; i++) {
        currObj = { field: columnParam[i] };
//        add to column data map - helpful for quick references to fields
        columnDataMap[columnParam[i]] = currObj;
//        add config objects for this field
        if (configParam && configParam.length != 0) {
            currObj = setColumnDataHelper(currObj, configParam);
        }
//      add to column Data
        columnData.push( currObj );
    }

    // save to grid configurations
    api.setGridOption('columnDefs', columnData);

}

function setColumnDataHelper(columnParamObj, configParam) {
    for (var i = 0; i < configParam.length; i++) {
        if (configParam[i].field) {
            if (columnParamObj.field === configParam[i].field) {
                // really do not love this - remove if cellClassRules is not improved
                if('cellClassRules' in configParam[i]) {
                    configParam[i]['cellClassRules'] = setCellClassRules(configParam[i]['cellClassRules']);
                }

                // combines column definitions set in Appian designer (through params) with default
                return Object.assign(columnParamObj, configParam[i]);
            }
        }
        

    }
    return columnParamObj;
}

// STYLING - column level
function setCellClassRules(rulesParam) {
    if (rulesParam in CELL_CLASS_RULES_MAP) {
        return CELL_CLASS_RULES_MAP[rulesParam];
    }
}

function getColumnData() {
    return columnData;
}

//GRID DATA
function setGridData(data) {
    // tracks current state of data
    gridData = [];
    let currRow = [];

    if (!data || data.length == 0) {
        api.setGridOption('rowData', gridData);
    }

    for (let i = 0; i < data.length; i++) {
         currRow = data[i];
        // check if row is in changesObj - update grid data with changes from user
        if ( changesObj && changesObj[data[i].id] ) {
            // add logic to call pre processing function
            gridData.push( changesObj[data[i].id] );
        } 
        else {
            gridData.push(currRow);
        }
    }

    api.setGridOption('rowData', gridData);

}

function getGridData() {
    return gridData;
}

// THEME
function setTheme(darkMode) {
    // Get the grid element by ID
    const gridElement = document.getElementById("myGrid");

    if (darkMode) {
        gridElement.className = `ag-theme-quartz-dark`;
    } else {
        gridElement.className = `ag-theme-quartz`;
    }

}

