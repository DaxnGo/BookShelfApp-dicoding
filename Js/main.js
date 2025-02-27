// Inisialisasi array untuk menyimpan buku-buku
let books = [];

// Konstanta untuk penyimpanan localStorage
const STORAGE_KEY = "BOOKSHELF_APPS";

// Fungsi untuk memeriksa dukungan localStorage pada browser
function isStorageAvailable() {
  return typeof Storage !== "undefined";
}

// Fungsi untuk menyimpan data ke localStorage
function saveData() {
  if (isStorageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
}

// Fungsi untuk memuat data dari localStorage
function loadData() {
  if (isStorageAvailable()) {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      books = JSON.parse(storedData);
    }
  }
  renderBooks();
}

// Fungsi untuk membuat ID unik berdasarkan timestamp
function generateId() {
  return +new Date();
}

// Fungsi untuk membuat objek buku baru
function createBookObject(title, author, year, isComplete) {
  return {
    id: generateId(),
    title,
    author,
    year: parseInt(year),
    isComplete,
  };
}

// Fungsi untuk menambahkan buku baru
function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = document.getElementById("bookFormYear").value;
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const newBook = createBookObject(title, author, year, isComplete);
  books.push(newBook);

  saveData();
  renderBooks();

  // Reset formulir
  document.getElementById("bookForm").reset();
  updateSubmitButtonText();
}

// Fungsi untuk memperbarui teks pada tombol submit
function updateSubmitButtonText() {
  const isComplete = document.getElementById("bookFormIsComplete").checked;
  const submitButton = document.getElementById("bookFormSubmit");

  // Jika tombol masih dalam mode edit, kita tidak perlu mengubah teksnya
  if (submitButton.dataset.bookid) return;

  // Jika tombol tidak memiliki span, tambahkan
  if (!submitButton.querySelector("span")) {
    submitButton.textContent = "Masukkan Buku ke rak ";
    const span = document.createElement("span");
    span.textContent = isComplete ? "Selesai dibaca" : "Belum selesai dibaca";
    submitButton.appendChild(span);
  } else {
    const spanElement = submitButton.querySelector("span");
    spanElement.textContent = isComplete
      ? "Selesai dibaca"
      : "Belum selesai dibaca";
  }
}

// Fungsi untuk menampilkan buku ke rak yang sesuai
function renderBooks(filteredBooks = null) {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  // Kosongkan rak sebelum menampilkan buku-buku
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  const booksToRender = filteredBooks || books;

  for (const book of booksToRender) {
    const bookElement = createBookElement(book);

    if (book.isComplete) {
      completeBookList.appendChild(bookElement);
    } else {
      incompleteBookList.appendChild(bookElement);
    }
  }
}

// Fungsi untuk membuat elemen HTML untuk sebuah buku
function createBookElement(book) {
  const bookItem = document.createElement("div");
  bookItem.classList.add("book_item");
  bookItem.setAttribute("data-bookid", book.id);
  bookItem.setAttribute("data-testid", "bookItem");

  const title = document.createElement("h3");
  title.setAttribute("data-testid", "bookItemTitle");
  title.innerText = book.title;

  const author = document.createElement("p");
  author.setAttribute("data-testid", "bookItemAuthor");
  author.innerText = `Penulis: ${book.author}`;

  const year = document.createElement("p");
  year.setAttribute("data-testid", "bookItemYear");
  year.innerText = `Tahun: ${book.year}`;

  const buttonContainer = document.createElement("div");

  const toggleButton = document.createElement("button");
  toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");

  if (book.isComplete) {
    toggleButton.innerText = "Belum selesai dibaca";
    toggleButton.addEventListener("click", function () {
      moveBookToIncomplete(book.id);
    });
  } else {
    toggleButton.innerText = "Selesai dibaca";
    toggleButton.addEventListener("click", function () {
      moveBookToComplete(book.id);
    });
  }

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Hapus Buku";
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.addEventListener("click", function () {
    deleteBook(book.id);
  });

  const editButton = document.createElement("button");
  editButton.innerText = "Edit Buku";
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.addEventListener("click", function () {
    editBook(book.id);
  });

  buttonContainer.append(toggleButton, deleteButton, editButton);
  bookItem.append(title, author, year, buttonContainer);

  return bookItem;
}

