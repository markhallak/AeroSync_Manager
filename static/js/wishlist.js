const {
    createClient
} = supabase
const _supabase = createClient('https://pfwnyxmmxgydkohyqrto.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmd255eG1teGd5ZGtvaHlxcnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk3MTg5NjMsImV4cCI6MjAxNTI5NDk2M30.v--PqHL9B8GMFNNW-bp-mMcr7p30V_5hKXVUSRTBGxA');

let wishlistData = [];

function getWishlistData() {
    fetch('/getWishlist', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        wishlistData = data.products;
        document.getElementById('productContainer').innerHTML = "";
        populateCards();
    })
    .catch(error => {
        if (!navigator.onLine) {
            console.error('No internet connection');
        } else {
            console.error('Fetch error:', error);
        }
    });
}

function populateCards(){
    wishlistData.forEach(product => {
        createProductElement(product)
    });
}

async function subscribeToChannel() {
    _supabase
        .channel('room1')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'UserWishlist'
        }, payload => {
            getWishlistData();
        })
        .subscribe();

    _supabase
        .channel('room2')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'ShopItem'
        }, payload => {
            updateProductElement(payload['old']['id'], payload['new']);
        })
        .subscribe()
}

function updateProductElement(productId, newData) {
    const productElement = document.querySelector(`[data-product-id="${productId}"]`);

    if (productElement) {
        productElement.querySelector('.product-name').textContent = newData.name;
        productElement.querySelector('.product-stock').textContent = newData.stock_number;
        productElement.querySelector('.product-price').textContent = `$${newData.price}`;
        // Uncomment this if the image is fetched from the storage bucket
//        productElement.querySelector('.product-image').src = newData.imageUrl;
    }
}

function removeItemWishlist(productID){
    const postData = {
       'productID': productID
  };

  fetch('/removeItemWishlist', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
  }).then(response => {
    if(!response.ok){
        console.error("Can't create account");
    }
  })
    .catch(error => {
    if (!navigator.onLine) {
        console.error('No internet connection');
    } else {
        console.error('Fetch error:', error);
    }
  });
}

function createProductElement(product) {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'row p-2 bg-white border rounded mt-2';
    mainDiv.setAttribute('data-product-id', product.id);

    const imgDiv = document.createElement('div');
    imgDiv.className = 'col-md-3 mt-1';
    const img = document.createElement('img');
    img.className = 'img-fluid img-responsive rounded product-image';
    img.src = product.image_url === "" ? '../static/images/perfume5-her.jpg' : product.image_url;
    imgDiv.appendChild(img);

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'col-md-6 mt-1';
    const br1 = document.createElement('br');
    const br2 = document.createElement('br');
    const br3 = document.createElement('br');
    const productName = document.createElement('h5');
    productName.className = 'mr-1 product-name';
    productName.textContent = product.name;
    const priceDiv = document.createElement('div');
    priceDiv.className = 'd-flex flex-row align-items-center';
    const price = document.createElement('h4');
    price.className = 'mr-1 product-price';
    price.textContent = `$${product.price}`;
    const productShop = document.createElement('h6');
    productShop.textContent = `Shop: ${product.shop_name}`;
    const productStock = document.createElement('h6');
    productStock.className = 'mr-1 product-stock';
    productStock.textContent = `Stock Left: ${product.stock_number}`;
    priceDiv.appendChild(price);
    detailsDiv.appendChild(br1);
    detailsDiv.appendChild(br2);
    detailsDiv.appendChild(br3);
    detailsDiv.appendChild(productName);
    detailsDiv.appendChild(priceDiv);
    detailsDiv.appendChild(productShop);
    detailsDiv.appendChild(productStock);

    const actionDiv = document.createElement('div');
    actionDiv.className = 'align-items-center align-content-center col-md-3 border-left mt-1';
    const br4 = document.createElement('br');
    const br5 = document.createElement('br');
    const br6 = document.createElement('br');
    const br7 = document.createElement('br');
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'd-flex flex-column mt-4';
    const button = document.createElement('button');
    button.setAttribute('data-product-id', product.id);
    button.className = 'btn btn-primary btn-sm';
    button.type = 'button';
    button.textContent = 'Remove from Wishlist';
    button.addEventListener('click', () => removeItemWishlist(product.id));
    buttonDiv.appendChild(button);
    actionDiv.appendChild(br4);
    actionDiv.appendChild(br5);
    actionDiv.appendChild(br6);
    actionDiv.appendChild(br7);
    actionDiv.appendChild(buttonDiv);

    mainDiv.appendChild(imgDiv);
    mainDiv.appendChild(detailsDiv);
    mainDiv.appendChild(actionDiv);

    document.getElementById('productContainer').appendChild(mainDiv);
}

document.addEventListener('DOMContentLoaded', function() {
    getWishlistData();
    subscribeToChannel();
});