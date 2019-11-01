function(request){
    var getProfile = function(query){
        var cellUrl = query.url;
        var httpClient = new _p.extension.HttpClient();
        var httpCode, response;

        // Get profile
        
        var urlProfile = query.locale ?  cellUrl + "__/locales/" + query.locale + "/profile.json" : cellUrl + "__/profile.json";
        var headers = {'Accept':'application/json'};
        response = httpClient.get(urlProfile, headers);

        httpCode = parseInt(response.status);
        // Get API usually returns HTTP code 200
        if (httpCode !== 200) {
            // Personium exception
            var err = [
                "io.personium.client.DaoException: ",
                httpCode,
                ",",
                response.body
            ].join("");
            throw new _p.PersoniumException(err);
        }
        return JSON.parse(response.body);
    }
    var convertProfile2EntityType = function(query, profileInfo){
        var cellUrl = query.url;
        var entryData = {
            cellType: profileInfo.CellType,
            url: cellUrl,
            alternateName: profileInfo.DisplayName,
            description: profileInfo.Description,
            locale: query.locale
        };
        
        return entryData;
    }
    var registerDirectoryEntry = function(entryData) {
        var APP_CELL_ADMIN_INFO = {
            cellUrl: appCellUrl,
            userId: appAccountName,
            password: appAccountPassword 
        };
        
        var entity;
        if (appAccountName !== "***" && appAccountPassword !== "***") {
            // 
            entity = _p.as(APP_CELL_ADMIN_INFO).cell().box("app-uc-directory").odata(appODataName).entitySet(appEntitySetName);
        } else {
            // Expected a valid token from the request
            entity = box.odata(appODataName).entitySet(appEntitySetName);
        }

        return entity.create(entryData);
    }
    
    try {
        personium.validateRequestMethod(["GET", "POST", "PUT"], request);
        var results = null;
        
        switch(request.method) {
            case "POST":
            var query = personium.parseBodyAsQuery(request);
            var profileJson = getProfile(query);
            var entryData = convertProfile2EntityType(query, profileJson);
            var newEntryData = registerDirectoryEntry(entryData);
            results = newEntryData;
            break;
        }
        
        
        return personium.createResponse(200, results);
    } catch(e) {
        return personium.createErrorResponse(e);
    }
}

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

var box = _p.localbox();
var appCellUrl = box.schema; // schema URL
var appODataName = 'OData';
var appEntitySetName = 'directory';

/*
 * In order to use helpful functions, you need to "require" the library.
 */
var _ = require("underscore")._;
var accInfo = {};//require("acc_info").accInfo;
var personium = require("personium").personium;
