var selectItem = $('.selectBox');
selectItem.css('height', selectItem.css('width'));
$(window).resize(function() {
    selectItem.css('height', selectItem.css('width'));
});

$("#logout").attr("href", "/account/logout?callback=/")

$(document).ready(function () {
    setView();
});

function setView() {
    $.ajax({
        method:'POST',                                           
        url:'/main/getView',
        async: true,
        dataType: 'json',
        success: function(result){
            // console.log(result);
            setContentView(result.nowEvent.contents);
            setStatsView(
                result.fuel, 
                result.resource, 
                result.technology, 
                result.risk
            );
            setSelectView(result.nowEvent.choices.left, result.nowEvent.choices.right);
            
        },
        error: function(request, status, error) {
            console.log(error)
            return;
        }
    });
}

function setContentView(text) {
    $('.contents').text(text);
}
function setSelectView(left, right) {
    $('#selectLeft').text(left);
    $('#selectRight').text(right);
}

var plusColor = '#00C851';
var minusColor = '#ff4444';

let fuel_stock = 50,
    resource_stock = 50,
    technology_stock = 50,
    risk_stock = 50;

function setStatsView(fuel, resource, technology, risk) {

    if (fuel_stock > 100-fuel) $('#fuel').animate({color: plusColor}, 100);
    else if (fuel_stock < 100-fuel) $('#fuel').animate({color: minusColor}, 100);
    $('#fuelFill').animate({height: 100-fuel + '%',}, 600 , 'easeOutQuart');
    $('#fuel').animate({color: "#fff"}, 500);

    if (resource_stock > 100-resource) $('#resource').animate({color: plusColor}, 100)
    else if (resource_stock < 100-resource) $('#resource').animate({color: minusColor}, 100)
    $('#resourceFill').animate({height: 100-resource + '%'}, 600, 'easeOutQuart');
    $('#resource').animate({color: "#fff"}, 500);

    if (technology_stock > 100-technology) $('#technology').animate({color: plusColor}, 100)
    else if (technology_stock < 100-technology) $('#technology').animate({color: minusColor}, 100)
    $('#technologyFill').animate({height: 100-technology + '%'}, 600, 'easeOutQuart');
    $('#technology').animate({color: "#fff"}, 500);
    
    if (risk_stock > 100-risk) $('#risk').animate({color: plusColor}, 100)
    else if (risk_stock < 100-risk) $('#risk').animate({color: minusColor}, 100)
    $('#riskFill').animate({height: 100-risk + '%'}, 600, 'easeOutQuart');
    $('#risk').animate({color: "#fff"}, 500);
    
    fuel_stock = 100 - fuel;
    resource_stock = 100 - resource;
    technology_stock = 100 - technology;
    risk_stock = 100 - risk;
}

var minWidth = $(window).width() * 4 / 100; // 화면 크기의 4%
var maxWidth = $(window).width() * 12 / 100; // 화면 크기의 12%

$('.selectBox').draggable({
    axis: "x", //좌우로만
    scroll: false,
    // containment : '', //화면 밖으로 이동 가능
    drag : function(){
        var pos = $('.selectBox').position(); // 드래그 하는 이미지의 위치값 알아내기

        $(this).css({'transform':'rotate('+(pos.left/40)+'deg)'})
        console.log($(this).css('transform'));
        $('.answer-left').css('opacity', (pos.left-minWidth)/maxWidth); 
        $('.answer-right').css('opacity', ((pos.left+minWidth)/maxWidth)*-1); 
    },
    stop : function(){ // 드래그 종료시 실행
        $('.answer').animate({opacity: 0}, 250);  
        
        var select;

        if (-maxWidth <= $(this).position().left && $(this).position().left <= maxWidth) {
            // $(this).animate({transform:'rotate('+0+'deg)'});
            // $(this).animate({ 
            //     top : 0, left : 0,
            // }, 250, 'easeOutBack');
            return;
        } else if ($(this).position().left >= maxWidth) { //왼쪽 선택
            select = 1;
        } else if($(this).position().left <= -maxWidth) { //오른쪽 선택
            select = 0;
        }
        $(this).addClass('transformThis')
        setTimeout(() =>{
            $(this).removeClass('transformThis');
            $(this).css({ left : 0, 'transform': "rotate(0deg)"});
        },400)
        // $(this).css({ top : 0, left : 0,}); // 원위치로, 제이쿼리UI 의 이징효과 사용
        

        // $.ajax({
        //     method:'POST',                                           
        //     url:'/main/select',
        //     async: true,
        //     data: {
        //         isLeft: select*1,
        //     },
        //     dataType: 'json',
        //     success: function(result){
        //         console.log(result);
        //         setView();
        //         return;
        //     },
        //     error: function(error) {
        //         console.log(error)
        //     }
        // });

    }
});

function rotate(selector, angle, deg, ms){
    $(selector).animate({a: deg},{
        duration:ms,
        step: function(now,fx) {
            $(this).css({'transform':'rotate('+(angle+now)+'deg)'}); 
        }
    });
}

function calculateDeg(selector){
    var tr = $(selector).css('transform');
    var values = tr.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var scale = Math.sqrt(a*a + b*b);
    var sin = b/scale;
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    return angle
}

