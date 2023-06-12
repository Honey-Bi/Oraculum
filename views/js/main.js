var minWidth = $(window).width() * 4 / 100; // 화면 크기의 4%
var maxWidth = $(window).width() * 12 / 100; // 화면 크기의 12%

$('.a').draggable({
    axis: "x", //좌우로만
    scroll: false,
    // containment : '', //화면 밖으로 이동 가능
    drag : function(){
        var pos = $('.a').position(); // 드래그 하는 이미지의 위치값 알아내기

        $('.answer-left').css('opacity', (pos.left-minWidth)/maxWidth); 
        $('.answer-right').css('opacity', ((pos.left+minWidth)/maxWidth)*-1); 
    },
    stop : function(){ // 드래그 종료시 실행
        $('.answer').animate({opacity: 0}, 250);  
        var select;
        if ($(this).position().left >= maxWidth) { //왼쪽 선택
            select = 0;
        } else if($(this).position().left <= -maxWidth) { //오른쪽 선택
            select = 1;
        }

        $.ajax({
            method:'POST',                                           
            url:'/main/select',
            async: true,
            data: {
                answer: select,
            },
            dataType: 'json',
            success: function(result){
                console.log(result);
                return;
            },
            error: function(error) {
                console.log(error)
                return;
            }
        });
        $('.title').text((select)?'right':'left');
        $(this).animate({ top : 0, left : 0}, 250, 'easeOutBack' ); // 원위치로, 제이쿼리UI 의 이징효과 사용
    }
})
