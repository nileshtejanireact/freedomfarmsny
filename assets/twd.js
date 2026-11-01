document.addEventListener("DOMContentLoaded", () => {
  var buyNowButton = document.querySelector(".cstm-button");
  var addToCartButton = document.querySelector(".add_to_cart_button");

  if (buyNowButton && addToCartButton) {
    buyNowButton.addEventListener('click', function() {
      addToCartButton.click();
      setTimeout(function() {
        window.location.href = '/checkout';
      }, 1000);
    });
  }

  var descriptionButtons = document.querySelectorAll('.btnToggleAccordian_X7z3');
  var mobileDescription = window.matchMedia('(max-width: 991px)');

  function syncProductDescriptions() {
    descriptionButtons.forEach(function(button) {
      var description = document.getElementById(button.getAttribute('aria-controls'));
      if (!description) return;

      description.classList.remove('is-open');
      button.setAttribute('aria-expanded', mobileDescription.matches ? 'false' : 'true');
    });
  }

  descriptionButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      if (!mobileDescription.matches) return;
      var description = document.getElementById(button.getAttribute('aria-controls'));
      if (!description) return;

      var isOpen = description.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });

  syncProductDescriptions();
  if (mobileDescription.addEventListener) {
    mobileDescription.addEventListener('change', syncProductDescriptions);
  } else if (mobileDescription.addListener) {
    mobileDescription.addListener(syncProductDescriptions);
  }
});
