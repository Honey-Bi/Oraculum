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
        $('.left-stats').css('display', 'flex');
        $('.right-stats').css('display', 'none');
    } else if ($('input[name=results]:checked').val() == 'right'){
        $('.left-stats').css('display', 'none');
        $('.right-stats').css('display', 'flex');
    }
});

$('input[name=next_event]').change(function() {    
    if ($('input[name=next_event]:checked').val() == 'left') {
        $('.left-next').css('display', 'flex');
        $('.right-next').css('display', 'none');
    } else if ($('input[name=next_event]:checked').val() == 'right'){
        $('.left-next').css('display', 'none');
        $('.right-next').css('display', 'flex');
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

jQuery.fn.serializeObject = function() {
    var obj = null;
    try {
        if (this[0].tagName && this[0].tagName.toUpperCase() == "FORM") {
            var arr = this.serializeArray();
            if (arr) {
                obj = {};
                jQuery.each(arr, function() {
                    obj[this.name] = this.value;
                });
            }//if ( arr ) {
        }
    } catch (e) {
        alert(e.message);
    } finally {
    }
 
    return obj; 
};


$('#eventForm').submit(function() {

    $.ajax({
        method:'POST',                                           
        url: '/admin/actionEvent',
        data: {
            formData: $(this).serializeObject(),
            actionType: actionType,
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
    $('#eventType').val('random').prop('selected', true);
    $('#eventCode').val('');
    $('#eventTitle').val('');
    $('#eventContents').val('');
    $('#l_text').val('');
    $('#r_text').val('');
    $('#left_result').click();
    $('#left_event').click();
    $('.stats > input').each((index, item) => {
        $(item).val('');
    });
    $('#leftEvent').val('default').prop('selected', true);
    $('#rightEvent').val('default').prop('selected', true);
});
let currentId;
$('.editEvent').click(function(){
    currentId = $(this).val();
    $.ajax({
        method: "get",
        url: "/admin/getEvent?id="+currentId,
        dataType: "json",
        success: function(result) {
            $('#eventType').val(result.event_type).prop("select", true);
            $('#eventCode').val(result.event_code*1);
            $('#eventTitle').val(result.title);
            $('#eventContents').val(result.contents);
            $('#l_text').val(result.choices.left);
            $('#r_text').val(result.choices.right);
            
            let rewards = [];
            for (i in result.rewards) {
                for(j in result.rewards[i]) {
                    rewards.push(result.rewards[i][j]);
                }
            }
            $('.stats > input').each((index, item) => {
                $(item).val(rewards[index]);
            });
            
            $('#leftEvent').val(
                result.next_event.left ? result.next_event.left : 'default'
            ).prop('selected', true);
            $('#rightEvent').val(
                result.next_event.right ? result.next_event.right : 'default'
            ).prop('selected', true);
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