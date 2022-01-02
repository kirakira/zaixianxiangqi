function toggleMenu() {
    var menu_span = document.getElementById("menu-text");
    var menu_content = document.getElementById("menu-content");
    if (menu_content.style.display == "grid") {
      menu_content.style.display = "none";
      menu_span.innerHTML = 'menu <span class="menu-toggle">[+]</span>';
    } else {
      menu_content.style.display = "grid";
      menu_span.innerHTML = 'menu <span class="menu-toggle">[-]</span>';
    }
}
