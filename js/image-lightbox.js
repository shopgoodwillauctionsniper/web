// Image Lightbox for Carousel Images
document.addEventListener('DOMContentLoaded', function () {
    // Get or create the modal
    let modal = document.getElementById('imageLightboxModal');

    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'imageLightboxModal';
        modal.tabIndex = -1;
        modal.setAttribute('aria-labelledby', 'imageLightboxModalLabel');
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content bg-dark">
                    <div class="modal-header border-0">
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body d-flex align-items-center justify-content-center p-0">
                        <img id="lightboxImage" src="" alt="" class="img-fluid" style="max-height: 90vh; max-width: 100%; object-fit: contain;">
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    const lightboxImage = document.getElementById('lightboxImage');
    const bsModal = new bootstrap.Modal(modal);

    // Add click handlers to all carousel images and any standalone lightbox images
    const carouselImages = document.querySelectorAll('#heroCarousel .carousel-item img, img.lightbox-img');

    carouselImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Set the image source and alt text
            lightboxImage.src = this.src;
            lightboxImage.alt = this.alt;

            // Show the modal
            bsModal.show();
        });
    });

    // Close modal on background click
    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.classList.contains('modal-body')) {
            bsModal.hide();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            bsModal.hide();
        }
    });
});
