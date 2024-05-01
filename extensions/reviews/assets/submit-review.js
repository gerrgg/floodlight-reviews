const handleReviewSubmit = () => {
  const root = document.querySelector("#review-submit-form");
  const url =
    "https://costume-bar-assisted-trigger.trycloudflare.com/app/reviews/new?_data=routes/app.reviews.$id";

  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(root);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    })
      .then((response) => response.text())
      .then((responseText) => {
        console.log(responseText);
        return responseText;
      });
  });
};

handleReviewSubmit();
