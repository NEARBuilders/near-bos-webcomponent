export function web4_get() {
    const request = JSON.parse(env.input()).request;

    let response;
    const pathParts = request.path.split('/');
    let path = pathParts[pathParts.length - 1];
    let dotparts = path.split('.');
    const extension = dotparts[dotparts.length - 1];

    let contentType;
    switch (extension) {
        case 'js':
            contentType = "application/javascript; charset=UTF-8";
            break;
        case 'html':
            contentType = "text/html; charset=UTF-8";
            break;
        default:
            contentType = "text/html; charset=UTF-8";
            path = 'index.html';
    }
    response = {
        contentType,
        bodyUrl: 'https://ipfs.web4.near.page/ipfs/bafybeiawxvie7ei7fsnd5bh3qn6u45kwvz4dxw2zojspjubh4nivqyfl2y/' + path
    };
    env.value_return(JSON.stringify(response));
}
