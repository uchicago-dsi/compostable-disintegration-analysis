export const closeOpenedDetails = (id) => {
  const summaries = document.querySelectorAll("summary");
  summaries.forEach((summary) => {
    if (summary.id !== id) {
      const detail = summary.parentElement;
      detail.removeAttribute("open");
    }
  });
};
