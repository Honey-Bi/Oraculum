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
$('.addEvent').click(function() {
    if (actionType == "insert") {
        return;
    };
    
    actionType = "insert";
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

    $('.overStats').each((index, item) => {
        $(item).val('')
    });

    $('.underStats').each((index, item) => {
        $(item).val('')
    });
    $('input[name=prerequisites]').val();

    $('#eventType').val('random').prop('selected', true);
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
            id: currentId,
            type: actionType
        },
        dataType: "json",
        success: function (result) {
            // alert('code: ' + result.code + '\n' + result.message);
            // return location.reload();
        },

        error: function(result, status, error) {
            return alert('code: ' + status+'\n' + error);
        }
    });
});

let currentId;
$('.editEvent').click(function(){
    actionType = "update";
    $('#editBtn').css('display', 'block');
    $('#saveBtn').css('display', 'none');
    currentId = $(this).val();
    $.ajax({
        method: "get",
        url: "/admin/getEvent?id="+currentId,
        dataType: "json",
        success: function(result) {
            console.log(result);
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

$('#over, #under, #hold').click(function() {
    let className = $(this).attr('id');
    if ($(this).is(':checked')) {
        $('.'+className).css('display', 'flex');
    } else {
        $('.'+className).css('display', 'none');
    }
});

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