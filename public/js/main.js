document.addEventListener('DOMContentLoaded', function () {
    // Attempt to fetch processed receipt data from a '/receipts/data' endpoint via an AJAX GET request
    fetch('/receipts/data')
        .then(response => response.json())
        .then(data => {
            if (data && Array.isArray(data)) {
                generateTable(data);
            } else {
                console.error('Failed to load receipt data.');
            }
        })
        .catch(error => {
            console.error('Error fetching receipt data:', error);
        });

        function sendDataUpdate(data, index, key, value) {
            const receiptId = data[index]._id; // Assuming each item in 'data' contains an '_id' property
            const updatePayload = { [key]: value }; // Update payload as an object with key-value pairs
        
            fetch(`/receipts/update/${receiptId}`, {
                method: 'PUT', // Changed to PUT as it's more suitable for updates
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload)
            })
            .then(response => response.json())
            .then(updatedReceipt => {
                console.log('Update response:', updatedReceipt);
                // Optionally, update local data to reflect the change
                data[index][key] = value;
            })
            .catch(error => {
                console.error('Error updating data:', error);
            });
        }
        
        function sendDataDelete(data, index) {
            const receiptId = data[index]._id; // Assuming each item in 'data' contains an '_id' property
        
            fetch(`/receipts/delete/${receiptId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(result => {
                console.log('Delete response:', result);
                // Remove the deleted item from the local data array
                data.splice(index, 1);
                // Regenerate the table with the updated data
                generateTable(data);
            })
            .catch(error => {
                console.error('Error deleting data:', error);
            });
        }
        
        
    

    
    function generateTable(data) {
        const table = document.createElement('table');
        table.className = 'table';
        const thead = table.createTHead();
        const tbody = table.createTBody();
        const headRow = thead.insertRow();
        ['Line#', 'File', 'Date', 'Subject', 'Category', 'Total', 'Actions'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headRow.appendChild(th);
        });
    
        const categories = ["Contract Labor", "Commissions and Fees", "Repairs and Maintenance", "Supplies", "Advertising", "Office Expense", "Utilities", "Equipment Rent", "Other Rent", "Mortgage Interest", "Business Travel"]; // Categories for the combobox
    
        data.forEach((row, index) => {
            const tr = tbody.insertRow();
            const keys = ['lineNumber', 'filename', 'date', 'subject', 'category', 'total']; // key mapping for data fields
            const rowData = [
                index + 1, // Line numbers should start at 1, not 0
                row.filename,
                row.date,
                row.subject,
                row.category,
                row.total
            ];
    
            rowData.forEach((text, cellIndex) => {
                const td = tr.insertCell();
                if (cellIndex === 0 || cellIndex === 1) { // Line Number and File Name, non-editable
                    if (cellIndex === 1) {
                        const a = document.createElement('a');
                        a.href = "#";
                        a.textContent = text.substring(text.indexOf("-") + 1);
                        a.onclick = function () {
                            showModal(row.filename);
                        };
                        td.appendChild(a);
                    } else {
                        td.textContent = text;
                    }
                } else if (cellIndex === 4) { // Category field, use select dropdown
                    const select = document.createElement('select');
                    select.disabled = true; // Initially disabled
                    select.className = 'editable';
    
                    // Populate select element with options
                    categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category;
                        option.textContent = category;
                        option.selected = category === text;
                        select.appendChild(option);
                    });
    
                    td.appendChild(select);
                } else { // Other editable fields, use input
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = text;
                    input.disabled = true; // Initially disabled
                    input.className = 'editable';
                    td.appendChild(input);
                }
            });
    
            // Add an "Edit" button and "Delete" button in the last cell
            const actionsTd = tr.insertCell();
            actionsTd.style.whiteSpace = 'nowrap'; // Prevent wrapping
            
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.style.marginRight = '5px'; // Add some space between buttons
            editButton.onclick = function() {
                // Toggle edit/save
                const editables = tr.querySelectorAll('.editable');
                if (editButton.textContent === 'Edit') {
                    // Enable editing
                    editables.forEach(element => element.disabled = false);
                    editButton.textContent = 'Save';
                } else {
                    // Save changes
                    editables.forEach((element, i) => {
                        const key = keys[i+2]; // Adjust index to skip Line# and File
                        const newValue = element.tagName === 'SELECT' ? element.value : element.value; // Get new value from input or select
                        row[key] = newValue; // Update data object with new input values
                        sendDataUpdate(data, index, key, newValue);
                    });
                    editables.forEach(element => element.disabled = true);
                    editButton.textContent = 'Edit';
                }
            };
            actionsTd.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function() {
                if (confirm('Are you sure you want to delete this record?')) {
                    sendDataDelete(data, index);
                }
            };
            actionsTd.appendChild(deleteButton);
        });
    
        const dataDisplay = document.getElementById('data-display');
        if (dataDisplay) {
            dataDisplay.innerHTML = '';
            dataDisplay.appendChild(table);
        } else {
            console.error('Data display element not found.');
        }
    
        // Add modal div to body
        const modal = document.createElement('div');
        modal.style.display = 'none'; // Hide modal by default
        modal.style.position = 'fixed'; // Fixed position to stay in place during scroll
        modal.style.zIndex = '1'; // Sit on top of other content
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%'; // Full width
        modal.style.height = '100%'; // Full height
        modal.style.overflow = 'auto'; // Enable scroll if needed
        modal.style.backgroundColor = 'rgba(0,0,0,0.4)'; // Black background with opacity
    
        const modalContent = document.createElement('img'); // Use an <img> element to display the image
        modalContent.style.margin = 'auto';
        modalContent.style.display = 'block';
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '700px'; // Limit maximum size to 700px
    
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    
        function showModal(imagePath) {
            modalContent.src = '/uploads/' + imagePath; // Set the source of the image
            modal.style.display = 'block'; // Show the modal
    
            modal.onclick = function () {
                modal.style.display = 'none';
            };
        }
    } 


    function convertToCSV(objArray) {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = `${Object.keys(array[0]).map(value => `"${value}"`).join(",")}\r\n`;

        return array.reduce((str, next) => {
            str += `${Object.values(next).map(value => `"${value}"`).join(",")}\r\n`;
            return str;
        }, str);
    }

    function exportCSVFile(items, fileTitle) {
        const jsonObject = JSON.stringify(items);
        const csv = convertToCSV(jsonObject);
        const exportedFilenmae = fileTitle + '.csv' || 'export.csv';

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, exportedFilenmae);
        } else {
            const link = document.createElement("a");
            if (link.download !== undefined) { // feature detection for download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilenmae);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
            fetch('/receipts/data')
                .then(response => response.json())
                .then(data => {
                    if (data && Array.isArray(data)) {
                        exportCSVFile(data, 'receipt_data'); // Trigger CSV export with data
                    } else {
                        console.error('Failed to load receipt data for export.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching receipt data for export:', error);
                });
        });
    } else {
        console.error('Export button not found.');
    }
});