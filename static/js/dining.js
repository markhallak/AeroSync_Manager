let loadMoreBtn = document.querySelector('#load-more');
let currentItem = 6; // Initialize to show 6 items initially

loadMoreBtn.onclick = () => {
  let boxes = [...document.querySelectorAll('.container .box-container .box')];
  let itemsToLoad = 6; // Load 6 items per click

  for (let i = currentItem; i < currentItem + itemsToLoad; i++) {
    if (boxes[i]){
      let image = boxes[i].querySelector('.image img');
      if (!image.complete) {
        image.onload = function() {
      boxes[i].classList.add('visible') 
      };

     } else{
        boxes[i].classList.add('visible');
      }
    }
  }

  currentItem += itemsToLoad;

  if (currentItem >= boxes.length) {
    loadMoreBtn.style.display = 'none'; // Hide the button if all items are loaded
  }
};


document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('btn');
  btn.addEventListener('click', function() {
    toggle('../static/images/oop.jpg');
  });

  var closeBtn = document.getElementById('closeBtn');
  closeBtn.addEventListener('click', function() {
    toggle();
  });
});



function toggle(imageSrc) {
  // Toggle the 'active' class on the blur element
  var blur = document.getElementById('blur');
  blur.classList.toggle('active');

  // Get the popup element
  var popup = document.getElementById('popup');

  // If an image source is provided, update the image; otherwise, clear it
  if (imageSrc) {
    popup.querySelector('img').src = imageSrc;
  } else {
    popup.querySelector('img').src = ''; // Clear the image source
  }

  // Toggle the 'active' class on the popup element
  popup.classList.toggle('active');
}


//Here is the filtering code

function toggleFilter(button) {
  const filterOptions = button.nextElementSibling;
  const filterButtons = filterOptions.nextElementSibling;

if (filterOptions.style.display == 'none' || filterOptions.style.display === '') {
  filterOptions.style.display = 'flex';
  filterButtons.style.display = 'flex';
  button.textContent = 'Filters -';
} else {
  filterOptions.style.display = 'none';
  filterButtons.style.display = 'none';
  button.textContent = 'Filters +';
}
}

document.addEventListener('DOMContentLoaded', function () {
  let selectedCategories = [];

  function toggleFilter(button) {
      const filterOptions = button.nextElementSibling;
      const filterButtons = filterOptions.nextElementSibling;

      if (filterOptions.style.display == 'none' || filterOptions.style.display === '') {
          filterOptions.style.display = 'flex';
          filterButtons.style.display = 'flex';
          button.textContent = 'Filters -';
      } else {
          filterOptions.style.display = 'none';
          filterButtons.style.display = 'none';
          button.textContent = 'Filters +';
      }
  }

  function applyFilters() {
      const boxes = document.querySelectorAll('.box');
      boxes.forEach(box => {
          const category = box.getAttribute('data-category');
          if (selectedCategories.length === 0 || selectedCategories.includes(category)) {
              box.style.display = 'block';
          } else {
              box.style.display = 'none';
          }
      });
  }

  function resetFilters() {
      const selectedCategories = document.querySelectorAll('.filter-category.selected');
      selectedCategories.forEach(category => {
          category.classList.remove('selected');
      });
      applyFilters(); // Added to apply filters after resetting
  }

  const categoryButtons = document.querySelectorAll('.filter-category');
  categoryButtons.forEach(button => {
      button.addEventListener('click', function () {
          this.classList.toggle('selected');
      });
  });

  const applyButton = document.querySelector('.apply-button');
  if (applyButton) {
      applyButton.addEventListener('click', function () {
          selectedCategories = [];
          const selectedCategoriesElements = document.querySelectorAll('.filter-category.selected');
          selectedCategoriesElements.forEach(category => {
              selectedCategories.push(category.getAttribute('data-category'));
          });
          applyFilters();
      });
  }

  const resetButton = document.querySelector('.reset-button');
  if (resetButton) {
      resetButton.addEventListener('click', resetFilters);
  }
});







