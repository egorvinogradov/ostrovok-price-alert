(function(){

    var PriceAlert = {
        request: {
            data: {
                arrivalDate: booking.env.b_checkin_date,
                departureDate: booking.env.b_checkout_date,
                callback: 'handleData'
            },
            url: 'http://pricealert.f.test.ostrovok.ru/api/v1/pricealert/',
            requestCount: 0
        },
        bookingData: [],
        ostrovokData: [],

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

            var elements = $('[class^="room_loop_counter"]').not('.extendedRow'),
                requestParams = [],
                roomData = [],
                isArrayContainRoom = function(array, room){
                    for ( var i = 0, l = array.length; i < l; i++ ) {
                        if ( array[i].booking_room_id == room.id ) {
                            return true;
                        }
                    }
                    return false;
                };

            elements.each(function(i, element){

                var room = {},
                    els = {},
                    config = {
                        freeCancellationRu: 'БЕСПЛАТНАЯ отмена бронирования',
                        freeCancellationEn: 'FREE cancellation',
                        freeMealRu:         'Завтрак включен',
                        freeMealEn:         'Breakfast included'
                    };

                els.container = $(element);
                els.price =     els.container.find('.roomPrice');
                els.policies =  els.container.find('.ratepolicy');
                els.adults =    els.container.find('.roomDefaultUse img');

                room.id =               +els.price.children().eq(0).attr('id').replace(/^room_id_([0-9]+)_.*/, '$1');
                room.roomId =           +els.price.children().eq(0).attr('id').replace(/^room_id_[0-9]+_([0-9]+).*/, '$1');
                room.price =            +els.price.find('.click_change_currency').html().split(' ')[1];
                room.currency =         els.price.find('.click_change_currency').html().split(' ')[0];
                room.name =             els.container.parent().find('#' + room.id).find('.togglelink').html();
                room.freeMeal =         !!(els.policies.filter(':contains("' + config.freeMealRu + '")').length || els.policies.filter(':contains("' + config.freeMealEn + '")').length);
                room.freeCancellation = !!(els.policies.filter(':contains("' + config.freeCancellationRu + '")').length || els.policies.filter(':contains("' + config.freeCancellationEn + '")').length);
                room.adults =           +els.adults.attr('class').split(' ')[1].replace(/max/, '');

                if ( room.name && room.id ) {

                    if ( !isArrayContainRoom(requestParams, room) ) {
                        requestParams.push({
                            name: room.name,
                            booking_room_id: room.id
                        });
                    }
                    roomData.push(room);
                }

            });

            console.log('Ostrovok.ru Price Alert: Get Booking.com rooms \n', requestParams, '\n', roomData);

            return {
                requestParams: requestParams,
                roomData: roomData
            };

        },
        getBookingLinks: function(){

            var elements = $('link[rel="alternate"]'),
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

            var MOCK = 'http://pricealert.f.test.ostrovok.ru/api/v1/pricealert/?arrivalDate=2012-08-01&departureDate=2012-08-02&links=[%22/hotel/ru/metropol-moscow.html%22]&rooms=[{%22booking_room_id%22:4366806,%22name%22:%22%D0%9F%D1%80%D0%B5%D0%B4%D1%81%D1%82%D0%B0%D0%B2%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BB%D1%8E%D0%BA%D1%81%22}]&callback=handleData'

            url = MOCK;

            if ( this.requestCount > 10 ) {
                console.log('Ostrovok.ru Price Alert: Can\'t load rooms from Ostrovok.ru');
                return;
            }

            var script = document.createElement('script'),
                check = function(event){
                    if ( event.type !== 'load' ) {
                        console.log('Ostrovok.ru Price Alert: Load error, trying again', event);
                        $('.ostrovok_rooms').remove();
                        this.loadOstrovokRooms(url);
                    }
                };

            script.className = 'ostrovok_rooms';
            script.src = url;
            script.onload = script.onerror = $.proxy(check, this);
            document.body.appendChild(script);
            this.request.requestCount += 1;

        },
        handleData: function(data){

            try {

                var rooms = data.data;

                if ( data.status !== 'OK' && !rooms ) {
                    console.log('Ostrovok.ru Price Alert: No rooms found', data);
                    return;
                }
            }
            catch (e) {
                console.log('Ostrovok.ru Price Alert: No rooms found', data);
                return;
            }

            console.log('Ostrovok.ru Price Alert: Ostrovok.ru rooms loaded \n', rooms);
            
            this.bookingData.forEach(function(bookingRoom){

                rooms.forEach(function(room){

                    if ( bookingRoom.id != room.booking_room_id ) return;

                    room.rooms_data.forEach(function(roomData){

                        //console.log('room data --- ', roomData);

                        var areRoomsEqual,
                            ostrovokRoom = {
                                id:                 room.booking_room_id,
                                name:               roomData.room.name,
                                price:              +roomData.room.total_rate,
                                ratio:              roomData.ratio,
                                adults:             roomData.adults,
                                isPostPay:          room.is_postpay,
                                freeMeal:           false,
                                freeCancellation:   /Бесплатная отмена бронирования/.test(roomData.cancellation_policy.title)
                            };

                        for ( var i = 0, l = roomData.room.value_adds.length; i < l; i++ ) {
                            if ( roomData.room.value_adds[i].code === 'has_meal' ) {
                                ostrovokRoom.freeMeal = true;
                                break;
                            }
                        }

                        areRoomsEqual =
                            ostrovokRoom.adults             == bookingRoom.adults &&
                            ostrovokRoom.freeMeal           == bookingRoom.freeMeal &&
                            ostrovokRoom.freeCancellation   == bookingRoom.freeCancellation &&
                            ostrovokRoom.ratio              >= 0.8;

//                        areRoomsEqual
//                            ? console.log('ostrovokRoom', ostrovokRoom, roomData, bookingRoom, 'Equals')
//                            : console.log('ostrovokRoom', ostrovokRoom, roomData, bookingRoom);

                        if ( areRoomsEqual ) {
                            ostrovokRoom.roomId = bookingRoom.roomId;
                            ostrovokRoom.bookingPrice = bookingRoom.price;
                            ostrovokRoom.bookingCurrency = bookingRoom.currency;
                            this.ostrovokData.push(ostrovokRoom);
                        }

                    }, this);
                }, this);
            }, this);

            this.renderOstrovokRooms(this.ostrovokData);

        },
        renderOstrovokRooms: function(rooms){

            var removeDuplicates = function(roomsArr){

                    var roomsObj = {},
                        newRoomsArr = [];

                    for ( var i = 0, l = roomsArr.length; i < l; i++ ) {
                        var id = roomsArr[i].roomId,
                            room = roomsObj[id];
                        roomsObj[id] = !room
                            ? roomsArr[i]
                            : room.price > roomsArr[i].price
                                ? roomsArr[i]
                                : room;
                    }
                    for ( var a in roomsObj ) {
                        newRoomsArr.push(roomsObj[a]);
                    }
                    return newRoomsArr;
                },
                orderedRooms = removeDuplicates(rooms);

            console.log('Ostrovok.ru Price Alert: Render prices from Ostrovok.ru \n', rooms, '\n', orderedRooms);

            orderedRooms.forEach(function(room){

                var element = $('[id^="room_id_' + room.id + '_' + room.roomId + '"]'),
                    bookingPriceBlock = element.find('.click_change_currency'),
                    bookingPrice = +bookingPriceBlock.html().split(' ')[1],
                    bookingCurrency = bookingPriceBlock.html().split(' ')[0],
                    messages = {
                        cheaper:    'Этот номер дешевле на Ostrovok.ru!',
                        equal:      'На Ostrovok.ru этот номер стоит столько же.',
                        expensive:  'Упс! Мы упустили, что этот номер где-то продается дешевле. Но это не проблема &mdash; позвоните нам по 8 800 200-31-81, и мы дадим вам такую же цену!'
                    },
                    classes = {
                        cheaper:    'ostrovok_price_cheaper',
                        equal:      'ostrovok_price_equal',
                        expensive:  'ostrovok_price_expensive',
                        hover:      'ostrovok__price-wrapper_hover'
                    },
                    block =         $('<div class="ostrovok__price-block"></div>'),
                    wrapper =       $('<div class="ostrovok__price-wrapper"></div>'),
                    additional =    $('<div class="ostrovok__additional"></div>'),
                    messageBlock =  $('<div class="ostrovok__message"></div>'),
                    priceBlock =    $('<div class="ostrovok__price"></div>').html('RUB ' + room.price).append('<span class="ostrovok__title">ostrovok.ru</span>'),
                    bookButton =    $('<a class="ostrovok__button" href="#' + room.roomId + '"><b><i>Забронировать на Ostrovok.ru</i></b></a>');

                if ( room.price < bookingPrice ) {
                    wrapper.addClass(classes.cheaper);
                    messageBlock.html(messages.cheaper);
                }

                if ( room.price == bookingPrice ) {
                    wrapper.addClass(classes.equal);
                    messageBlock.html(messages.equal);
                }

                if ( room.price > bookingPrice ) {
                    wrapper.addClass(classes.expensive);
                    messageBlock.html(messages.expensive);
                }

                wrapper.hover(function(e){
                    $(e.currentTarget).addClass(classes.hover);
                }, function(e){
                    $(e.currentTarget).removeClass(classes.hover);
                });

                additional
                    .append(messageBlock)
                    .append(bookButton);

                wrapper
                    .append(priceBlock)
                    .append(additional);

                block.append(wrapper);
                element.append(block);

            });

            console.log('Ostrovok.ru Price Alert: By the way, we\'re hiring http://ostrovok.ru/jobs/');

        }

    };

    window.PriceAlert = PriceAlert; // for debug
    window.handleData = $.proxy(PriceAlert.handleData, PriceAlert);
    PriceAlert.init();

}());
