
export function safeHtmlRenderer(instance, td, row, col, prop, value, cellProperties) {
    // WARNING: Be sure you only allow certain HTML tags to avoid XSS threats.
    // Sanitize the "value" before passing it to the innerHTML property.
    td.innerHTML = value;
}

export function coverRenderer(instance, td, row, col, prop, value, cellProperties) {
  // console.log([instance, td, row, col, prop, value, cellProperties]);
  const img = document.createElement('img');

  img.src = value;

  img.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });

  td.innerText = '';
  td.appendChild(img);

  return td;
}

export function fileRenderer(instance, td, row, col, prop, value, cellProperties) {
  console.log([instance, td, row, col, prop, value, cellProperties]);
  const fileViewer = document.createElement('div');
  fileViewer.classList.add('file-viewer'); // Optional: Add a class for styling
  
  // Assuming value contains the file URL
  const fileUrl = value;

  fileViewer.innerText = 'Click to view file'; // Placeholder text for file viewer
  
  fileViewer.addEventListener('click', () => {
    // Replace this with your file viewer logic
    // For example, open a modal or display the file content in a different way
    alert('Opening file viewer for: ' + fileUrl);
  });

  td.innerText = '';
  td.appendChild(fileViewer);

  return td;
}

const addClassWhenNeeded = (td, cellProperties) => {
  const className = cellProperties.className;

  if (className !== void 0) {
    Handsontable.dom.addClass(td, className);
  }
};

export function progressBarRenderer(
  instance,
  td,
  row,
  column,
  prop,
  value,
  cellProperties
) {
  const div = document.createElement("div");

  div.style.width = `${value * 10}px`;

  addClassWhenNeeded(td, cellProperties);
  Handsontable.dom.addClass(div, "progressBar");
  Handsontable.dom.empty(td);

  td.appendChild(div);
}
  

export function userRenderer(instance, td, row, col, prop, value, cellProperties) {
  // console.log([instance, td, row, col, prop, value, cellProperties]);
  console.log(value);

  var userID;

  try {
    // var jsonObject = JSON.parse(value);
    
    if ('id' in value) {
      userID = value.id;
    } else {
      userID = JSON.stringify(value);
    }
  } catch (error) { console.error(error); }

  const text = document.createTextNode(userID);
  // const text = document.createTextNode(JSON.stringify(value));
  // console.log(text);
  td.innerText = '';
  td.appendChild(text);
  td.classList.add('cellStyle-appianObject'); // Add the custom CSS class here

  return td;
  
}

export function dropdownRenderer(instance, td, row, col, prop, value, cellProperties) {
  // console.log([instance, td, row, col, prop, value, cellProperties]);

  let choiceLabels = cellProperties.choiceLabels;
  let choiceValues = cellProperties.choiceValues;
  let stringValue = JSON.stringify(value);
  let text = stringValue;
  

  if (Array.isArray(choiceLabels) && Array.isArray(choiceValues) && choiceLabels.length === choiceValues.length) {
    try {
        for (let i = 0; i < choiceValues.length; i++)
        {
          // console.log(choiceValues[i]);
          if (String(choiceValues[i]) == stringValue)
          {
            text = choiceLabels[i];
            break;
          }
        }
      
    } catch (error) {
      console.error(error);
    }
  } else {
    console.error("Choice Labels and Choice Values must be assigned to arrays of the same length.");
  }

  let textNode = document.createTextNode(text);

  td.innerText = ''; // Clear any existing content in the cell
  td.appendChild(textNode); // Append the text node to the cell
  td.classList.add('cellStyle-appianObject'); // Add the custom CSS class here

  return td;
}

// Receives a Date object and returns a formattedDate string
function getFormattedDate(date) {
  // Get the date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getUTCDate()).padStart(2, '0'); // Use getUTCDate() for UTC date

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;

}

function getFormattedTime(date) {
   // Get the time components
   const hours = String(date.getUTCHours()).padStart(2, '0');
   const minutes = String(date.getUTCMinutes()).padStart(2, '0');
   const seconds = String(date.getUTCSeconds()).padStart(2, '0');

   const formattedTime = `${hours}:${minutes}:${seconds}`;

   return formattedTime;


}

function getFormattedTimeAndDate(date) {
  let options = {
    weekday: 'long', // Full weekday name (e.g., "Monday")
    year: 'numeric', // Full year (e.g., "2022")
    month: 'long', // Full month name (e.g., "January")
    day: 'numeric', // Day of the month (e.g., "1")
    hour: 'numeric', // Hour (e.g., "12")
    minute: 'numeric', // Minute (e.g., "30")
    second: 'numeric', // Second (e.g., "45")
    timeZoneName: 'short' // Short timezone name (e.g., "PST")
  };
  
  // Convert the Date object to a string in the local timezone with specified options
  let localDateStringWithOptions = date.toLocaleString(undefined, options);
  
  console.log(localDateStringWithOptions);

  return localDateStringWithOptions;
}

export function timeAndDateRenderer(instance, td, row, col, prop, value, cellProperties) {

  // Check if the value is not empty and is in the expected format
  if (value && typeof value === 'string' && value.includes('T') && value.includes('Z')) {
    // Parse the original datetime string
    const originalDate = new Date(value);

    console.log("Date and Time");
    const dateTime = getFormattedTimeAndDate(originalDate);
    // Format the date and time components
    const formattedDate = getFormattedDate(originalDate);
    const formattedTime = getFormattedTime(originalDate);

    // Combine the formatted date and time
    const formattedDateTime = `${formattedDate} ${formattedTime}`;

    let textNode = document.createTextNode(formattedDateTime);
    td.innerText = ''; 
    td.appendChild(textNode); 
    td.classList.add('cellStyle-appianObject');

    // Return the cell element after rendering the date and time components
    return td;
  }

  // If the value is empty or not in the expected format, render as text
  Handsontable.renderers.TextRenderer(instance, td, row, col, prop, value, cellProperties);

  return td;
}

export function customDateRenderer(instance, td, row, col, prop, value, cellProperties) {
  let text = value;
  if (text && typeof text === 'string' && text.includes('Z')) {

    // Parse the modified datetime string
    const originalDate = new Date(text);

    const formattedDate = getFormattedDate(originalDate);

    const dateElement = document.createTextNode(formattedDate);
    td.innerText = '';
    td.classList.add('cellStyle-appianObject');
    td.appendChild(dateElement);

    return td;
  }
}

export function longTextRenderer(instance, td, row, col, prop, value, cellProperties) {
  const text = document.createTextNode(value);
  // console.log(text);
  td.innerText = '';
  td.appendChild(text);
  td.classList.add('.cellStyle-longText'); // Add the custom CSS class here

  return td;
  
}