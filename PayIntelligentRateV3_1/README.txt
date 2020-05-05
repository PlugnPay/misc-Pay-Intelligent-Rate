Getting Started:

Open index.html to view the sample page

------------------------------------------------------

File list:

index.html - This is the base page. Any custom JavaScript should only be added between the <!-- merchant Custom Code --> <!-- End merchant Custom Code --> comments. No other parts of the page should be modified. 
	*Note that you technically *can* modify the JavaScript in the <!-- Custom Code --> section if you wish to do a complete re-design.  However if you modify parts other than the  <!-- merchant Custom Code --> section, you won't get any updates that we roll out to those sections. Also if you do this, please let us know so that we can insert your code accordingly.


_css:

payscreens.css - this contains the main CSS for the page. Any CSS changes you need to make should be done here.

jquery-ui-1.10.3.custom.css - jquery ui css - should not be modified


_js:

pay.js - Most of the JavaScript that controls the page is in this. It should not be modified but it's functions can be called in your code. 

Input.js - Contains functions to modify inputs. Should not be modified but it's functions can be called in your code.

autoswipe.js - Contains code for swipe transactions. Should not be modified. 

DataValidation.js - Contains data validating code. Should not be modified. 

Pack.js - Should not be modified

jquery-1.10.2.min.js - jquery version 1.10.2  - Should not be modified.

jquery-ui.js - jquery ui plugin - Should not be modified.


_json:

data.json - Controls what fields are displayed, text for field labels, required fields, country information etc. This file would normally be loaded from our server and would contain information specific to the account. This sample contains the default settings for an account. 



-------------------------------------------------------------

Working with this code:

Most of the look and feel of the page can be changed by editing the payscreens.css file. It is recommended that you start there and only add custom JavaScript if necessary. 

The goal is to customize the look and feel of the page without *directly* modifying the HTML. The HTML can only be modified via JavaScript in the <!--Custom Code --> section of the page. 

You may wish to modify the data.json file to see how the page looks with different fields enabled / disabled etc. When adding any custom code you must keep in mind that the pages are changed dynamically based on the information in this file.



