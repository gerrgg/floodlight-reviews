const handleReviews = (async () => {
  let html,
    reviews,
    formAction,
    productId,
    emptyReviewsContent,
    userProfile,
    sort;
  const root = document.querySelector("#fld-reviews .review-wrapper");
  const loader = `<div class="loader"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>`;
  const sortSelect = document.querySelector("select#sort-by");
  const wrapper = root.querySelector(".reviews-inject-location");
  const filterHeader = root.querySelector("#filter-header > span");

  const getProductReviewsByID = async () => {
    wrapper.innerHTML = loader;
    const ReviewResponse = await fetch(`${formAction}${productId}/${sort}`);
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

  const updateReviewsWrapper = async () => {
    try {
      reviews = await getProductReviewsByID();
      await populateReviewsWrapper(reviews);

      const helpfulWrapper = document.querySelector(".helpful-wrapper");
      const helpfulButtonWrapper =
        helpfulWrapper.querySelector(".button-wrapper");
      const helpfulButton = helpfulWrapper.querySelector(".helpful-button");

      helpfulButton.addEventListener("click", async () => {
        const id = helpfulButton.dataset.id;
        helpfulButtonWrapper.innerHTML = `<small>Sending feedback...</small>`;

        const response = await fetch(`${formAction}/${id}/helpful`, {
          method: "POST",
        });

        const { status } = await response.json();

        console.log(status);

        if (status === 201) {
          helpfulButtonWrapper.innerHTML = `Thank you for your feedback`;
        } else {
          helpfulButtonWrapper.innerHTML = `Something went wrong, please try again later`;
        }
      });
    } catch (e) {
      handleErrorState();
    }
  };

  const handleSortByChange = async ({ target }) => {
    sort = target.value;

    const labels = {
      recent: "Most recent",
      top: "Top rated",
    };
    filterHeader.innerText = labels[sort];
    await updateReviewsWrapper();
  };

  const handleErrorState = () => {
    filterHeader.parentElement.style.display = "none";
    wrapper.innerHTML = ` <div class="no-reviews">
      ${emptyReviewsContent}
    </div>`;
  };

  const populateReviewsWrapper = async () => {
    if (reviews && reviews === null) {
      html = `
      <div class="no-reviews">
        ${emptyReviewsContent}
      </div>`;
    } else {
      html = reviews.map((review) => {
        let starsHTML = buildStarsHTML(review.rating);

        const reviewHTML = `
          <div class="review card">
            <div class="card-body">
              <div class="review-header">
                <img src="${userProfile}"  width="35" height="35"/>
                <h4 class="reviewer-name">${review.user_name}</h4>
              </div>
              <div class="star-wrapper">
                ${starsHTML}
                </div>
                <h3 class="review-title">
                  <strong>${review.title}</strong>
                </h3>
              <div class="mb-2 review-date">
                <small>Reviewed on ${new Date(review.createdAt).toDateString()}</small>
              </div>
              <p class="my-0 review-content">${review.reviewContent}</p>
              <div class="helpful-wrapper">
                <small style="display: ${review.helpful > 0 ? "block" : "none"}">${review.helpful} people found this helpful</small>
                <div class="button-wrapper">
                  <button class="button button--secondary button-small helpful-button" data-id="${review.id}">Helpful</button>
                </div>
              </div>
            </div>
          </div>
        `;

        return reviewHTML;
      });
    }

    wrapper.innerHTML = html.join(" ");
  };

  if (sortSelect) {
    sort = sortSelect.value;
    sortSelect.addEventListener("change", handleSortByChange);
  }

  if (root) {
    formAction = root.dataset.api;
    productId = root.dataset.product;
    emptyReviewsContent = root.dataset.emptyreviewscontent;
    userProfile = root.dataset.userimg;

    await updateReviewsWrapper();
  }
})();
