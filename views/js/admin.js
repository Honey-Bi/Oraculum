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
    if ($('input[name=results]:checked').val() == 'left') {
        $('input[name=add_result]').each((index, item) => {
            r_result[index] = $(item).val()*1;
            $(item).val(l_result[index]);
        });
    } else if ($('input[name=results]:checked').val() == 'right'){
        $('input[name=add_result]').each((index, item) => {
            l_result[index] = $(item).val()*1;
            $(item).val(r_result[index]);
        });
    }
});

let actionType;
$('.editEvent').click(function() {
    actionType = "update";
    $('#editBtn').css('display', 'block');
    $('#saveBtn').css('display', 'none');
});
$('.addEvent').click(function() {
    actionType = "insert";
    $('#editBtn').css('display', 'none');
    $('#saveBtn').css('display', 'block');
});
$('#eventForm').submit(function() {
    if ($('#left_result').is(':checked')) {
        $('input[name=add_result]').each((index, item) => {
            l_result[index] = $(item).val()*1;
        });
    } else if ($('#right_result').is(':checked')) {
        $('input[name=add_result]').each((index, item) => {
            r_result[index] = $(item).val()*1;
        });
    }

    if(l_result.includes('') || l_result.length < 4) {
        return $('#left_result').parent().click();
    } else if(r_result.includes('') || r_result.length < 4) {
        return $('#right_result').parent().click();
    }   

    $.ajax({
        method:'POST',                                           
        url: '/admin/actionEvent',
        data: {
            event_code: $('#addEventCode').val()*1,
            title: $('#addTitle').val(),
            contents: $('#addContents').val(),
            r_text: $('#add_l_text').val(),
            l_text: $('#add_r_text').val(),
            r_result: r_result,
            l_result: l_result,
            next_event: $("#add_next_event option:selected").val(),
            id: currentId,
            type: actionType
        },
        dataType: "json",
        success: function (result) {
            return alert('code: ' + result.code + '\n' + result.message);
        },

        error: function(result, status, error) {
            return alert('code: ' + status+'\n' + error);
        }
    });
    location.reload();
});

$('.addEvent').click(function() {
    $('#addEventCode').val('');
    $('#addTitle').val('');
    $('#addContents').val('');
    $('#add_l_text').val('');
    $('#add_r_text').val('');
    l_result = []; 
    r_result = [];
    $('input[name=add_result]').each((index, item) => {
        $(item).val('');
    });
});
let currentId;
$('.editEvent').click(function(){
    currentId = $(this).val();
    $.ajax({
        method: "get",
        url: "/admin/getEvent?id="+currentId,
        dataType: "json",
        success: function(result) {
            $('#addEventCode').val(result.event_code);
            $('#addTitle').val(result.title);
            $('#addContents').val(result.contents);
            $('#add_l_text').val(result.l_text);
            $('#add_r_text').val(result.r_text);
            l_result = result.l_result;
            r_result = result.r_result;
            if ($('#left_result').is(':checked')) {
                $('input[name=add_result]').each((index, item) => {
                    $(item).val(l_result[index]);
                });
            } else if ($('#right_result').is(':checked')) {
                $('input[name=add_result]').each((index, item) => {
                    $(item).val(r_result[index]);
                });
            }

            $("#edit_next_event").val(result.next_event+'').prop("selected", true);
        },
        error: function(result, status, error) {
            console.log(error);
        }
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
            // console.log(result);
            alert('code: ' + result.code + '\n' + result.message);
            location.reload();
        },

        error: function(result, status, error) {
            console.log(error);
            alert('code: ' + result.status+'\n' + result.responseJSON.message);
        }
    });
});