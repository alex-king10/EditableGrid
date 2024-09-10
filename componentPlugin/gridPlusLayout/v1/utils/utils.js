export function handleValidationMessages_Validator(colConfig, validatorObj) {
    let newStr = "";
    let formattedValMessages = [];
    let validationMessageInput = validatorObj['validationMessage'];
  
    if ('data' in colConfig) {
      newStr = `Error in ${colConfig['data']} validator: `;
    } else {
      newStr = `Error in a columnConfig validator: `;
    }
  
    if (Array.isArray(validationMessageInput)) {
      validationMessageInput?.forEach(message => {
        formattedValMessages.push(newStr + message);
      })
    } else {
      formattedValMessages.push(newStr + validationMessageInput);
    }
  
    return formattedValMessages;
  
  }
  
  export function handleValidationMessages_ColConfig(colConfig) {
    let validationMessageInput = colConfig['validationMessage'];
    let formattedValMessages = [];
    let newStr = "";
    if ('data' in colConfig) {
      newStr = `Error in ${colConfig['data']} columnConfig: `;
    } else {
      newStr = `Error in columnConfig: `;
    }
  
    if (Array.isArray(validationMessageInput)) {
      validationMessageInput?.forEach(valMessage => {
        formattedValMessages.push(newStr + valMessage);
      })
    } else {
      formattedValMessages.push(newStr + validationMessageInput);
    }
  
    return formattedValMessages;
  }