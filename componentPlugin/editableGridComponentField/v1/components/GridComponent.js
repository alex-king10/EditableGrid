import {
  formatColumnHeader
} from "../services/parameters.js"

class GridComponent {

  // init grid component instance
  constructor(containerId, data, columnConfigs, gridOptions, editablePKFieldList, hotInstance, userPermissionLevel) {
      this.containerId = containerId;
      this.data = data;
      this.columnConfigs = columnConfigs;
      this.gridOptions = gridOptions;
      this.editablePKFieldList = editablePKFieldList;
      this.changeObj = {};
      // typically not set on instantiation of object
      this.hotInstance = hotInstance;
      this.userPermissionLevel = userPermissionLevel;
  }

  // initialize grid instance
  initGrid() {
      const container = document.getElementById(this.containerId);
      if (!container) {
          console.error('Grid container does not exist');
      }

      this.hotInstance = new Handsontable(container, {
          licenseKey: "non-commercial-and-evaluation",
        });
      
      this.hotInstance.updateSettings({
          data: this.data,
          columns: this.columnConfigs,
      });

      this.setGridOptions(this.gridOptions);

      this.addListeners();
  }

  setData(data) {
      // write this logic
      this.data = data;
      this.hotInstance.updateSettings({
          data: this.data,
      });
  }

  setColumnConfigs(columnConfigs) {
      this.columnConfigs = columnConfigs;
      this.hotInstance.updateSettings({
          columns: this.columnConfigs,
      });
  }


  // not sure if this function logic should go here?
  updateData() {
      let currRowIdx;
      let currChangeItem;

      // console.log("Updating data");

      if (this.data != null && this.data.length != 0) {
          if (Object.keys(this.changeObj).length == 0) {
              // no updates to make to data var
              return this.data;
          } else {
              for (let i = 0; i < Object.keys(this.changeObj).length; i++) {
                  currRowIdx = Object.keys(this.changeObj)[i];
                  currChangeItem = Object.values(this.changeObj)[i];
                  // update row in data var with value from changeObj
                  this.data[currRowIdx] = Object.assign(this.data[currRowIdx], currChangeItem);
              }
          }
      }
  }

  setGridOptions(gridOptions) {

      this.gridOptions = gridOptions;

      this.hotInstance.updateSettings(this.gridOptions);

      // handle column header formatting on sort
      this.hotInstance.updateSettings({
          afterGetColHeader: function(column, TH) {
              if (column > -1) { formatColumnHeader(TH); } 
          }
      });
  }

  getGridOptions() {
      return this.gridOptions;
  }

  setChangeObj(changeObj) {
      this.changeObj = changeObj;
  }

  getUserPermissionLevel() {
      return this.userPermissionLevel;
  }

  setUserPermissionLevel(userPermissionLevel) {
      this.userPermissionLevel = userPermissionLevel;
  }

  // Handles changes made to the grid by modifying this.changeObj
  // Called by addListeners in 'afterChange' hook
  onChange(cellMeta, newValue) {
      if (cellMeta != null) {
          let dataItem = {};
          let gridRow;

          if (cellMeta.row in this.changeObj) {
              this.changeObj[cellMeta.row][cellMeta.prop] = newValue;
          } else {
              // add PK if exists
              // access data at modified row
              gridRow = this.data[cellMeta.row];

              // add new change { name : 'test' }
              dataItem[cellMeta.prop] = newValue;

              // add primary keys (parent and related) to changeObj at this record
              // only 0 if pkName not given in recordTypeInfo - shows a validation message
              if (this.editablePKFieldList.length != 0) {
                  this.editablePKFieldList.forEach(pkField => {
                  if (pkField in gridRow && cellMeta.prop != pkField) {
                      dataItem[pkField] = gridRow[pkField];
                  }
                  })
              }

              this.changeObj[cellMeta.row] = dataItem;
          
          }

      }

  }

  addListeners() {
      if (this.hotInstance != null) {
          this.hotInstance.addHook('beforeChange', (changes, source) => {
              changes?.forEach(change => {
                const [row, prop, oldValue, newValue] = change;
                if (this.userPermissionLevel === "viewer" ||  this.userPermissionLevel === undefined) {
                  change[3] = oldValue;
                } 
              })
            });
      
          // Handles saving changes made to the grid by calling onChange and updating changeObj
          // Sends changeObj to Appian local var in changeData param
          this.hotInstance.addHook('afterChange', (changes, [source]) => {
              // call handle change function
              changes?.forEach(change => {
                  const [row, prop, oldValue, newValue] = change;
                  if (newValue != oldValue && this.userPermissionLevel == "editor")
                  {
                      let colIdx = this.hotInstance.propToCol(prop);
                      let cellMeta;
                      if (colIdx != -1) {
                          cellMeta = this.hotInstance.getCellMeta(row, colIdx);
                          this.onChange(cellMeta, newValue);
                          Appian.Component.saveValue("changeData", Object.values(this.changeObj));
                      } else {
                          console.error("Prop not found in column index map");
                      }
                  } 
          
              });
          
          });
          
      } else {
          console.error("Hot Instance null");
      }
  }

}

export default GridComponent;