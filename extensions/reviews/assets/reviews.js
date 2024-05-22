const handleReviews = (async () => {
  let reviews = [];
  let limit = 5;
  let html,
    formAction,
    productId,
    emptyReviewsContent,
    userProfile,
    sort,
    perPage,
    showHistogram,
    allReviews;

  const root = document.querySelector("#fld-reviews .review-wrapper");
  const loader = `<div class="loader"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>`;
  const sortSelect = document.querySelector("select#sort-by");
  const wrapper = root.querySelector(".reviews-inject-location");
  const filterHeader = root.querySelector("#filter-header > span");
  const filtersWrapper = root.querySelector(".filters");
  const overviewStars = document.querySelector(
    "#fld-reviews .review-overview .star-wrapper",
  );
  const overviewRatings = document.querySelector(
    "#fld-reviews .review-overview .number-of-ratings",
  );
  const starRatingTop = document.querySelector(".star-rating-top");
  const reviewsBreakdown = document.querySelector(".reviews-breakdown");

  // get all product reviews
  const getAllProductReviews = async () => {
    wrapper.innerHTML = loader;
    const ReviewResponse = await fetch(`${formAction}${productId}/`);
    const { data } = await ReviewResponse.json();
    return data;
  };

  // gets product reviews based on sort and limit
  const getSortedProductReviews = async () => {
    wrapper.innerHTML = loader;
    const ReviewResponse = await fetch(
      `${formAction}${productId}/${sort}/${limit}`,
    );
    const { data } = await ReviewResponse.json();
    return data;
  };

  // generates each reviews star rating, the size of the stars can be passed as a parameter
  const buildStarsHTML = (rating, size = 18) => {
    let array = Array.from({ length: 5 }).map((_, i) => {
      return i + 1 <= rating
        ? `<span>
        <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
      </span>`
        : `<span>
        <svg fill="currentcolor" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z"/></svg>
      </span>`;
    });

    return array.join(" ");
  };

  // click action that sends a POST to the helpful route and returns feedback
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

  // sets click events on helpful buttons
  const handleHelpfulButtons = async () => {
    const helpfulWrappers = Array.from(
      document.querySelectorAll(".helpful-wrapper"),
    );
    helpfulWrappers.forEach((helpfulWrapper) => {
      const helpfulButton = helpfulWrapper.querySelector(".helpful-button");
      helpfulButton.addEventListener("click", handleHelpfulButtonClick);
    });
  };

  // click event setup to increase the amount of reviews returned by the sorted review route
  const handleLoadMoreButton = () => {
    const loadMoreButton = document.querySelector(".load-more-reviews");
    limit += perPage;

    if (loadMoreButton) {
      loadMoreButton.addEventListener("click", async () => {
        const height = wrapper.getBoundingClientRect().height;
        wrapper.style.minHeight = `${height}px`;
        await updateReviewsWrapper();
        wrapper.style.minHeight = "unset";
      });
    }
  };

  // calculates the average of an array
  const averageRating = (array) => array.reduce((a, b) => a + b) / array.length;

  // updates the ratings overview with average rating and star html
  const populateOverviewWrapper = async () => {
    const rating = Math.round(averageRating(allReviews.map((r) => r.rating)));

    const html =
      buildStarsHTML(rating, 24) +
      ` <span class="star-label">${rating} out of 5</span>`;
    overviewStars.innerHTML = html;

    overviewRatings.innerHTML = `<small>${allReviews.length} global ratings</small>`;
  };

  // optionally generates a histogram of star ratings
  const populateReviewsBreakdown = async () => {
    const ratings = [0, 0, 0, 0, 0];

    allReviews.forEach((r) => (ratings[r.rating - 1] += 1));

    ratings.reverse();
    const tableRowsHTML = ratings.map(
      (rating, i) => `
    <tr>
      <td>${ratings.length - i} star</td>
      <td><div class="progress-bar"><span style="width: ${parseInt((rating / allReviews.length) * 100)}%"></span></div></td>
      <td>${parseInt((rating / allReviews.length) * 100)}%</td>
    </tr>
    `,
    );

    reviewsBreakdown.innerHTML = `<table>${tableRowsHTML.join(" ")}</table>`;
  };

  const handleReadMoreButtons = async () => {
    const readMoreButtons = Array.from(
      document.querySelectorAll(".review .review-content .read-more-button"),
    );

    readMoreButtons.forEach((button) => {
      button.addEventListener("click", () => {
        button.parentElement.classList.add("show-full-review");
      });
    });
  };

  // gets reviews and updates all relevant html, if something goes wrong defaults to error state
  const updateReviewsWrapper = async () => {
    try {
      reviews = await getSortedProductReviews();
      if (reviews && reviews.length > 0) {
        await populateReviewsWrapper();
        await populateOverviewWrapper();
        if (showHistogram === "true") {
          await populateReviewsBreakdown();
        }
        await handleHelpfulButtons();
        await handleReadMoreButtons();
        await handleLoadMoreButton();
      } else {
        handleErrorState();
      }
    } catch (e) {
      handleErrorState();
    }
  };

  // updates sort and limit before regenerating the html
  const handleSortByChange = async ({ target }) => {
    sort = target.value;
    limit = perPage;

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

    filtersWrapper.style = "display: none";
    overviewStars.style = "display: none;";
    overviewRatings.style = "display: none;";
    // overview.style = "display: none";

    const fakeReviewTrigger = document.querySelector(".fake-review-trigger");
    const trigger = document.querySelector("#fld-write-review");

    if (fakeReviewTrigger) {
      fakeReviewTrigger.addEventListener("click", () => {
        trigger.click();
      });
    }
  };

  function truncateString(str, length) {
    if (length >= str.length) {
      return {
        truncated: str,
        remaining: "",
      };
    }

    // Find the last space within the desired length
    let end = str.lastIndexOf(" ", length);

    // If no space is found within the length, use the full length
    if (end === -1) {
      end = length;
    }

    let truncated = str.slice(0, end).trim();
    let remaining = str.slice(end).trim();

    return {
      truncated: truncated,
      remaining: remaining,
    };
  }

  // generates the html for the list of reviews
  const populateReviewsWrapper = async () => {
    if (reviews && reviews === null) {
      html = `
      <div class="no-reviews">
        ${emptyReviewsContent}
      </div>`;
    } else {
      html = reviews.map((review) => {
        let starsHTML = buildStarsHTML(review.rating);
        const { truncated, remaining } = truncateString(
          review.reviewContent,
          255,
        );

        let reviewText = truncated;

        if (remaining.length) {
          reviewText += `<span class="ellipsis">...</span><span class="remaining"> ${remaining}</span> <button class=" read-more-button">Read more</button>`;
        }

        const reviewHTML = `
          <div class="review card">
            <div class="card-body">
              <div class="review-header">
                <img src="${userProfile}"  width="35" height="35"/>
                <h4 class="reviewer-name">${review.user_name}</h4>
              </div>
              <div class="star-wrapper">
                <div class="stars">
                ${starsHTML}
                </div>
                <h3 class="review-title">
                  <strong>${review.title}</strong>
                </h3>
              </div>
              <div class="mb-2 review-date">
                <small>Reviewed on ${new Date(review.createdAt).toDateString()}</small>
              </div>
              <p class="my-0 review-content">${reviewText}</p>
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

    // conditionally renders a load more button based on the reviews shown and how many there are total
    if (limit < allReviews.length) {
      wrapper.insertAdjacentHTML(
        "beforeend",
        `<div class="button-wrapper load-more-button-wrapper"><button" class="load-more-reviews button button--primary">Load More</button></div>`,
      );
    }
  };

  const updateStarRatingTop = () => {
    const rating = Math.round(averageRating(allReviews.map((r) => r.rating)));
    const html =
      buildStarsHTML(rating, 24) +
      `<span class="ratings-count">(${allReviews.length})</span>`;
    starRatingTop.innerHTML = html;
  };

  // sets change event on select
  if (sortSelect) {
    sort = sortSelect.value;
    sortSelect.addEventListener("change", handleSortByChange);
  }

  // assigns all data passed from liquid to variables for use in application
  if (root) {
    formAction = root.dataset.api;
    productId = root.dataset.product;
    emptyReviewsContent = root.dataset.emptyreviewscontent;
    userProfile = root.dataset.userimg;
    showHistogram = root.dataset.showhistogram;
    perPage = parseInt(root.dataset.perpage);
    limit = perPage;

    allReviews = await getAllProductReviews(productId);

    if (starRatingTop) {
      updateStarRatingTop();
    }

    await updateReviewsWrapper();
  }
})();
