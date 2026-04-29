function toggleMenu() {
  var nav = document.getElementById('mainNav');
  var menuBtn = document.getElementById('menuBtn');
  if (nav && menuBtn) {
    nav.classList.toggle("active");
    menuBtn.classList.toggle("active");
    document.body.classList.toggle("menu-open");
  }
}

function closeMenu() {
  var nav = document.getElementById('mainNav');
  var menuBtn = document.getElementById('menuBtn');
  if (nav) nav.classList.remove("active");
  if (menuBtn) menuBtn.classList.remove("active");
  document.body.classList.remove("menu-open");
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-links > li > a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      if (link.parentElement.classList.contains('dropdown')) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.dropdown').forEach(function(d) {
          if (d !== link.parentElement) d.classList.remove('open');
        });
        link.parentElement.classList.toggle('open');
        return false;
      } else {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      }
    });
  });

  document.querySelectorAll('.dropdown-content a').forEach(function(link) {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        closeMenu();
      }
    });
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeMenu();
      document.querySelectorAll('.dropdown').forEach(function(d) {
        d.classList.remove('open');
      });
    }
  });
});
