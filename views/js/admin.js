$('#addForm').submit(function(){
    let inputName = $('#add_name').val(),
        inputId = $('#add_email').val(),
        password = $('#add_password').val();

    console.log('submit')
    $.ajax({
        method:"POST",                                           
        url:"/account/register-confirm",
        data: {
            name: inputName,
            id: inputId,
            password: password,
        },
        dataType: "json",
        success: function(result){
            alert("정상적으로 추가되었습니다.");
            location.reload();
        },
        error: function(result, status, error) {
            console.log(error)
        }
    });
});

$('.edit').click(function(){
    
});

$('.delete').click(function(){
    if(!confirm("정말 삭제 하시겠습니까?")){
        return;
    }
    $.ajax({
        method: "POST",
        url: "/admin/deleteUser",
        data: {
            id : $(this).val()
        },
        dataType: "json",
        success: function (result) {
            alert('code: '+result.code+'\n'+result.message);
        },

        error: function(result, status, error) {
            alert('code: '+result.status+'\n'+result.responseJSON.message);
            console.log(result);
        }
    });
    // location.reload();
});