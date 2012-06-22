(function(){

    var request = {
            data: {
                links: [],
                rooms: [],
                arrivalDate: booking.env.b_checkin_date,
                departureDate: booking.env.b_checkout_date
            },
            url: 'http://ostrovok.ru/api/v1/pricealert',
            success: function(data){},
            error: function(data){}
        };

    $('link[rel="alternate"]').each(function(i, e){

        var element = $(e),
            url = element.attr('href').split('?')[0];
        request.data.links.push(url);
    });


    $('[class^="room_loop_counter"]').not('.extendedRow').each(function(i, element){

        var data = {},
            els = {
                container: $(element)
            };

        els.roomName = els.container.find('.togglelink');
        els.roomNameWrapper = els.roomName.parent();

        data.name = els.roomName.html();
        data.booking_room_id = els.roomNameWrapper.attr('id');

        if ( data.name && data.booking_room_id ) {
            request.data.rooms.push(data);
        }
    });


    request.data.links = JSON.stringify(request.data.links);
    request.data.rooms = JSON.stringify(request.data.rooms);


    //$.ajax({
    //    type: 'GET',
    //    url: request.url,
    //    data: $.param(request.data),
    //    success: request.success,
    //    error: request.error
    //});

    console.log('--- DATA:', request, '\n\n', $.param(request.data));

    window.request = request // temporary for debug

}());

