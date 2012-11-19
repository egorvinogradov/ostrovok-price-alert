var roomConfig = {
    freeCancellationRu: 'БЕСПЛАТНАЯ отмена бронирования',
    freeCancellationEn: 'FREE cancellation',
    freeMealRu:         'Завтрак включен',
    freeMealEn:         'Breakfast included',
    currency: {
        'руб.': 'RUR',
        'US$':  'USD'
    }
};

var ostrovokAPIConfig = {
    host: 'http://salty-dawn-9815.herokuapp.com',
    hotels: {
        url: '/api/site/multicomplete.json'
    },
    rooms: {
        urlPrefix: '/api/v1/rooms/'
    }
};

// function isRoomInList(room, list) {
//     for (var i = 0, l = list.length; i < l; i++) {
//         if (list[i].booking_room_id == room.id) {
//             return true;
//         }
//     }
//     return false;
// };

function getRoomEls(){
    return $('[class^="room_loop_counter"]').not('.extendedRow');
};

function getRoomData(config){
    return getRoomEls().map(function(i, el){
        var room = $(el);
        return {
            id:                 getRoomTypeId(room),
            roomId:             getRoomId(room),
            name:               getRoomName(room),
            price:              getRoomPrice(room),
            currency:           getRoomCurrency(room, config),
            freeCancellation:   getRoomCancellation(room, config),
            freeMeal:           getRoomMeal(room, config),
            adults:             getRoomAdults(room)
        };
    });
};

function getRoomTypeId(el){
    return +el
        .find('.roomPrice')
        .children()
        .eq(0)
        .attr('id')
        .replace(/^room_id_([0-9]+)_.*/, '$1');
};

function getRoomId(el){
    return +el
        .find('.roomPrice')
        .children()
        .eq(0)
        .attr('id')
        .replace(/^room_id_[0-9]+_([0-9]+).*/, '$1');
};

function getRoomPrice(el){
    return +el
        .find('.roomPrice')
        .find('.click_change_currency')
        .html()
        .replace(/.*?([0-9,\s]+).*/, '$1')
        .replace(/\s/, '')
        .replace(/\,/, '.');
};

function getRoomCurrency(el, config){
    var cur = el
        .find('.roomPrice')
        .find('.click_change_currency')
        .html()
        .replace(/[0-9,\s]+/, '');
    return config.currency[cur];
};

function getRoomName(el){
    var tr = !el.is('.maintr')
        ? el.prevAll('.maintr').first()
        : el;
    return tr
        .find('.roomType')
        .find('.togglelink')
        .html();
};

function getRoomMeal(el, config){

    var freeMealRu = !!el
        .find('.ratepolicy')
        .filter(':contains(\'' + config.freeMealRu + '\')')
        .length;
    
    var freeMealEn = !!el
        .find('.ratepolicy')
        .filter(':contains(\'' + config.freeMealEn + '\')')
        .length;
    
    return freeMealRu || freeMealEn;
};

function getRoomCancellation(el, config){

    var freeCancellationRu = !!el
        .find('.ratepolicy')
        .filter(':contains(\'' + config.freeCancellationRu + '\')')
        .length;

    var freeCancellationEn = !!el
        .find('.ratepolicy')
        .filter(':contains(\'' + config.freeCancellationEn + '\')')
        .length;

    return freeCancellationRu || freeCancellationEn;
};

function getRoomAdults(el){
    return +el
        .find('.roomDefaultUse img')
        .attr('class')
        .split(' ')[1]
        .replace(/max/, '');
};

/* hotel */

// function getHotelDates(){
//     return {
//         arrivalDate: booking.env.b_checkin_date,
//         departureDate: booking.env.b_checkout_date
//     }
// };

function getHotelArrivalDate(){
    return booking.env.b_checkin_date;
};

function getHotelDepartureDate(){
    return booking.env.b_checkout_date;
};

function getHotelName(){
    return booking.env.b_hotel_name;
};

function getHotelCity(){
    return booking.env.sess_dest_fullname;
};

function getHotelCountry(){
    return $('a[rel=v:url][href^=/country]').html()
};

// function getHotelAdults(){
//     var el = $('.guests .search_summary_toggle_button');
//     if ( el.length ) {
//         return +el
//             .html()
//             .split(',')[0]
//             .replace(/[^[0-9]/, '');
//     }
//     return 2;
// };

