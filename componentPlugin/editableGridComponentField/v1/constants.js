export const LICENSE_KEY = "[TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-051680}_is_granted_for_evaluation_only___Use_in_production_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_purchasing_a_production_key_please_contact_info@ag-grid.com___You_are_granted_a_{Single_Application}_Developer_License_for_one_application_only___All_Front-End_JavaScript_developers_working_on_the_application_would_need_to_be_licensed___This_key_will_deactivate_on_{31 January 2024}____[v3]_[0102]_MTcwNjY1OTIwMDAwMA==28c721feb2e1886381b211053fd5ff49";

// STYLING CONSTANTS - needs to be first p sure
export const THEME_MAP = {
    bgColor: "--ag-background-color",

    fgColor: "--ag-foreground-color",

    dataColor: "--ag-data-color",

    headerBGColor: "--ag-header-background-color",
    headerFGColor: "--ag-header-foreground-color",
    headerIconColor: "--ag-icon-font-color",

    rangeSelectionBorderColor: "--ag-range-selection-border-color",
    rangeSelectionBGColor: "--ag-range-selection-background-color",
    rangeSelectionBorderStyle: "--ag-range-selection-border-style",

    activeColor: "--ag-active-color",

    fontFamily: "--ag-font-family",

    // potentially do diff levels to accept here: critical, none, solid 1px, etc.
    borders: "--ag-borders",
    borderColor: "--ag-border-color",
    
    // controlPanelBGColor: "--ag-control-panel-background-color",
    // gridSize: "--ag-grid-size",
    // rowHeight: "--ag-row-height", --> looks really bad
    // fontSize: "--ag-font-size", ==> also looks pretty not good
    // headerHeight: "--ag-header-height", --> doesn't change anything
}

// Column level styling - Cell class rules and map
export const booleanCellClassRules = {
    "cellStyle-green": (params) => params.value in ["Yes", 1, true],
    "cellStyle-red": (params) => params.value in ["No", 0, false, "", null],
    // make dynamic later
    "cellStyle-background":(params) => true
}

// not working when called from Appian :/
export const numRangeCellClassRules = params => {
    console.log(params);
    return params.value > 0? {color: '#33cc3344'} : {color: '#cc222244'};
};

export const CELL_CLASS_RULES_MAP = {
    "booleanCellClassRules": booleanCellClassRules,
    "numRangeCellClassRules": numRangeCellClassRules
}


// servlet constants

const BASE_URL =
  window.location != window.parent.location
    ? document.referrer
    : document.location.href;
export const LOGGED_IN_USER_SERVLET_REQUEST_URL = `${BASE_URL}suite/plugins/servlet/getloggedinuser`;
export const USER_INFO_SERVLET_REQUEST_URL = `${BASE_URL}suite/plugins/servlet/getuserinfo`;
export const USER_SECURITY_INFO_SERVLET_REQUEST_URL = `${BASE_URL}suite/plugins/servlet/getusersecurity`;
export const GET_RECORD_BY_ID_SERVLET_REQUEST_URL = `${BASE_URL}suite/plugins/servlet/getRecordByID`;
export const GET_RECORD_FIELD_UUID_SERVLET_REQUEST_URL = `${BASE_URL}suite/plugins/servlet/getRecordTypeInfo`;

export async function getUserInfo(userID, displayField) {
    let url = `${USER_INFO_SERVLET_REQUEST_URL}?userID=${encodeURIComponent(userID)}&displayField=${encodeURIComponent(displayField)}`;
    const response = await fetch(url, {
        credentials: 'include'
    });
    const result = await response.json();
    return result;
}

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

  console.log(url);

  const response = await fetch(url, {
      credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  return result;
}

export async function getRecordFieldUUID(recordUuid, pkFieldName) {
  let url = `${GET_RECORD_FIELD_UUID_SERVLET_REQUEST_URL}?recordUuid=${encodeURIComponent(recordUuid)}&pkFieldName=${encodeURIComponent(pkFieldName)}`;
  const response = await fetch(url, {
      credentials: 'include'
  });
  const result = await response.json();
  return result;
}

export async function doesRecordExistServlet(recordUuid, id) {
  let url = `${GET_RECORD_BY_ID_SERVLET_REQUEST_URL}?recordUuid=${encodeURIComponent(recordUuid)}&id=${encodeURIComponent(id)}`;
  const response = await fetch(url, {
      credentials: 'include'
  });
  const result = await response.json();
  return result;
}

export function getUserInfoServlet(userID, displayField) {
    // const myURL = LOGGED_IN_USER_SERVLET_REQUEST_URL;
    // userID = "admin.user";
    // displayField = "fullName";

    let url = `${USER_INFO_SERVLET_REQUEST_URL}?userID=${encodeURIComponent(userID)}&displayField=${encodeURIComponent(displayField)}`;
    // handle readableStream
    fetch(url, {
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    //   console.log(response);
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
            console.log(result); 
            return result;
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

  
export const SELECTED_CLASS = "selected";
export const ODD_ROW_CLASS = "odd";
  