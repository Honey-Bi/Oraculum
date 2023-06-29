let url_parameter = new URLSearchParams(location.search);
$(document).ready(function () {
    // console.log($('#select_type').val(type+'').prop('selected', true));
    var select_type = url_parameter.get('select_type')
    if (select_type) {
        $('#select_type').val(select_type).prop('selected', true);
    }
    $('#search_text').val(url_parameter.get('search_text'))

    if (url_parameter.get('side')) {
        $('.menu-btn').click();
    }
});

$('#userForm').submit(function(){
    let inputName = $('#add_name').val(),
        inputId = $('#add_email').val(),
        password = $('#add_password').val();

    $.ajax({
        method:"POST",                                           
        url:"/account/register-confirm",
        data: {
            name: inputName,
            id: inputId,
            password: password,
            idType: 'test'

        },
        dataType: "json",
        success: function(result){
            alert("정상적으로 추가되었습니다.");
        },
        error: function(result, status, error) {
            console.log(error)
        },
        complete : function() {
            location.reload();
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
$('.add_event').click(function() {
    if (actionType == "insert") {
        return;
    };
    
    actionType = "insert";
    $('#id').val('')
    $('#eventCode').val('');
    $('#editBtn').css('display', 'none');
    $('#saveBtn').css('display', 'block');

    $('#over').prop("checked", false);
    $('#under').prop("checked", false);
    $('#hold').prop("checked", false);
    $('.over').css('display', 'none');
    $('.under').css('display', 'none');
    $('.hold').css('display', 'none');
    deleteAllItem();

    $('.overStats, .underStats').each((index, item) => {
        $(item).val('')
    });

    $('input[name=prerequisites]').val();

    $('#eventType').val('random').prop('selected', true);
    $('#eventType').removeAttr('disabled');
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

$('.add_user').click(function() {
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
                    if (obj[this.name]) { //동일한 name이 존재할시 배열로 바꿈
                        if (!Array.isArray(obj[this.name])) {
                            obj[this.name] = [obj[this.name], this.value]
                        } else {
                            obj[this.name].push(this.value);
                        }
                    } else {
                        obj[this.name] = this.value;
                    }
                });
            }//if ( arr ) {
        }
    } catch (e) {
        alert(e.message);
    }
    return obj; 
};

$('#eventForm').submit(function() {
    // console.log($(this).serializeObject());
    $.ajax({
        method:'POST',                                           
        url: '/admin/actionEvent',
        data: {
            formData: $(this).serializeObject(),
            actionType: actionType,
            is_ending: $('#is_ending').val()
        },
        dataType: "json",
        success: function (result) {
            alert('code: ' + result.code + '\n' + result.message);
        },
        error: function(result, status, error) {
            return alert('code: ' + status+'\n' + error);
        },
        complete : function() {
            location.reload();
        }
    });
});

$('#updateUserForm').submit(function() {
    // console.log($(this).serializeObject());
    $.ajax({
        method:'POST',                                           
        url: '/admin/updateUser',
        data: {
            formData: $(this).serializeObject()
        },
        dataType: "json",
        success: function (result) {
            alert('code: ' + result.code + '\n' + result.message);
        },
        error: function(result, status, error) {
            return alert('code: ' + status+'\n' + error);
        },
        complete : function() {
            location.reload();
        }
    });
});

$('#changePw').click(function() {
    if(confirm('정말 변경하시겠습니까?')) {
        $('#update_pw').removeAttr('disabled');
        $(this).attr('disabled', true);
    }
});

$('.edit_user').click(function() {
    $('#id').val($(this).val());
    $.ajax({
        method: "get",
        url: "/admin/getData?type=user&id="+$(this).val(),
        dataType: "json",
        success: function(result) {
            $('#userId').val(result.userId._id);
            $('#update_pw').attr('disabled', true);
            $('#changePw').removeAttr('disabled')
            $('#update_name').val(result.userId.name);
            $('#update_email').val(result.userId.email);
            $('input[name=fuel]').val(result.fuel);
            $('input[name=resource]').val(result.resource);
            $('input[name=technology]').val(result.technology);
            $('input[name=risk]').val(result.risk);
            $('#update_date').val(result.userId.created);
            $('#update_nowEvent').val(result.nowEvent).prop('selected', true);
        },
        error: function(result, status, error) {
            console.log(error);
        }
    });
});

$('.edit').click(function() {
    actionType = "update";
    $('#editBtn').css('display', 'block');
    $('#saveBtn').css('display', 'none');
});

$('.edit_event').click(function(){
    setEventControl($(this).val());
});

$('.clone_event').click(function() {
    if(!confirm('이벤트를 복제하시겠습니까?')) return;
    setEventControl($(this).val());
    actionType = "clone";
    $('#eventType').removeAttr('disabled');
    $('#is_ending').removeAttr('disabled');
    $('#eventForm').submit();
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
            type: new URLSearchParams(location.search).get('type')
        },
        dataType: "json",
        success: function (result) {
            // console.log(result);
            alert('code: ' + result.code + '\n' + result.message);
        },
        error: function(result, status, error) {
            console.log(error);
            alert('code: ' + result.status+'\n' + result.responseJSON.message);
        },
        complete : function() {
            location.reload();
        }

    });
});

