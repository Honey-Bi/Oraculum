$('#addUserForm').submit(function(){
    let inputName = $('#add_name').val(),
        inputId = $('#add_email').val(),
        password = $('#add_password').val();

    console.log('submit')
    $.ajax({
        method:"POST",                                           
        url:"/account/register-confirm",
        data: {
            name: inputName+'_t',
            id: inputId+'_t',
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

let r_result=[], l_result=[];
$('input[name=results]').change(function() {
    if($(this).attr('id') == 'left_result') {
        $('input[name=add_result]').each((index, item) => {
            r_result[index] = ($(item).val());
            $(item).val(l_result[index]);
        });
        return;
    } 
    $('input[name=add_result]').each((index, item) => {
        l_result[index] = ($(item).val());
        $(item).val(r_result[index]);
    });
});

$('.delete').click(function(){
    if(!confirm("정말 삭제 하시겠습니까?")){
        return;
    }
    $.ajax({
        method: "POST",
        url: "/admin/deleteOne",
        data: {
            id : $(this).val(),
            type: $(location).attr("href").split('/').pop()
        },
        dataType: "json",
        success: function (result) {
            alert('code: ' + result.code + '\n' + result.message);
        },

        error: function(result, status, error) {
            alert('code: ' + result.status+'\n' + result.responseJSON.message);
        }
    });
    location.reload();
});