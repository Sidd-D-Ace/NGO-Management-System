document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#studentsTableBody");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.querySelector("#studentSearch");
  const spinner = document.querySelector("#loadingSpinner");

  let allStudents = [];
  let currentIndex = 0;
  const batchSize = 10;
  let isLoading = false;

  function renderNextBatch() {
  if (isLoading) return;
  isLoading = true;
  spinner.style.display = "block"; // show spinner

  setTimeout(() => { // simulate 1 sec delay
    const nextBatch = allStudents.slice(currentIndex, currentIndex + batchSize);

    nextBatch.forEach((s, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${currentIndex + index + 1}</td>
        <td>${s.name}</td>
        <td>${s.age}</td>
        <td>${s.gender}</td>
        <td>${s.branch}</td>
        <td>${s.attendance ?? "0%"}</td>
        <td class="ta-right">
          <a href="/head/students/${s.student_id}" class="btn btn-sm btn-primary">View</a>
        </td>
      `;
      tableBody.appendChild(row);
    });

    currentIndex += batchSize;
    isLoading = false;
    spinner.style.display = "none"; // hide spinner
  }, 1000); // 1-second delay
}


  function renderStudents(students) {
    tableBody.innerHTML = "";
    if (students.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No students found</td></tr>`;
      return;
    }
    allStudents = students;
    currentIndex = 0;
    renderNextBatch();
  }

  async function fetchStudents(status = "all", search = "") {
    try {
      let url = `/head/api/students?status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      spinner.style.display = "block"; // show spinner while fetching
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json();
      spinner.style.display = "none"; // hide spinner after fetch
      renderStudents(data);
    } catch (err) {
      spinner.style.display = "none";
      console.error("Error fetching students:", err);
    }
  }

  window.addEventListener("scroll", () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 50 && currentIndex < allStudents.length) {
      renderNextBatch();
    }
  });

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const status = btn.dataset.status;
      const search = searchInput.value.trim();
      fetchStudents(status, search);
    });
  });

  searchInput.addEventListener("input", () => {
    const activeBtn = document.querySelector(".filter-btn.active");
    const status = activeBtn ? activeBtn.dataset.status : "all";
    fetchStudents(status, searchInput.value.trim());
  });

  fetchStudents("all");
});
