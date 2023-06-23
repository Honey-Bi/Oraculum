let pattern_email = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]+$/; // 이메일 정규식
function email_check(email_id) {
    if (!email_id) { //비어있는지 확인
        $('#errEmail').text("아이디: 필수정보 입니다.");   
        $('#errEmail').css('color', '#ff3f3f');
        $('#errEmail').css('display', 'block');
        return false;
    } else if (email_id.match(pattern_email) == null) { // 이메일 정규식 매치
        $('#errEmail').text("아이디: 사용할수 없는 아이디 입니다.");
        $('#errEmail').css('color', '#ff3f3f');
        $('#errEmail').css('display', 'block');
        return false;
    } else {
        $.ajax({
            method:"POST",                                           
            url:"./exist-confirm",
            async: true,
            data: {
                input: email_id,
            },
            dataType: "json",
            success: function(result){
                if (result) {
                    $('#errEmail').text("아이디: 사용할수 없는 아이디 입니다.");
                    $('#errEmail').css('color', '#ff3f3f');
                    $('#errEmail').css('display', 'block');
                    return false;
                } else {
                    $('#errEmail').css('color', '#343a40');
                    $('#errEmail').css('display', 'none');
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
        $('#errPw').text("비밀번호: 필수정보 입니다.");   
    else if (password.length < 8 || password.length > 20)
    // 8글자 이상 20 이하인지 확인
        $('#errPw').text("8자리 ~ 20자리 이내로 입력해주세요.");
    else if (password.search(/\s/) != -1) 
    // 공백 확인
        $('#errPw').text("비밀번호는 공백 없이 입력해주세요.");
    else if (number < 0 || english < 0 || spece < 0)
    //영문 숫자 특수문자 혼합사용 확인
        $('#errPw').text("영문,숫자,특수문자를 혼합하여 입력해주세요.");
    else if ((number < 0 && english < 0) || (english < 0 && spece < 0) || (spece < 0 && number < 0))
    //영문 숫자 특수문자 중 2가지 이상혼합 확인
        $('#errPw').text("영문,숫자, 특수문자 중 2가지 이상을 혼합하여 입력해주세요.");
    else if (/(\w)\1\1\1/.test(password))
    //같은 문자 4번 확인
        $('#errPw').text('같은 문자를 4번 이상 사용하실 수 없습니다.');
    else {
        $('#errPw').css('color', '#343a40');
        $('#errPw').css('display', 'none');
        return true;
    }
    $('#errPw').css('display', 'block');
    $('#errPw').css('color', '#ff3f3f');
    return false;
}

$('#typePasswordX').focusout(function() {
    password_check($(this).val());
});

function name_check(name) {

    let specialCheck = /[`~!@#$%^&*|\\\'\";:\/?]/gi;

    if (!name) { //비어있는지 확인
        $('#errName').text("닉네임: 필수정보 입니다.");   
    } else if (name.search(/\s/) != -1) {
        $('#errName').text("닉네임: 빈칸을 포함할수 없습니다.");   
    } else if (name.length<2 || name.length>10) {
        $('#errName').text("닉네임: 2~10자의 문자와 숫자와 특수기호(_),(-)만 사용 가능합니다.");   
    } else if (specialCheck.test(name)) {
        $('#errName').text("닉네임: 2~10자의 문자와 숫자와 특수기호(_),(-)만 사용 가능합니다.");
    } else {
        $('#errName').css('display', 'mpme');
        $('#errName').css('color', '#343a40');
        return true;
    }
    $('#errName').css('display', 'block');
    $('#errName').css('color', '#ff3f3f');
    return false;
}

$('#typeNameX').on("propertychange change keyup paste input", function() {
    if(name_check($(this).val())) {
        $('.custom-dupilication-button').removeAttr("disabled");
        $('.custom-dupilication-button').removeClass("btn-secondary");
        $('.custom-dupilication-button').removeClass("btn-danger");
        $('.custom-dupilication-button').addClass("btn-success");
        return;
    } 
    $('.custom-dupilication-button').removeClass("btn-danger");
    $('.custom-dupilication-button').removeClass("btn-success");
    $('.custom-dupilication-button').addClass("btn-secondary");
    $('.custom-dupilication-button').attr("disabled", true);
});

$('#typeNameX').focusout(function() {
    name_check($(this).val());
});

$('.custom-dupilication-button').click(function(){
    let name = $('#typeNameX').val();
    $.ajax({
        method:"POST",                                           
        url:"./exist-confirm",
        async: true,
        data: {
            input: name,
        },
        dataType: "json",
        success: function (result) {
            if (result) {
                $('#errName').text("이미 사용중인 닉네임입니다.");
                $('#errName').css('color', '#ff3f3f');
                $('#errName').css('display', 'block');
                $('.custom-dupilication-button').addClass("btn-danger");
                $('.custom-dupilication-button').removeClass("btn-success");
                return false;
            } else {
                $('#errName').css('display', 'none');
                $('.custom-dupilication-button').attr("disabled", true);
                $('#errName').css('color', '#343a40');
                return true;
            }
        },
        error: function (result, status, error) {
            console.log(error);
            return false;
        }
    });
    return true;
});


$("#btn-register").click(function(){
    let inputId = $('#typeEmailX').val(),
        password = $('#typePasswordX').val(),
        inputName = $('#typeNameX').val();

    if (!email_check(inputId) && !password_check(password) && !name_check(inputName)){
        return;
    }
    $.ajax({
        method:"POST",                                           
        url:"./register-confirm",
        data: {
            name: inputName,
            id: inputId,
            password: password,
        },
        dataType: "json",
        success: function(result){
            alert("정상적으로 회원가입되었습니다.");
            location.replace("/");
        },
        error: function(result, status, error) {
            console.log(error)
        }
    })
})
