var minWidth = $(window).width() * 4 / 100; // 화면 크기의 4%
var maxWidth = $(window).width() * 12 / 100; // 화면 크기의 12%

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

    if (fuel_stock > 100-fuel) $('#fuel').animate({color: plusColor}, 300);
    else if (fuel_stock < 100-fuel) $('#fuel').animate({color: minusColor}, 300);
    $('#fuelFill').animate({height: 100-fuel + '%',}, 600 , 'easeOutQuart');
    $('#fuel').animate({color: "#fff"}, 300);

    if (resource_stock > 100-resource) $('#resource').animate({color: plusColor}, 300)
    else if (resource_stock < 100-resource) $('#resource').animate({color: minusColor}, 300)
    $('#resourceFill').animate({height: 100-resource + '%'}, 600, 'easeOutQuart');
    $('#resource').animate({color: "#fff"});

    if (technology_stock > 100-technology) $('#technology').animate({color: plusColor}, 300)
    else if (technology_stock < 100-technology) $('#technology').animate({color: minusColor}, 300)
    $('#technologyFill').animate({height: 100-technology + '%'}, 600, 'easeOutQuart');
    $('#technology').animate({color: "#fff"});
    
    if (risk_stock > 100-risk) $('#risk').animate({color: plusColor}, 300)
    else if (risk_stock < 100-risk) $('#risk').animate({color: minusColor}, 300)
    $('#riskFill').animate({height: 100-risk + '%'}, 600, 'easeOutQuart');
    $('#risk').animate({color: "#fff"});
    
    fuel_stock = 100 - fuel;
    resource_stock = 100 - resource;
    technology_stock = 100 - technology;
    risk_stock = 100 - risk;
}

$('.selectBox').draggable({
    axis: "x", //좌우로만
    scroll: false,
    // containment : '', //화면 밖으로 이동 가능
    drag : function(){
        var pos = $('.selectBox').position(); // 드래그 하는 이미지의 위치값 알아내기

        $('.answer-left').css('opacity', (pos.left-minWidth)/maxWidth); 
        $('.answer-right').css('opacity', ((pos.left+minWidth)/maxWidth)*-1); 
    },
    stop : function(){ // 드래그 종료시 실행
        $('.answer').animate({opacity: 0}, 250);  
        var select;
        if ($(this).position().left >= maxWidth) { //왼쪽 선택
            select = 1;
        } else if($(this).position().left <= -maxWidth) { //오른쪽 선택
            select = 0;
        }

        $.ajax({
            method:'POST',                                           
            url:'/main/select',
            async: true,
            data: {
                isLeft: select*1,
            },
            dataType: 'json',
            success: function(result){
                console.log(result);
                setView();
                return;
            },
            error: function(error) {
                console.log(error)
                return;
            }
        });
        $(this).animate({ top : 0, left : 0}, 250, 'easeOutBack' ); // 원위치로, 제이쿼리UI 의 이징효과 사용
    }
})
