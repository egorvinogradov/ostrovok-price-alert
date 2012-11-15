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
    var roomEls = getRoomEls();
    return roomEls.map(function(i, el){
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

function getRoomCurrency(el. config){
    var cur = el
        .find('.roomPrice')
        .find('.click_change_currency')
        .html()
        .replace(/[0-9,\s]+/, '');
    return config.currency[cur];
};

function getRoomName(el){
    return el
        .parent()
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

function getDates(){
    return {
        arrivalDate: booking.env.b_checkin_date,
        departureDate: booking.env.b_checkout_date
    }
};
