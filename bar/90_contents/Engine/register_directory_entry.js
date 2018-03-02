function(request){
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

    var getUrlInfo = function(request) {
        var baseUrl = request.headers['x-baseurl'];
        var forwardedPath = request.headers['x-forwarded-path'];
        var cellName = forwardedPath.split('/').splice(1)[0];
        var boxName = forwardedPath.split('/').splice(1)[1];
        var urlInfo = {
            cellUrl: baseUrl + cellName + '/',
            cellName: cellName,
            boxName: boxName
        };

        return urlInfo;
    }
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

    var registerDirectoryEntry = function(urlInfo, entryData) {
        var authInfo = {
            cellUrl: urlInfo.cellUrl,
            userId: appAccountName,
            password: appAccountPassword
        };
        var appCell = _p.as(authInfo).cell();
        var entity = appCell.box(urlInfo.boxName).odata(appODataName).entitySet(appEntitySetName);

        return entity.create(entryData);
    }

    // "x-request-uri": "https://demo.personium.io/directory/app-uc-directory/Engine/registerDirectoryEntry2"
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
    var urlInfo = getUrlInfo(request);

    // Hack Ver
    var dcx = {sports: {HTTP: {}}};
    var __a = new Packages.io.personium.client.PersoniumContext(pjvm.getBaseUrl(), pjvm.getCellName(), pjvm.getBoxSchema(), pjvm.getBoxName()).withToken(null);
    dcx.sports.HTTP._ra = Packages.io.personium.client.http.RestAdapterFactory.create(__a);
    var formatRes = function(dcr) {
        var resp = {body: "" + dcr.bodyAsString(), status: dcr.getStatusCode(), headers: {}};
        return resp;
    }

    // get
    dcx.sports.HTTP.get = function(url, headers) {
      if (!headers) {
        headers = {"Accept": "text/plain"};
      }
      var dcr = dcx.sports.HTTP._ra.get(url, _p.util.obj2javaJson(headers), null);
      return formatRes(dcr);
    };
    // post 
    dcx.sports.HTTP.post = function(url, body, contentType, headers) {
        if (!headers) {
            headers = {"Accept": "text/plain"};
        }
        var dcr = dcx.sports.HTTP._ra.post(url, _p.util.obj2javaJson(headers), body, contentType);
        return formatRes(dcr);
    };

    // Get profile
    var apiRes = dcx.sports.HTTP.get(params.url+"__/profile.json", {'Accept':'application/json'});
    if (apiRes === null || apiRes.status !== 200) {
        return {
            status : apiRes.status,
            headers : {"Content-Type":"application/json"},
            body : ['{"error": {"status":' + apiRes.status + ', "message": "API call failed."}}']
        };
    }
    var profileJson = JSON.parse(apiRes.body);
    var entryData = convertProfile2EntityType(params.url, profileJson);
    var newEntryData;

    try {
        newEntryData = registerDirectoryEntry(urlInfo, entryData);
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
