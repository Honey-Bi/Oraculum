var minWidth = $(window).width() * 4 / 100; // 화면 크기의 4%
var maxWidth = $(window).width() * 12 / 100; // 화면 크기의 12%

var selectItem = $('.selectBox');
selectItem.css('height', selectItem.css('width'));
$(window).resize(function() {
    selectItem.css('height', selectItem.css('width'));
});


let fuel = $('#fuel'),
    resource = $('#resource'),
    technology = $('#technology'),
    risk = $('#risk');

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
            setContentView(result.nowEvent.contents);
            setStatsView(
                result.fuel, 
                result.resourse, 
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
function setStatsView(fuel, resource, technology, risk) {
    $('#fuelFill').animate({height: 100-fuel + '%'}, 500);
    $('#resourceFill').animate({height: 100-resource + '%'}, 500);
    $('#technologyFill').animate({height: 100-technology + '%'}, 500);
    $('#riskFill').animate({height: 100-risk + '%'}, 500);
}
function setSelectView(left, right) {
    $('#selectLeft').text(left);
    $('#selectRight').text(right);
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
