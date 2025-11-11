
var focused_button = null;
function create_onclick_events(){
    let buttons = document.getElementsByClassName("spawn_button");
    console.log(buttons)
    for (let i = 0; i < buttons.length; i++){
        console.log(buttons[i].id)

    }
}


window.addEventListener("load", function() {
  create_onclick_events()
});

