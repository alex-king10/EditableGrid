class GridComponent {

    // init grid component instance
    constructor(containerId, data, columnConfigs, gridOptions, changeObj, userPermissionLevel, editablePKFieldList) {
        this.containerId = containerId;
        this.data = data;
        this.columnConfigs = columnConfigs;
        this.gridOptions = gridOptions;
        this.changeObj = changeObj;
        this.userPermissionLevel = userPermissionLevel;
        this.editablePKFieldList = editablePKFieldList;
        this.hotInstance = null;
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

        this.hotInstance.updateSettings(this.gridOptions);
    }

    setEditablePKFieldList() {

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

    setGridOptions(gridOptions) {
        this.gridOptions = gridOptions;
        this.hotInstance.updateSettings(this.gridOptions);
    }

    // not sure if this function logic should go here?
    updateData(changeObj) {
        let currRowIdx;
        let currChangeItem;

        if (this.data != null && this.data.length != 0) {
            if (Object.keys(changeObj).length == 0) {
                // no updates to make to data var
                return this.data;
            } else {
                for (let i = 0; i < Object.keys(changeObj).length; i++) {
                    currsRowIdx = Object.keys(changeObj)[i];
                    currChangeItem = Object.values(changeObj)[i];
                    // update row in data var with value from changeObj
                    this.data[currRowIdx] = Object.assign(dataMap[currRowIdx], currChangeItem);
                }
            }
        }
    }

    setGridOptions(gridOptions) {
        this.hotInstance.updateSettings(gridOptions);
    }

    getGridOptions() {
        return this.gridOptions;
    }

    // Handles changes made to the grid by modifying this.changeObj
    // Called by addListeners in 'afterChange' hook
    onChange(primaryKeyFieldList, cellMeta, newValue) {
        console.log("on change");
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
                if (primaryKeyFieldList.length != 0) {
                    primaryKeyFieldList.forEach(pkField => {
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
                  
                  if (this.userPermissionLevel == "viewer") {
                    change[3] = oldValue;
                  } 
                })
              });
        
            // Handles saving changes made to the grid by calling onChange and updating changeObj
            // Sends changeObj to Appian local var in changeData param
            this.hotInstance.addHook('afterChange', (changes, [source]) => {
                console.log('changes');
                console.log(changes);
                // call handle change function
                changes?.forEach(change => {
                    const [row, prop, oldValue, newValue] = change;
            
                    if (newValue != oldValue && this.userPermissionLevel == "editor")
                    {
                        let colIdx = this.hotInstance.propToCol(prop);
                        let cellMeta;
                        if (colIdx != -1) {
                            cellMeta = this.hotInstance.getCellMeta(row, colIdx);
                            this.onChange(this.editablePKFieldList, cellMeta, newValue);
                            // TO DO: add this back later
                            // Appian.Component.saveValue("changeData", Object.values(this.changeObj));
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