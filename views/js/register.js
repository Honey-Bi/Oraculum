var inputId, inputName, inputName;


let pattern_email = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]+$/; // 이메일 정규식
function email_check(email_id) {
    if (!email_id) { //비어있는지 확인
        $('.err-text').text("아이디: 필수정보 입니다.");   
        $('.err-text').css('color', '#ff3f3f');
        return false;
    } else if (email_id.match(pattern_email) == null) { // 이메일 정규식 매치
        $('.err-text').text("아이디: 사용할수 없는 아이디 입니다.");
        $('.err-text').css('color', '#ff3f3f');
        return false;
    } else {
        $.ajax({
            method:"POST",                                           
            url:"/exitst-confirm",
            async: true,
            data: {
                input: email_id,
            },
            dataType: "json",
            success: function(result){
                // console.log(result);
                if (result) {
                    $('.err-text').text("아이디: 사용할수 없는 아이디 입니다.");
                    $('.err-text').css('color', '#ff3f3f');
                    return false;
                } else {
                    $('.err-text').css("display", "none");
                    return true;
                }
            },
            error: function(result, status, error) {
                console.log(error)
                return false;
            }
        });
    }
}

$('#typeEmailX').focusout(function() {
    email_check($(this).val())
});

let reg = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
function password_check(password) {

    let number = password.search(/[0-9]/g); // 숫자 확인 정규식
    let english = password.search(/[a-z]/ig); // 영어 확인 정규식
    let spece = password.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi); //공백 확인 정규식

    if (!password) 
    //비어있는지 확인
        $('.err-text').text("비밀번호: 필수정보 입니다.");   
    else if (password.length < 8 || password.length > 20)
    // 8글자 이상 20 이하인지 확인
        $('.err-text').text("8자리 ~ 20자리 이내로 입력해주세요.");
    else if (password.search(/\s/) != -1) 
    // 공백 확인
        $('.err-text').text("비밀번호는 공백 없이 입력해주세요.");
    else if (number < 0 || english < 0 || spece < 0)
    //영문 숫자 특수문자 혼합사용 확인
        $('.err-text').text("영문,숫자,특수문자를 혼합하여 입력해주세요.");
    else if ((number < 0 && english < 0) || (english < 0 && spece < 0) || (spece < 0 && number < 0))
    //영문 숫자 특수문자 중 2가지 이상혼합 확인
        $('.err-text').text("영문,숫자, 특수문자 중 2가지 이상을 혼합하여 입력해주세요.");
    else if (/(\w)\1\1\1/.test(password))
    //같은 문자 4번 확인
        $('.err-text').text('같은 문자를 4번 이상 사용하실 수 없습니다.');
    else {
        $('.err-text').css("display", "none");
        return true;
    }
    $('.err-text').css('color', '#ff3f3f');
    return false;
}

$('#typePasswordX').focusout(function() {
    password_check($(this).val());
});

function name_check(name) {
    if (!name) { //비어있는지 확인
        $('.err-text').text("이름: 필수정보 입니다.");   
        $('.err-text').css('color', '#ff3f3f');
        return false;
    }
    $.ajax({
        method:"POST",                                           
        url:"/exitst-confirm",
        async: true,
        data: {
            input: name,
        },
        dataType: "json",
        success: function(result){
            // console.log(result);
            if (result) {
                $('.err-text').text("아이디: 사용할수 없는 아이디 입니다.");
                $('.err-text').css('color', '#ff3f3f');
                return false;
            } else {
                $('.err-text').css("display", "none");
                return true;
            }
        },
        error: function(result, status, error) {
            console.log(error)
            return false;
        }
    });
    return true;
}

$('#typeNameX').focusout(function() {
    name_check($(this).val());
});


$("#btn-register").click(function(){
    inputId = $('#typeEmailX').val(),
    password = $('#typePasswordX').val(),
    inputName = $('#typeNameX').val();
    
    if (!email_check(inputId) && !password_check(password) && !name_check(inputName)){
        return;
    }
    $.ajax({
        method:"POST",                                           
        url:"/register-confirm",
        data: {
            name: inputName,
            id: inputId,
            password: password,
        },
        dataType: "json",
        success: function(result){
            console.log(result);
            alert("정상적으로 회원가입되었습니다.");
            location.replace("/");
        },
        error: function(result, status, error) {
            console.log(error)
        }
    })
})
