(function(){

    var request = {
            data: {
                links: [],
                rooms: [],
                arrivalDate: booking.env.b_checkin_date,
                departureDate: booking.env.b_checkout_date,
                callback: 'handleData'
            },
            url: 'http://pricealert.f.test.ostrovok.ru/api/v1/pricealert/',
            success: function(data){},
            error: function(data){}
        },
        handleData = function(data){

            console.log('-- handle data', data);

            if ( data.status !== 'OK' ) {
                console.log('room data fail', data);
            }

            var rooms = data.data;

            bookingData.forEach(function(bookingRoom, i){

                rooms.forEach(function(room){

                    room.rooms_data.forEach(function(roomsData){

                        var ostrovokRoom = {},
                            condition = false;

                        for ( var i = 0, l = roomsData.room.value_adds.length; i < l; i++ ) {
                            if ( roomsData.room.value_adds[i].code === 'has_meal' ) {
                                ostrovokRoom.meal = true;
                                return;
                            }
                        }

                        ostrovokRoom.adults = roomsData.adults;
                        ostrovokRoom.price = roomsData.total_rate;
                        ostrovokRoom.ratio = roomsData.ratio;

                        ostrovokRoom.free_cancellation = true;
                        ostrovokRoom.is_postpay = true;

                        // TODO: get cancellation policy
                        // TODO: get is_postpay

                        condition =
                            bookingRoom.adults == ostrovokRoom.adults &&
                            bookingRoom.meal == ostrovokRoom.meal &&
                            bookingRoom.free_cancellation == ostrovokRoom.free_cancellation &&
                            ostrovokRoom.ratio >= 0.8;

                        if ( condition ) {
                            ostrovokData[room.booking_room_id] = {
                                price: ostrovokRoom.price,
                                is_postpay: ostrovokRoom.is_postpay
                            };
                        }

                    });
//                    if ( room.match ) {
//                        // TODO: set price room.booking_room_id
//                        ostrovokData[room.booking_room_id]
//                        //isMatches = true;
//                    }
//                    else {
//                    }
                });

            });

            window.ostrovokData = ostrovokData;
            console.log('ostrovok data', ostrovokData);

        },
//            bookingData = [
//                {
//                    id: 58669,
//                    name: 'ergrtjk',
//                    adults: 2,
//                    free_meal: true,
//                    free_cancellation: true
//                },
//                {
//                    id: 58669,
//                    name: 'ergrtjk',
//                    adults: 2,
//                    free_meal: true,
//                    free_cancellation: true
//                }
//            ],
        bookingData = [],
        ostrovokData = {};

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
            els.policies = els.container.find('.ratepolicy');
            els.adults = els.container.find('.roomDefaultUse img');

            data.name = els.roomName.html();
            data.booking_room_id = els.roomNameWrapper.attr('id');

            data.free_meal = els.policies.filter(':contains("БЕСПЛАТНАЯ отмена бронирования")');
            data.free_cancellation = els.policies.filter(':contains("Завтрак включен")');
            data.adults = parseFloat(els.adults.attr('class').split(' ')[1].replace(/max/, ''));

            if ( data.name && data.booking_room_id ) {
                request.data.rooms.push(data);
                bookingData.push({
                    id: data.booking_room_id,
                    name: data.name,
                    adults: data.adults,
                    free_meal: !!data.free_meal,
                    free_cancellation: !!data.free_cancellation
                });
            }
        });

        //bookingData.rooms = request.data.rooms;


        request.data.links = JSON.stringify(request.data.links);
        request.data.rooms = JSON.stringify(request.data.rooms);

        $('body').append('<script type="text/javascript" src="' + $.param(request.data) + '"></script>');


        //$.ajax({
        //    type: 'GET',
        //    url: request.url,
        //    data: $.param(request.data),
        //    success: request.success,
        //    error: request.error
        //});

        console.log('--- DATA:', request, '\n\n', $.param(request.data));

        window.handleData = handleData;
        window.request = request; // temporary for debug

}());