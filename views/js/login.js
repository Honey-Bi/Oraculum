$('#loginBtn').click(function(){
    $('#typeEmailX').val();
    $('#typePasswordX').val();
});


$('#loginForm').submit(function(){
    let inputId = $('#typeEmailX').val(), 
        inputPw = $('#typePasswordX').val();

    if (!inputId) {
        $('.err-text').text("아이디를 입력해주세요");
        $('.err-text').css('color', '#ff3f3f');
        $('#typeEmailX').focus();
        return;
    }
    if (!inputPw) {
        $('.err-text').text("비밀번호를를 입력해주세요");
        $('.err-text').css('color', '#ff3f3f');
        $('#typePasswordX').focus();
        return;
    }

    $.ajax({
        method:'POST',                                           
        url:'/account/login-confirm',
        async: true,
        data: {
            id: inputId,
            pw: inputPw
        },
        dataType: 'json',
        success: function(result){
            // console.log("login");
            // sessionStorage.removeItem('token');
            // document.cookie = "token="+result.token;
            location.href = '/';
            return;
        },
        error: function(error) {
            // console.log(error)
            var err = $('.err-text').text("아이디 또는 비밀번호를 잘못 입력했습니다.\n입력하신 내용을 다시 확인해주세요.");
            err.html(err.html().replace(/\n/g, '<br/>'));
            $('.err-text').css('color', '#ff3f3f');
            return;
        }
    });
});