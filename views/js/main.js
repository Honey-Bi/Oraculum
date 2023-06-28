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

let plusColor = '#00C851',
    minusColor = '#ff4444',
    minusFill = '#ff7f7f';


let fuel_stock = 50,
    resource_stock = 50,
    technology_stock = 50,
    risk_stock = 50;

function setStatsView(fuel, resource, technology, risk) {

    if (fuel_stock > 100-fuel) $('#fuel').animate({color: plusColor}, 100);
    else if (fuel_stock < 100-fuel) {
        $('#fuel').animate({color: minusColor}, 100);
        $('#fuelFill').animate({color: minusFill}, 100);
    }
    $('#fuelFill').animate({color: '#7f7f7f', height: 100-fuel + '%',}, 600 , 'easeOutQuart');
    $('#fuel').animate({color: "#fff"}, 500);

    if (resource_stock > 100-resource) $('#resource').animate({color: plusColor}, 100)
    else if (resource_stock < 100-resource) {
        $('#resource').animate({color: minusColor}, 100)
        $('#resourceFill').animate({color: minusFill}, 100)
    }
    $('#resourceFill').animate({color: '#7f7f7f', height: 100-resource + '%'}, 600, 'easeOutQuart');
    $('#resource').animate({color: "#fff"}, 500);

    if (technology_stock > 100-technology) $('#technology').animate({color: plusColor}, 100)
    else if (technology_stock < 100-technology) {
        $('#technology').animate({color: minusColor}, 100)
        $('#technologyFill').animate({color: minusFill}, 100)
    }
    $('#technologyFill').animate({color: '#7f7f7f', height: 100-technology + '%'}, 600, 'easeOutQuart');
    $('#technology').animate({color: "#fff"}, 500);
    
    if (risk_stock > 100-risk) $('#risk').animate({color: plusColor}, 100)
    else if (risk_stock < 100-risk) {
        $('#risk').animate({color: minusColor}, 100)
        $('#riskFill').animate({color: minusFill}, 100)
    }
    $('#riskFill').animate({color: '##7f7f7f', height: 100-risk + '%'}, 600, 'easeOutQuart');
    $('#risk').animate({color: "#fff"}, 500);
    
    fuel_stock = 100 - fuel;
    resource_stock = 100 - resource;
    technology_stock = 100 - technology;
    risk_stock = 100 - risk;
}

var minWidth = $(window).width() * 4 / 100; // 화면 크기의 4%
var maxWidth = $(window).width() * 12 / 100; // 화면 크기의 12%

var min2 =  minWidth/2;
$('.selectBox').draggable({
    axis: "x", //좌우로만
    scroll: false,
    // containment : '', //화면 밖으로 이동 가능
    drag : function(){
        var pos = $('.selectBox').position(); // 드래그 하는 이미지의 위치값 알아내기

        $(this).css({'transform':'rotate('+((pos.left+min2)/40)+'deg)'})

        // console.log($(this).css('transform'));
        $('.answer-left').css('opacity', (pos.left-minWidth)/maxWidth); 
        $('.answer-right').css('opacity', ((pos.left+minWidth)/maxWidth)*-1); 
    },
    stop : function(){ // 드래그 종료시 실행
        $('.answer').animate({opacity: 0}, 250);  
        var pos = $('.selectBox').position(); 
        
        var select;
        if (-maxWidth <= pos.left && pos.left <= maxWidth) {
            $(this).animate({ 
                top : 0, left : 0,
            }, 250, 'easeOutBack');
            $(this).css({'transform': "rotate(0deg)"});
            return;
        } else if (pos.left >= maxWidth) { //왼쪽 선택
            select = 1;
        } else if(pos.left <= -maxWidth) { //오른쪽 선택
            select = 0;
        }

        $(this).animate({top: 100, opacity: 0}, 250);
        setTimeout(() =>{
            $(this).css({left: 0,'transform': "rotate(0deg)"});
            $(this).animate({
                top: 0,
                opacity: 1
            }, 250, 'easeOutBack');
        },250);       

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
            }
        });
    }
});