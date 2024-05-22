const handleStarOverride = (() => {
  const roots = Array.from(
    document.querySelectorAll(
      ".product-card-wrapper .card-information .rating-star",
    ),
  );

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

  roots.forEach((root) => {
    const parent = root.parentElement;
    const style = window.getComputedStyle(root);
    const rating = Math.ceil(parseInt(style.getPropertyValue("--rating")));
    const count =
      parent.parentElement.querySelector(".rating-count").firstElementChild
        .innerText;

    const html =
      buildStarsHTML(rating, 18) +
      `<span class="ratings-count">${count}</span>`;
    parent.className = "star-wrapper";

    parent.parentElement
      .querySelector(".rating-count")
      .firstElementChild.remove();

    parent.innerHTML = html;
  });
})();
