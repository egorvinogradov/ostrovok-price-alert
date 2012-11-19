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

/* ostrovok */

function getOstrovokHotelId(params){
    $.ajax({
        url: params.config.host + params.config.hotels.url,
        data: {
            query: params.hotel + ' ' + params.city
        },
        success: function(data){
            if ( data.hotels.length ) {
                params.success && params.success({
                    hotelId: data.hotels[0].hotel_uid
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
        }
    });
};

function getOstrovokRooms(params){
    var requestParams = {
        arrivalDate:            getHotelArrivalDate(),
        departureDate:          getHotelDepartureDate(),
        room1_numberOfAdults:   getHotelAdults(),
        _type:                  'json'
    };
    var children = getHotelChildren();
    var childrenAges = getHotelChildrenAges();
    if ( children ) {
        requestParams.room1_numberOfChildren = children;
        $.each(childrenAges, function(i, age){
            requestParams['room1_child' + ( i + 1 ) + 'Age'] = age;
        });
    }

    $.ajax({
        url: params.config.host + params.config.rooms.urlPrefix + params.hotelId,
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

function init(callback){
    var rooms = getRoomData(roomConfig);
    if ( rooms.length ) {
        getOstrovokHotelId({
            config: ostrovokAPIConfig,
            hotel:  getHotelName(),
            city:   getHotelCity(),
            success: function(data){
                if ( data.hotelId ) {
                    getOstrovokRooms({
                        config: ostrovokAPIConfig,
                        hotelId: data.hotelId,
                        success: function(data){
                            if ( data.rooms.length ) {
                                callback && callback(data.rooms);
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
};



/**********/

zcallback = function(rooms){
    console.log('___ ROOMS', rooms);
}
