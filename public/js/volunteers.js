document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#volunteersTableBody");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.querySelector("#volunteerSearch");

  // Spinner
  const spinner = document.createElement("div");
  spinner.textContent = "Loading…";
  spinner.style.textAlign = "center";
  spinner.style.padding = "10px";
  spinner.style.display = "none";
  tableBody.parentNode.appendChild(spinner);

  let allVolunteers = [];
  let currentIndex = 0;
  const batchSize = 10;
  let isLoading = false;
  let currentStatus = "all";
  let currentSearch = "";

  // Render next batch
  function renderNextBatch() {
    if (isLoading) return;
    isLoading = true;
    spinner.style.display = "block";

    setTimeout(() => {
      const nextBatch = allVolunteers.slice(currentIndex, currentIndex + batchSize);
      nextBatch.forEach((v, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${currentIndex + index + 1}</td>
          <td>${v.name}</td>
          <td>${v.age}</td>
          <td>${v.gender}</td>
          <td>${v.branch}</td>
          <td>${v.attendance ?? "0%"}</td>
          <td class="ta-right">
            <a href="/head/volunteers/${v.volunteer_id}" class="btn btn-sm btn-primary">View</a>
          </td>
        `;
        tableBody.appendChild(row);
      });

      currentIndex += batchSize;
      isLoading = false;
      spinner.style.display = "none";
    }, 1000);
  }

  // Fetch volunteers
  async function fetchVolunteers(status = "all", search = "") {
    try {
      currentStatus = status;
      currentSearch = search;
      currentIndex = 0;
      tableBody.innerHTML = "";

      let url = `/head/api/volunteers?status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      allVolunteers = await res.json();

      if (allVolunteers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No volunteers found</td></tr>`;
        return;
      }

      renderNextBatch();
    } catch (err) {
      console.error("Error fetching volunteers:", err);
    }
  }

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const status = btn.dataset.status;
      const search = searchInput.value.trim();
      fetchVolunteers(status, search);
    });
  });

  // Live search
  searchInput.addEventListener("input", () => {
    fetchVolunteers(currentStatus, searchInput.value.trim());
  });

  // Infinite scroll
  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100
    ) {
      if (currentIndex < allVolunteers.length) {
        renderNextBatch();
      }
    }
  });

  // Initial load
  fetchVolunteers("all");
});
