(function(){

    var PriceAlert = {
        request: {
            data: {
                arrivalDate: booking.env.b_checkin_date,
                departureDate: booking.env.b_checkout_date,
                callback: 'handleData'
            },
            url: 'http://pricealert.f.test.ostrovok.ru/api/v1/pricealert/',
            loadCount: 0
        },
        bookingData: [],
        ostrovokData: {},

        init: function(){

            var bookingRooms = this.getBookingRooms(),
                bookingLinks = this.getBookingLinks(),
                requestUrl = this.getRequestUrl({
                    links: bookingLinks,
                    rooms: bookingRooms.requestParams
                });

            this.bookingData = bookingRooms.roomData;
            this.loadOstrovokRooms(requestUrl);

        },
        getBookingRooms: function(){

            var elements = $('[class^="room_loop_counter"]').not('.extendedRow').eq(4),
                requestParams = [],
                roomData = [];

            elements.each(function(i, element){

                var room = {},
                    els = {};

                els.container = $(element);
                els.name =      els.container.find('.togglelink');
                els.wrapper =   els.name.parent();
                els.policies =  els.container.find('.ratepolicy');
                els.adults =    els.container.find('.roomDefaultUse img');

                room.name =             els.name.html();
                room.id =               els.wrapper.attr('id');
                room.freeMeal =         !!els.policies.filter(':contains("Завтрак включен")');
                room.freeCancellation = !!els.policies.filter(':contains("БЕСПЛАТНАЯ отмена бронирования")');
                room.adults =           +els.adults.attr('class').split(' ')[1].replace(/max/, '');

                if ( room.name && room.id ) {
                    roomData.push(room);
                    requestParams.push({
                        name: room.name,
                        booking_room_id: room.id
                    });
                }
            });

            return {
                requestParams: requestParams,
                roomData: roomData
            };

        },
        getBookingLinks: function(){

            var elements = $('link[rel="alternate"]').filter('[hreflang="en"]'),
                links = [];

            elements.each(function(i, element){
                var url = $(element).attr('href').split('?')[0];
                //var url = $(element).attr('href').split('?')[0].replace(/\.en\./, '.ru.');
                links.push(url);
            });

            return links;

        },
        getRequestUrl: function(options){

            var request = {
                    arrivalDate:    this.request.data.arrivalDate,
                    departureDate:  this.request.data.departureDate,
                    callback:       this.request.data.callback,
                    links:          JSON.stringify(options.links),
                    rooms:          JSON.stringify(options.rooms)
                };

            return this.request.url + '?' + $.param(request);

        },
        loadOstrovokRooms: function(url){

            var MOCK = 'http://pricealert.f.test.ostrovok.ru/api/v1/pricealert/?arrivalDate=2012-06-25&departureDate=2012-06-27&links=[%22/hotel/ru/metropol-moscow.html%22]&rooms=[{%22booking_room_id%22:4366801,%22name%22:%22%D0%9F%D1%80%D0%B5%D0%B4%D1%81%D1%82%D0%B0%D0%B2%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BB%D1%8E%D0%BA%D1%81%22}]&callback=handleData'

            url = MOCK;

            var script = document.createElement('script'),
                check = function(event){
                    if ( event.type !== 'load' && this.loadCount < 10 ) {
                        console.log('Load error:', event);
                        this.loadOstrovokRooms(url);
                    }
                    else {
                        console.log('Load complete:', event);
                    }
                };

            script.src = url;
            script.onload = script.onerror = $.proxy(check, this);
            document.body.appendChild(script);
            this.request.loadCount += 1;

        },
        handleData: function(data){

            var rooms = data.data;

            if ( data.status !== 'OK' && !rooms ) {
                console.log('No rooms found', data);
                return;
            }

            console.log('booking data 2', this.bookingData.slice(), rooms);

            this.bookingData.forEach(function(bookingRoom){

                rooms.forEach(function(room){

                    room.rooms_data.forEach(function(roomData){

                        var areRoomsEqual,
                            ostrovokRoom = {
                                name:               roomData.name,
                                price:              roomData.total_rate,
                                ratio:              roomData.ratio,
                                adults:             roomData.adults,
                                freeCancellation:   true,       // TODO: get cancellation policy
                                isPostPay:          true        // TODO: get payment policy
                            };

                        for ( var i = 0, l = roomData.room.value_adds.length; i < l; i++ ) {
                            if ( roomData.room.value_adds[i].code === 'has_meal' ) {
                                ostrovokRoom.freeMeal = true;
                                return;
                            }
                        }

                        areRoomsEqual =
                            ostrovokRoom.adults             == bookingRoom.adults &&
                            ostrovokRoom.freeMeal           == bookingRoom.freeMeal &&
                            ostrovokRoom.freeCancellation   == bookingRoom.freeCancellation &&
                            ostrovokRoom.ratio >= 0.8;

                        if ( areRoomsEqual ) {
                            this.ostrovokData[room.booking_room_id] = ostrovokRoom;
                        }
                    });
                });
            });

            this.renderOstrovokRooms(this.ostrovokData);

        },
        renderOstrovokRooms: function(rooms){


            console.log('render ostrovok rooms', rooms);


        }


        
    };

    window.PriceAlert = PriceAlert; // for debug
    window.handleData = $.proxy(PriceAlert.handleData, PriceAlert);
    PriceAlert.init();

















//    var request = {
//            data: {
//                links: [],
//                rooms: [],
//                arrivalDate: booking.env.b_checkin_date,
//                departureDate: booking.env.b_checkout_date,
//                callback: 'handleData'
//            },
//            url: 'http://pricealert.f.test.ostrovok.ru/api/v1/pricealert/'
//        },
//        handleData = function(data){
//
//
//
//        },
//    //            bookingData = [
//    //                {
//    //                    id: 58669,
//    //                    name: 'ergrtjk',
//    //                    adults: 2,
//    //                    free_meal: true,
//    //                    free_cancellation: true
//    //                },
//    //                {
//    //                    id: 58669,
//    //                    name: 'ergrtjk',
//    //                    adults: 2,
//    //                    free_meal: true,
//    //                    free_cancellation: true
//    //                }
//    //            ],
//        bookingData = [],
//        ostrovokData = {};
//
////        $('link[rel="alternate"]').each(function(i, e){
////
////            var element = $(e),
////                url = element.attr('href').split('?')[0];
////            request.data.links.push(url);
////        });
//
//
//
//    var MOCK = 'http://pricealert.f.test.ostrovok.ru/api/v1/pricealert/?arrivalDate=2012-06-25&departureDate=2012-06-27&links=[%22/hotel/ru/metropol-moscow.html%22]&rooms=[{%22booking_room_id%22:4366801,%22name%22:%22%D0%9F%D1%80%D0%B5%D0%B4%D1%81%D1%82%D0%B0%D0%B2%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BB%D1%8E%D0%BA%D1%81%22}]&callback=handleData'
//
//
//
//    request.data.links.push($('link[rel="alternate"]').filter('[hreflang="en"]').attr('href').split('?')[0].replace(/\.en\./, '.ru.'));
//
//
//
//
//    //bookingData.rooms = request.data.rooms;
//
//
//    console.log('DATA1', request);
//    window.request1 = request;
//
//
//    request.data.links = JSON.stringify(request.data.links);
//    request.data.rooms = JSON.stringify(request.data.rooms);
//
//    window.lllink = request.url + '?' + $.param(request.data);
//
//    //$('body').append('<' + 'script type="text/javascript" src="' + request.url + '?' + $.param(request.data) + '"><' + '/script>');
//
//
//
//    //window.script = $('<' + 'script type="text/javascript" src="' + MOCK + '"><' + '/script>');
//
//
//
//
//
//
//    utils.load(MOCK);
//
//    //$('body').append('<' + 'script type="text/javascript" src="' + MOCK + '"><' + '/script>');
//
//    console.log('--- DATA:', request, '\n\n', $.param(request.data));
//
//
//    window.handleData = handleData; // temporary for debug
//    window.request = request; // temporary for debug
//    window.utils = utils; // temporary for debug
//    window.MOCK = MOCK; // temporary for debug

}());
