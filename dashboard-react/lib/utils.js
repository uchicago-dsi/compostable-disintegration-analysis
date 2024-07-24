import state from "@/lib/state";

export const closeOpenedDetails = (id) => {
  const summaries = document.querySelectorAll("summary");
  summaries.forEach((summary) => {
    if (summary.id !== id) {
      const detail = summary.parentElement;
      detail.removeAttribute("open");
    }
  });
};

export const onSummaryClick = (filterKey) => {
  closeOpenedDetails(`summary-${filterKey}`);
};

export const handleSingleSelectChange = (key, value) => {
  console.log(key, value);
  state.setFilterValue(key, value);
};
