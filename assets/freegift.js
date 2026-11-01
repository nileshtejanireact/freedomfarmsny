/**
 * Auto Free Freezer Logic
 * - Checks cart for 1/4, 1/2, or whole cow products
 * - Auto-adds free freezer ($500 value, price set to $0 via discount or variant)
 * - Removes freezer if no cow products remain
 */

var FREE_FREEZER_VARIANT_ID = 48525969359031; // ✅ Replace with your actual freezer variant ID

// ✅ Replace these with your actual cow product variant IDs or product IDs
var COW_PRODUCT_KEYWORDS = ['Half Cow', 'Whole Cow', 'Quarter Cow', 'Eighth Cow'];

var isUpdatingCart = false; // prevent infinite loops

// ─────────────────────────────────────────
// 1. Fetch current cart
// ─────────────────────────────────────────
function getCart() {
  return fetch('/cart.js')
    .then(function(res) {
      if (!res.ok) throw new Error('Cart fetch failed');
      return res.json();
    });
}

// ─────────────────────────────────────────
// 2. Check if cart has a cow product
// ─────────────────────────────────────────
function cartHasCowProduct(cart) {
  return cart.items.some(function(item) {
    var title = (item.title + ' ' + (item.variant_title || '')).toLowerCase();
    return COW_PRODUCT_KEYWORDS.some(function(keyword) {
      return title.indexOf(keyword.toLowerCase()) !== -1;
    });
  });
}

// ─────────────────────────────────────────
// 3. Check if freezer is already in cart
// ─────────────────────────────────────────
function cartHasFreezer(cart) {
  return cart.items.some(function(item) {
    return item.variant_id === FREE_FREEZER_VARIANT_ID;
  });
}

// ─────────────────────────────────────────
// 4. Add free freezer to cart
// ─────────────────────────────────────────
function addFreezer() {
  return fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{
        id: FREE_FREEZER_VARIANT_ID,
        quantity: 1,
        properties: {
          _free_item: 'true',          // hidden property — use in theme if needed
          'Why free?': 'Free with your cow purchase!' // visible to customer
        }
      }]
    })
  }).then(function(res) {
    if (!res.ok) throw new Error('Add freezer failed');
    return res.json();
  });
}

// ─────────────────────────────────────────
// 5. Remove free freezer from cart
// ─────────────────────────────────────────
function removeFreezer(cart) {
  var freezerItem = cart.items.find(function(item) {
    return item.variant_id === FREE_FREEZER_VARIANT_ID;
  });

  if (!freezerItem) return Promise.resolve();

  return fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: freezerItem.key,  // use item key (most reliable)
      quantity: 0
    })
  }).then(function(res) {
    if (!res.ok) throw new Error('Remove freezer failed');
    return res.json();
  });
}

// ─────────────────────────────────────────
// 6. Main logic — run after every cart change
// ─────────────────────────────────────────
function syncFreezer() {
  if (isUpdatingCart) return;
  isUpdatingCart = true;

  getCart()
    .then(function(cart) {
      var hasCow     = cartHasCowProduct(cart);
      var hasFreezer = cartHasFreezer(cart);

      console.log('[freezer] has cow:', hasCow, '| has freezer:', hasFreezer);

      if (hasCow && !hasFreezer) {
        // Add the free freezer
        console.log('[freezer] adding free freezer...');
        return addFreezer().then(function() {
          console.log('[freezer] freezer added ✅');
          // ✅ Refresh cart UI after adding
          refreshCartUI();
        });

      } else if (!hasCow && hasFreezer) {
        // Remove the freezer if no cow products left
        console.log('[freezer] removing freezer (no cow in cart)...');
        return removeFreezer(cart).then(function() {
          console.log('[freezer] freezer removed ✅');
          refreshCartUI();
        });

      } else {
        console.log('[freezer] no change needed');
      }
    })
    .catch(function(err) {
      console.error('[freezer] error:', err);
    })
    .finally(function() {
      isUpdatingCart = false;
    });
}

// ─────────────────────────────────────────
// 7. Refresh cart UI (theme-specific)
// ─────────────────────────────────────────
function refreshCartUI() {
  // Option A — triggers most Ajax cart themes to re-render
  $(document).trigger('cart:refresh');
  $(document).trigger('cart:updated');

  // Option B — if your theme uses a custom event
  document.dispatchEvent(new CustomEvent('cart:updated'));

  // Option C — if your theme has a specific refresh function
  // CartJS.getCart();        // for CartJS themes
  // theme.cart.getCart();    // for some custom themes
  // Shopify.onError = ...    // for older themes
}

// ─────────────────────────────────────────
// 8. Hook into cart events
// ─────────────────────────────────────────
$(document).ready(function() {

  // Run once on page load
  syncFreezer();

  // Run after any Ajax cart add/remove/update
  $(document).on(
    'cart:updated cart:refresh ajaxCart:afterCartLoad',
    function() {
      syncFreezer();
    }
  );

  // Hook into add to cart buttons directly (backup trigger)
  $(document).on('click', '[data-add-to-cart], .add-to-cart, [name="add"]', function() {
    setTimeout(syncFreezer, 800); // slight delay for cart to update first
  });

  // Hook into remove/quantity change buttons
  $(document).on('click', '.cart__remove, [data-cart-item-remove]', function() {
    setTimeout(syncFreezer, 800);
  });

  $(document).on('change', '.cart__qty-input, [data-quantity-input]', function() {
    setTimeout(syncFreezer, 800);
  });

});