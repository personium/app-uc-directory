# How to deploy  
1. Log on to the target App Cell from Cell Manager.  
1. Install the BAR file (app-uc-directory.bar) to the target App Cell.  
1. Create an App account and assign DirectoryOwner role to it.  
1. Download and reflect the account information to register_directory_entry.js  

        /*
         * Replace the "***" with a valid App account name that have permission 
         * to write information to the installed Box.
         */
        var appAccountName = '***';

        /*
         * Replace the "***" with a valid App account password that have permission 
         * to write information to the installed Box.
         */
        var appAccountPassword = '***';

# How to use it  
Send a RESTful API to register an entry to the directory (OData).
You just need to specify an existing Cell URL and the engine service will look up the Cell's profile and register the following properties to the directory.  

- Cell type (cellType)  
- Displayed name ([alternateName](http://schema.org/alternateName))  
- Description ([description](http://schema.org/description))  

By default, anyone can register to and read from the directory. However, you can modify the ACL of the engine service to limit user's access.  

## Restlet Client Example  
1. Install Restlet Client to Chrome.  
1. Import the [Restlet Client scenario](resources/RestletClientScenarios/demo-directory-API.json).  
1. Modify variables according to your environment.  
1. Register an existing Cell URL.  
