const handleReviews = (async () => {
  let html, reviews, formAction, productId, emptyReviewsContent, userProfile;
  const root = document.querySelector("#fld-reviews .review-wrapper");
  const loader = `<div class="loader"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>`;

  const getProductReviewsByID = async (productId) => {
    const ReviewResponse = await fetch(`${formAction}${productId}/`);
    const { data } = await ReviewResponse.json();
    return data;
  };

  const buildStarsHTML = (rating) => {
    let array = Array.from({ length: 5 }).map((_, i) => {
      return i + 1 <= rating
        ? `<span>
        <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
      </span>`
        : `<span>
        <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></svg>
      </span>`;
    });

    return array.join(" ");
  };

  const convertDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
  };

  const populateReviewsWrapper = async () => {
    root.innerHTML = loader;
    root.classList.add("loading");
    reviews = await getProductReviewsByID(productId);

    console.log(reviews);

    if (reviews && reviews === null) {
      html = `
      <div class="no-reviews">
        ${emptyReviewsContent}
      </div>`;
    } else {
      html = reviews.map((review) => {
        let starsHTML = buildStarsHTML(review.rating);

        const reviewHTML = `
          <div class="review card mb-3 py-2">
            <div class="card-body">
              <div class="review-header">
                <img src="${userProfile}"  width="35" height="35"/>
                <h4 class="reviewer-name">${review.user_name}</h4>
              </div>
              <div class="star-wrapper">
                ${starsHTML}
                <h3 class="mx-3 my-0 mb-2 review-title">
                  <strong>${review.title}</strong>
                </h3>
              </div>
              <div class="mb-2 review-date">
                <small>Reviewed on ${new Date(review.createdAt).toDateString()}</small>
              </div>
              <p class="my-0 review-content">${review.reviewContent}</p>
            </div>
          </div>
      `;

        return reviewHTML;
      });
    }

    root.innerHTML = html;
  };

  if (root) {
    formAction = root.dataset.api;
    productId = root.dataset.product;
    emptyReviewsContent = root.dataset.emptyreviewscontent;
    userProfile = root.dataset.userimg;
    populateReviewsWrapper();
  }
})();
