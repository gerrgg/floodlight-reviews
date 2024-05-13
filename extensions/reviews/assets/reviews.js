const handleReviews = (async () => {
  let reviews = [];
  let limit = 5;
  let html, formAction, productId, emptyReviewsContent, userProfile, sort;
  const root = document.querySelector("#fld-reviews .review-wrapper");
  const loader = `<div class="loader"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>`;
  const sortSelect = document.querySelector("select#sort-by");
  const wrapper = root.querySelector(".reviews-inject-location");
  const filterHeader = root.querySelector("#filter-header > span");

  const getProductReviewsByID = async () => {
    wrapper.innerHTML = loader;
    const ReviewResponse = await fetch(
      `${formAction}${productId}/${sort}/${limit}`,
    );
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

  const handleHelpfulButtonClick = async ({ target }) => {
    const helpfulButton = target;
    const helpfulButtonWrapper = target.parentElement;
    const id = helpfulButton.dataset.id;
    helpfulButtonWrapper.innerHTML = `<small>Sending feedback...</small>`;

    const response = await fetch(`${formAction}/${id}/helpful`, {
      method: "POST",
    });

    const { status } = await response.json();

    if (status === 201) {
      helpfulButtonWrapper.innerHTML = `<small class="success"><svg xmlns="http://www.w3.org/2000/svg" width="18" fill="currentcolor" height="18" viewBox="0 0 24 24"><path d="M0 0v24h24v-24h-24zm11 17l-5-5.299 1.399-1.43 3.574 3.736 6.572-7.007 1.455 1.403-8 8.597z"/></svg>Thank you for your feedback<small>`;
    } else {
      helpfulButtonWrapper.innerHTML = `<small class="error"><svg xmlns="http://www.w3.org/2000/svg" width="18" fill="currentcolor"  height="18" viewBox="0 0 24 24"><path d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z"/></svg>Something went wrong, please try again later<small>`;
    }
  };

  const handleHelpfulButtons = async () => {
    const helpfulWrappers = Array.from(
      document.querySelectorAll(".helpful-wrapper"),
    );
    helpfulWrappers.forEach((helpfulWrapper) => {
      const helpfulButton = helpfulWrapper.querySelector(".helpful-button");
      helpfulButton.addEventListener("click", handleHelpfulButtonClick);
    });
  };

  const handleLoadMoreButton = () => {
    const loadMoreButton = document.querySelector(".load-more-reviews");
    limit += 5;

    if (loadMoreButton) {
      loadMoreButton.addEventListener("click", async () => {
        const height = wrapper.getBoundingClientRect().height;
        wrapper.style.minHeight = `${height}px`;
        await updateReviewsWrapper();
        wrapper.style.minHeight = "unset";
      });
    }
  };

  const updateReviewsWrapper = async () => {
    try {
      reviews = await getProductReviewsByID();
      if (reviews && reviews.length > 0) {
        await populateReviewsWrapper();
        await handleHelpfulButtons();
        await handleLoadMoreButton();
      } else {
        handleErrorState();
      }
    } catch (e) {
      handleErrorState();
    }
  };

  const handleSortByChange = async ({ target }) => {
    sort = target.value;
    limit = 5;

    const labels = {
      recent: "Most recent",
      top: "Top rated",
      helpful: "Most helpful",
    };
    filterHeader.innerText = labels[sort];
    await updateReviewsWrapper();
  };

  const handleErrorState = () => {
    filterHeader.parentElement.style.display = "none";
    wrapper.innerHTML = ` <div class="no-reviews">
      ${emptyReviewsContent}
      <div class="button-wrapper">
        <button class="button button-primary fake-review-trigger">Share your thoughts</button>
      </div>
    </div>`;

    const fakeReviewTrigger = document.querySelector(".fake-review-trigger");
    const trigger = document.querySelector("#fld-write-review");

    if (fakeReviewTrigger) {
      fakeReviewTrigger.addEventListener("click", () => {
        trigger.click();
      });
    }
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
                <h3 class="review-title">
                  <strong>${review.title}</strong>
                </h3>
              </div>
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

    if (reviews.length === limit) {
      wrapper.insertAdjacentHTML(
        "beforeend",
        `<div class="button-wrapper"><button" class="load-more-reviews button button--primary">Load More</button></div>`,
      );
    }
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
