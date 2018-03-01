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
