window.addEventListener("load", (event) => {
  var buyNowButton = document.querySelector(".cstm-button");
  var addToCartButton = document.querySelector(".add_to_cart_button");

  buyNowButton.addEventListener('click', function() {
    addToCartButton.click();
    setTimeout(function() {
      window.location.href = '/checkout';
    }, 1000); 
  });
});
