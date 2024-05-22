
// formats JS Objects correctly in text editor. Does not save correctly yet
export class CustomObjectEditor extends Handsontable.editors.TextEditor {
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
    // hotGrid.setDataAtCell(this.row, this.col, newValue);
  }

  // finishEditing(restoreOriginalValue, ctrlDown, callback) {
  //   super.finishEditing(restoreOriginalValue, ctrlDown, callback);
  // }
}
