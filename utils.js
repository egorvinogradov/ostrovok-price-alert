var $ = function(selector, parent){

    var context = parent || document,
        res = context.querySelectorAll(selector);

    return res.length === 1
        ? res[0]
        : res;
};
create = function(tag, attributes){

    var el = document.createElement(tag);

    for ( var prop in attributes ) {
        el[prop] = attributes[prop];
    }
    return el;
},
log = function(){

    var res = [];

    for ( var i = 0, l = arguments.length; i < l; i++ ) {

        var e = arguments[i];

        if ( typeof e === 'array' ) {
            res.push(e.toString());
        }
        else {
            if ( e instanceof Object ) {
                res.push(JSON.stringify(e));
            }
            else {
                if ( typeof e === 'string' ) {
                    res.push('\"' + e + '\"');
                }
                else {
                    res.push(e);
                }
            }
        }
    }

    $('#log').appendChild(create('div', {
        className: 'log_item',
        innerHTML: res.join('\n')
    }));
};