$('#over, #under, #hold').click(function() {
    let className = $(this).attr('id');
    if ($(this).is(':checked')) {
        $('.'+className).css('display', 'flex');
    } else {
        $('.'+className).css('display', 'none');
    }
});

$('.menu-btn ').click(function() {
    if($(this).hasClass('active')) {
        $(this).removeClass('active').removeAttr('style');
        $('.container').css({
            'margin-left': 'calc(198.42px + 32px + 1.5rem)',
            'max-width': 'calc(100% - 198.42px - 32px - 1.5rem)'
        });
        $('.menu').css('display', 'block').addClass('d-flex');
        $('.b-example-divider').css({opacity: 1}, 250);
    } else {
        $(this).addClass('active').css('left', 0);
        $('.container').css({
            'margin-left': '0',
            'max-width': '100%'
        });
        $('.menu').css('display', 'none').removeClass('d-flex');
        $('.b-example-divider').css({opacity: 0}, 250);
    }
});

$('#eventType').change(function() {
    if($(this).val() == 'ending') {
        $('#is_ending').val('true').prop('selected', true);
    } else {
        $('#is_ending').val('false').prop('selected', true);
    }
    isEnding($(this).val());
});

$('#searchForm').submit(function() {
    type = new URLSearchParams(location.search).get('type')
    location.href = location.pathname + '?' + $(this).serialize()
});

function setEventControl(id) {
    $('#eventId').val(id);
    $.ajax({
        method: "get",
        url: "/admin/getData?type=event&id="+id,
        dataType: "json",
        async : false,
        success: function(result) {
            console.log(result);
            $('#eventType').attr('disabled', true);
            $('#eventCode').val(result.event_code);
            $('#eventType').val(result.event_type).prop("select", true);
            $('#eventTitle').val(result.title);
            $('#eventContents').val(result.contents);
            $('#l_text').val(result.choices.left);
            $('#r_text').val(result.choices.right);

            deleteAllItem()
            count = 0;
            for (i in result.prerequisites.over) {
                $($('.overStats')[count++]).val(result.prerequisites.over[i]);
            }
            count = 0;
            for (i in result.prerequisites.under) {
                $($('.underStats')[count++]).val(result.prerequisites.under[i]);
            }

            $('input[name=prerequisites]').val(result.prerequisites.hold[0]);
            for (let i = 1; i < result.prerequisites.hold.length; i++) {
                addItem(result.prerequisites.hold[i])
            }


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


            isEnding(result.event_type);
            $('#is_ending').val(result.is_ending+'').prop('selected', true);
            
        },
        error: function(result, status, error) {
            console.log(error);
        }
    });
}
function isEnding(type) {
    if (type == 'link') {
        $('#is_ending').removeAttr('disabled');
    } else {
        $('#is_ending').attr('disabled', true);
    }
}
function addItem(text) {
    let content = '<div class="input-group hold" style="display:flex">';
        content += '<input type="text" name="prerequisites" id="" autocomplete="off" class="form-control prerequisites" value="'+ text +'">';
        content += '<button class="btn btn-outline-danger" onclick="deleteItem(this)" type="button" id="deletePrerequisites">delete</button></div';
    $('.hold:last').after(content);
}

function deleteItem(item) {
    $(item).parent().remove();
}

function deleteAllItem() {
    $('.hold').each((index, item) => {
        if(index > 0) $(item).remove();
    });
}