// function getHotelChildren(){
//     var el = $('.guests .search_summary_toggle_button');
//     if ( el.length ) {
//         var children = el
//             .html()
//             .split(',')[1];
//         if ( children ) {
//             return +children.replace(/[^[0-9]/, '');
//         }
//         else {
//             return 0;
//         }
//     }
//     else {
//         return 0;
//     }
// };


function getHotelAdults(){
    return booking.env.b_group[0].guests;
};

function getHotelChildren(){
    return booking.env.b_group[0].children;
};

function getHotelChildrenAges(){
    return $.map(booking.env.b_group[0].ages, function(children){
        return children.age;
    });
};

function getOstrovokHotelId(params){
    $.ajax({
        url: params.config.host + params.config.hotels.url,
        data: {
            query: params.hotel + ' ' + params.city
        },
        success: function(data){
            if ( data.hotels.length ) {
                var hotelId = +data
                    .hotels[0]
                    .hotel_uid;
                params.success && params.success({
                    hotelId: hotelId
                });
            }
            else {
                params.error && params.error({
                    hotelId: null,
                    errorData: {
                        message: 'No hotels found'
                    }
                });
            }
        },
        error: function(e){
            params.error && params.error({
                hotelId: null,
                errorData: e
            });
        };
    });
};

function getOstrovokRooms(params){
    var requestParams = {
        arrivalDate:            getHotelArrivalDate(),
        departureDate:          getHotelDepartureDate(),
        room1_numberOfAdults:   getHotelAdults(),
        _type:                  'json'
    });
    var children = getHotelChildren();
    var childrenAges = getHotelChildrenAges();
    if ( children ) {
        requestParams.room1_numberOfChildren = children;
        $.each(childrenAges, function(i, age){
            requestParams['room1_child' + ( i + 1 ) + 'Age'] = age;
        });
    }

    $.ajax({
        url: params.config.rooms.urlPrefix + params.hotelId,
        data: requestParams,
        success: function(data){
            if ( data.hotel && data.hotel.rooms && data.hotel.rooms.length ) {
                params.success && params.success({
                    rooms: data.hotel.rooms
                });
            }
            else {
                params.error && params.error({
                    rooms: null,
                    errorData: {
                        message: 'No rooms found'
                    }
                });
            }
        },
        error: function(e){
            params.error && params.error({
                rooms: null,
                errorData: e
            });
        }
    });
};







function init(){
    var rooms = getRoomData(roomConfig);
    if ( rooms.length ) {
        getOstrovokHotelId({
            config: ostrovokAPIConfig,
            hotel:  getHotelName(),
            city:   getHotelCity(),
            success: function(data){
                if ( hotelId ) {
                    getOstrovokRooms({
                        config: ostrovokAPIConfig,
                        hotelId: data.hotelId,
                        success: function(data){
                            if ( data.rooms && data.rooms.length ) {
                                console.log('--- ROOMS', data.hotel.rooms);
                            }
                        },
                        error: function(e){
                            console.error(e);
                        }
                    });
                }
            },
            error: function(e){
                console.error(e);
            }
        });
    }
    return rooms;
};


// http://ostrovok.ru/api/v1/rooms/x863982519/?arrivalDate=2012-11-16&hotelId=863982519&departureDate=2012-11-17&room1_numberOfAdults=2&room1_numberOfChildren=0&_type=json&grouped=true&payment_choices=true



//var url = 'http://ostrovok.ru/api/v1/rooms/x863982519/';
var url = 'http://127.0.0.1:5000/api/v1/rooms/x863982519/';
var data = {
    arrivalDate: '2012-11-16',
    departureDate: '2012-11-17',
    hotelId: 863982519,
    room1_numberOfAdults: 2,
    room1_numberOfChildren: 0,
    _type: 'json',
    grouped: true,
    payment_choices: true
}

function makeRequest(){
    $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: url,
        data: data,
        complete: function(){
            console.log('>>> Complete', arguments);
        }
    });
}





function z(s){
    console.log('{');
    s.split('&').forEach(function(n){
        var z = n.split('=');
        console.log('    ', z[0], ':', z[1], ',');
    });
    console.log('}');
}

