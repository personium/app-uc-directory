function(request){
    /*
     * Replace the "***" with your App Cell URL.
     * Example: "https://directory.demo.personium.io/"
     */
    var appCellUrl = '***';
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

    var appODataName = 'OData';
    var appEntitySetName = 'directory';

    var convertProfile2EntityType = function(cellUrl, profileInfo){
        var entryData = {
            cellType: profileInfo.CellType,
            url: cellUrl,
            alternateName: profileInfo.DisplayName,
            description: profileInfo.Description
        };
        entryData.__id = entryData.url; // default is just Cell URL
        if (entryData.locale) {
            entryData.__id += '_' + entryData.locale;
        }

        return entryData;
    }

    var registerDirectoryEntry = function(entryData) {
        var APP_CELL_ADMIN_INFO = {
            cellUrl: appCellUrl,
            userId: appAccountName,
            password: appAccountPassword 
        };
        var entity = _p.as(APP_CELL_ADMIN_INFO).cell().box("app-uc-directory").odata(appODataName).entitySet(appEntitySetName);

        return entity.create(entryData);
    }

    var bodyAsString = request["input"].readAll();
    if (bodyAsString === "") {
      return {
             status : 400,
             headers : {"Content-Type":"application/json"},
             body : [JSON.stringify({
                'error': 'Request body is empty.'
             })]
      };
    }
    var params = _p.util.queryParse(bodyAsString);
    var httpClient = new _p.extension.HttpClient();
    var httpCode, response;

    // Get profile
    try {
        var url = params.url+"__/profile.json";
        var headers = {'Accept':'application/json'};
        response = httpClient.get(url, headers);
    } catch (e) {
        // System exception
        return createResponse(500, e);
    }
    httpCode = parseInt(response.status);
    // Get API usually returns HTTP code 200
    if (httpCode !== 200) {
        // Personium exception
        return createResponse(httpCode, response.body);
    }
    var profileJson = JSON.parse(response.body);
    var entryData = convertProfile2EntityType(params.url, profileJson);
    var newEntryData;

    try {
        newEntryData = registerDirectoryEntry(entryData);
    } catch(ex) {
        return {
            status : ex.code,
            headers : {"Content-Type":"application/json"},
            body : [JSON.stringify(ex)]
        };
    }

    return {
        status : 200,
        headers : {"Content-Type":"application/json"},
        body : [JSON.stringify(newEntryData)]
    };
}

function createResponse(tempCode, tempBody) {
    var isString = typeof tempBody == "string";
    var tempHeaders = isString ? {"Content-Type":"text/plain"} : {"Content-Type":"application/json"};
    return {
        status: tempCode,
        headers: tempHeaders,
        body: [isString ? tempBody : JSON.stringify(tempBody)]
    };
};