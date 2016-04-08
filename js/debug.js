/**
 * Created by Garrise on 2016/4/8.
 */
$(document).ready(function(){
    $('#debug').click(function(){
        var td = findTd(2, 2);
        setTimeout(function(){
            td.trigger('mousedown');}, 500);
        td = findTd(3, 3);
        setTimeout(function(){
            td.trigger('mouseup');}, 500);
        setTimeout(function(){
            td.trigger('dblclick');}, 500);
        setTimeout(function(){
            td.trigger('mousedown');}, 500);
    });
});
function findTd(x, y) {
    return $('#map').find('tr').eq(y).find('td').eq(x);
}