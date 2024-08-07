export const LICENSE_KEY = "[TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-051680}_is_granted_for_evaluation_only___Use_in_production_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_purchasing_a_production_key_please_contact_info@ag-grid.com___You_are_granted_a_{Single_Application}_Developer_License_for_one_application_only___All_Front-End_JavaScript_developers_working_on_the_application_would_need_to_be_licensed___This_key_will_deactivate_on_{31 January 2024}____[v3]_[0102]_MTcwNjY1OTIwMDAwMA==28c721feb2e1886381b211053fd5ff49";


// SERVLET CONSTANTS
const BASE_URL =
  window.location != window.parent.location
    ? document.referrer
    : document.location.href;

export const USER_SECURITY_INFO_SERVLET_REQUEST_URL = `${BASE_URL}suite/plugins/servlet/getusersecurity`;

export async function getUserSecurityInfo(groupObject) {
  let editorGroupID;
  let viewerGroupID;

  let url = USER_SECURITY_INFO_SERVLET_REQUEST_URL;

  if (groupObject != null) {
    if ('editor' in groupObject) {
      editorGroupID = groupObject.editor;
      url = `${url}?editor=${editorGroupID}`;
    }
    if ('viewer' in groupObject) {
      viewerGroupID = groupObject.viewer;
      if (editorGroupID != undefined) {
        url = `${url}&viewer=${viewerGroupID}`;
      } else {
        url = `${url}?viewer=${viewerGroupID}`;
      }

    }
  }

  const response = await fetch(url, {
      credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  return result;
}

// GRID CONFIG CONSTANTS
export const CONTEXT_MENU = [
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

export const COLUMN_MENU = [
  "filter_by_condition",
  "filter_by_condition2",
  "filter_operators",
  "filter_by_value",
  "filter_action_bar"
];

// Returns an object of grid configuration options
// param gridHeight - int calculated from user input
// param hiddenCols - list of primary key field indices to hide
export const getGridOptions = (gridHeight, hiddenCols) => {
  return {
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
} 