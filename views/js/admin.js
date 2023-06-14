var url_href = window.location.href;

var url = new URL(url_href);
var management = url.searchParams.get("type");

switch (management) {
    case 'users':
        $('.nav-item:nth-child(2) > .nav-link').addClass('active');
        break;
    case 'events':
        $('.nav-item:nth-child(3) > .nav-link').addClass('active');
        break;
    default:
        $('.nav-item:nth-child(1) > .nav-link').addClass('active');
        break;
}

$('#addForm').submit(function(){
    console.log('submit')
});