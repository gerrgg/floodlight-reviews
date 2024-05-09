const handleReviewModal = (async () => {
  const trigger = document.querySelector("#fld-write-review");

  let modal,
    starWrapper,
    starInput,
    closeButton,
    stars,
    modalBackground,
    form,
    loader,
    formAction,
    product,
    review;

  // Hit shopify product API for product details
  const getProductData = async (handle) => {
    const response = await fetch(
      window.Shopify.routes.root + `products/${handle}.js`,
    );
    const data = await response.json();
    return data;
  };

  // destroy the modal
  const destroyReviewModal = () => {
    const modal = document.querySelector("#floodlight-review-modal");
    modal.remove();
  };

  // sets parent class for star ratings and adjust form value
  const handleStarRating = ({ target }) => {
    const rating = parseInt(target.dataset.rating);

    starInput.value = rating;
    starWrapper.className = starInput.value.length
      ? `star-wrapper star-rating-${rating}`
      : "star-wrapper";
  };

  // handle hover effect on stars, does not change form value
  const handleStarRatingHoverOn = ({ target }) => {
    starWrapper.className = `star-wrapper star-rating-${target.dataset.rating}`;
  };

  // handle hovering off stars, does not change form value
  const handleStarRatingHoverOff = ({ target }) => {
    const rating = starInput.value === "" ? "unset" : starInput.value;

    starWrapper.className = `star-wrapper star-rating-${rating}`;
  };

  // sets success flag on modal to show success state
  const handleFormSubmitSuccess = (review) => {
    modal.classList.add("success");
    trigger.classList.add("successful-submit");
  };

  // loops errors and shows relevant error state
  const handleFormSubmitFailure = (review) => {
    for (const [key, value] of Object.entries(review.errors)) {
      const target = modal.querySelector(`.error-text.error-${key}`);
      target.innerText = value;
    }
  };

  // submits form and returns applicable form state
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    modal.classList.add("submitting");

    try {
      const response = await fetch(formAction, {
        method: "POST",
        body: data,
      });

      const dataJSON = await response.json();

      modal.classList.remove("submitting");

      if (response.status === 201) {
        handleFormSubmitSuccess(dataJSON);
      } else {
        handleFormSubmitFailure(dataJSON);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // sets all modal events after form is created and injected into HTML
  const handleModalEvents = () => {
    modal = document.querySelector("#floodlight-review-modal");
    closeButton = modal.querySelector("#close-button");
    starWrapper = modal.querySelector(".star-wrapper");
    starInput = modal.querySelector("#star-rating");
    stars = Array.from(modal.querySelectorAll(".star-wrapper button"));
    modalBackground = modal.querySelector(".modal-background");
    form = modal.querySelector("#review-submit-form");

    closeButton.addEventListener("click", destroyReviewModal);
    modalBackground.addEventListener("click", destroyReviewModal);

    stars.forEach((star) => {
      star.addEventListener("click", handleStarRating);
      star.addEventListener("mouseenter", handleStarRatingHoverOn);
      star.addEventListener("mouseleave", handleStarRatingHoverOff);
    });

    form.addEventListener("submit", handleFormSubmit);
  };

  const getProductReviewByIP = async (productId) => {
    const IPResponse = await fetch("https://api.ipify.org?format=json");
    const { ip } = await IPResponse.json();

    const ReviewResponse = await fetch(`${formAction}${productId}/${ip}`);
    const { data } = await ReviewResponse.json();

    return data;
  };

  // gets product data, creates HTML and sets events
  const createReviewModal = async () => {
    if (review !== null) {
      trigger.classList.add("successful-submit");
    }

    const productVariantId = trigger.dataset.variant;
    const alreadySubmitted = trigger.classList.contains("successful-submit");

    const html = `<div id="floodlight-review-modal" class="modal review-modal ${alreadySubmitted ? "success" : ""}">
    <div class="modal-background"></div>
    <div class="modal-dialog">
      <div class="modal-header">
        <h2>Create Review</h2>
        <button id="close-button"><svg fill="currentcolor" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.002 2.005c5.518 0 9.998 4.48 9.998 9.997 0 5.518-4.48 9.998-9.998 9.998-5.517 0-9.997-4.48-9.997-9.998 0-5.517 4.48-9.997 9.997-9.997zm0 8.933-2.721-2.722c-.146-.146-.339-.219-.531-.219-.404 0-.75.324-.75.749 0 .193.073.384.219.531l2.722 2.722-2.728 2.728c-.147.147-.22.34-.22.531 0 .427.35.75.751.75.192 0 .384-.073.53-.219l2.728-2.728 2.729 2.728c.146.146.338.219.53.219.401 0 .75-.323.75-.75 0-.191-.073-.384-.22-.531l-2.727-2.728 2.717-2.717c.146-.147.219-.338.219-.531 0-.425-.346-.75-.75-.75-.192 0-.385.073-.531.22z" fill-rule="nonzero"/></svg></button>
      </div>
      <div class="modal-body">
      <div class="product-info form-group">
      <img src="${product.media[0].src}" alt="${product.media[0].alt}" width="62" height="62" />
      <p>${product.title}</p>
      </div>
      <hr />
      <div class="loader">
        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
      </div>
      <div class="success-wrapper">
        <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
          viewBox="0 0 50 50" xml:space="preserve">
          <circle style="fill:#25AE88;" cx="25" cy="25" r="25"/>
          <polyline style="fill:none;stroke:#FFFFFF;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;" points="
            38,15 22,33 12,25 "/>
        </svg>
        <h2>Success!</h2>
        <p>Thank you for the review, we sincerely appreciate your feedback.</p>
      </div>
      <form id="review-submit-form">
        <div class="form-row">
          <div class="headline-wrapper form-group form-group-col-2">
            <h3>Your name</h3>
            <input name="user_name" type="text" placeholder="Anonymous" />
            <div class="error-text error-user_name"></div>
          </div>
          <div class="overall-rating form-group form-group-col-2">
            <h3>Overall Rating</h3>
            <input type="hidden" name="rating" id="star-rating" required="true"/>
            <div class="star-wrapper star-rating-unset">
              <button type="button" class="outline" data-rating="1">
                <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></svg>
              </button>
              <button type="button" class="outline" data-rating="2">
                <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></svg>
              </button>
              <button type="button" class="outline" data-rating="3">
                <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></svg>
              </button>
              <button type="button" class="outline" data-rating="4">
                <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></svg>
              </button>
              <button type="button" class="outline" data-rating="5">
                <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></svg>
              </button>
            </div>
            <div class="error-text error-rating"></div>
          </div>
        </div>
        <hr />
        <div class="headline-wrapper form-group">
          <h3>Add a headline</h3>
          <input name="title" type="text" placeholder="What's the most important thing to know?" />
          <div class="error-text error-title"></div>
        </div>
        <hr />
        <div class="review-wrapper form-group">
          <h3>Add a written review</h3>
          <textarea name="reviewContent" placeholder="What did you like or dislike? What did you use this product for?"></textarea>
        </div>
        <hr />
        
        <div class="button-wrapper">
          <button class="button  button--primary">
            Submit
          </button>
        </div>
        <input type="hidden" name="productId" value="gid://shopify/Product/${product.id}">
        <input type="hidden" name="productVariantId" value="gid://shopify/Product/${productVariantId}">
        </form>
      </div>
    </div>
  </div>`;

    document.body.insertAdjacentHTML("beforeend", html);
    handleModalEvents();
  };

  if (trigger) {
    formAction = trigger.dataset.action;
    product = await getProductData(trigger.dataset.product);
    review = await getProductReviewByIP(product.id);
    trigger.addEventListener("click", createReviewModal);
  }
})();