// Fungsi untuk memindahkan buku ke rak "Selesai dibaca"
function moveBookToComplete(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);

  if (bookIndex !== -1) {
    books[bookIndex].isComplete = true;
    saveData();
    renderBooks();
  }
}

// Fungsi untuk memindahkan buku ke rak "Belum selesai dibaca"
function moveBookToIncomplete(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);

  if (bookIndex !== -1) {
    books[bookIndex].isComplete = false;
    saveData();
    renderBooks();
  }
}

// Fungsi untuk menghapus buku
function deleteBook(bookId) {
  if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
    const bookIndex = books.findIndex((book) => book.id === bookId);

    if (bookIndex !== -1) {
      books.splice(bookIndex, 1);
      saveData();
      renderBooks();
    }
  }
}

// Fungsi untuk mengedit buku - DIPERBAIKI
function editBook(bookId) {
  const bookIndex = books.findIndex((book) => book.id === Number(bookId));

  if (bookIndex !== -1) {
    const book = books[bookIndex];

    // Isi form dengan data buku yang akan diedit
    document.getElementById("bookFormTitle").value = book.title;
    document.getElementById("bookFormAuthor").value = book.author;
    document.getElementById("bookFormYear").value = book.year;
    document.getElementById("bookFormIsComplete").checked = book.isComplete;

    // Ubah tombol submit menjadi tombol update
    const submitButton = document.getElementById("bookFormSubmit");
    submitButton.textContent = "Update Buku";
    submitButton.dataset.bookid = book.id;

    // Scroll ke form edit
    document.getElementById("bookForm").scrollIntoView({ behavior: "smooth" });
  }
}

// Fungsi untuk mencari buku berdasarkan judul
function searchBooks() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  if (searchTitle === "") {
    renderBooks();
    return;
  }

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTitle)
  );

  renderBooks(filteredBooks);
}

// Inisialisasi aplikasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Load data dari localStorage
  loadData();

  // Event listener untuk form penambahan buku
  const bookForm = document.getElementById("bookForm");
  bookForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const submitButton = document.getElementById("bookFormSubmit");

    if (submitButton.dataset.bookid) {
      // Update buku yang sudah ada
      const bookId = Number(submitButton.dataset.bookid);
      const bookIndex = books.findIndex((book) => book.id === bookId);

      if (bookIndex !== -1) {
        books[bookIndex].title = document.getElementById("bookFormTitle").value;
        books[bookIndex].author =
          document.getElementById("bookFormAuthor").value;
        books[bookIndex].year = parseInt(
          document.getElementById("bookFormYear").value
        );
        books[bookIndex].isComplete =
          document.getElementById("bookFormIsComplete").checked;

        saveData();
        renderBooks();

        // Reset form dan tombol
        bookForm.reset();
        delete submitButton.dataset.bookid;

        submitButton.innerHTML =
          "Masukkan Buku ke rak <span>Belum selesai dibaca</span>";
        updateSubmitButtonText();
      }
    } else {
      // Tambah buku baru
      addBook();
    }
  });

  // Event listener untuk checkbox isComplete
  const isCompleteCheckbox = document.getElementById("bookFormIsComplete");
  isCompleteCheckbox.addEventListener("change", updateSubmitButtonText);

  // Event listener untuk form pencarian
  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    searchBooks();
  });

  // Event listener untuk input pencarian (search as you type)
  const searchInput = document.getElementById("searchBookTitle");
  searchInput.addEventListener("input", searchBooks);
});
