document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.product-image-zoom').forEach(container => {
    const img = container.querySelector('img');
    const zoomLens = document.createElement('div');
    zoomLens.className = 'zoom-lens';
    container.appendChild(zoomLens);

    container.addEventListener('mousemove', function(e) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const lensX = x - 50;
      const lensY = y - 50;

      zoomLens.style.left = lensX + 'px';
      zoomLens.style.top = lensY + 'px';

      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;

      zoomLens.style.backgroundImage = 'url(' + img.src + ')';
      zoomLens.style.backgroundSize = (img.width * 2) + 'px ' + (img.height * 2) + 'px';
      zoomLens.style.backgroundPosition = bgX + '% ' + bgY + '%';
    });

    container.addEventListener('mouseleave', function() {
      zoomLens.style.display = 'none';
    });

    container.addEventListener('mouseenter', function() {
      zoomLens.style.display = 'block';
    });
  });
});
