const {
    createClient
} = supabase
const _supabase = createClient('https://pfwnyxmmxgydkohyqrto.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmd255eG1teGd5ZGtvaHlxcnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk3MTg5NjMsImV4cCI6MjAxNTI5NDk2M30.v--PqHL9B8GMFNNW-bp-mMcr7p30V_5hKXVUSRTBGxA');


function toggleFavorite(button) {
    button.classList.toggle('active');

    const card = button.closest('.card');
    const productId = card.getAttribute('data-id');

    fetch('/checkIfUserIsLoggedIn', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(response => {
            if (response.status === 200) {

                postData = {
                    'productID': productId
                };

                if (button.classList.contains('active')) {

                    fetch('/addItemWishlist', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(postData)
                        }).then(response => {
                            if (response.status === 205) {
                                console.log("Added to Wishlist. ")
                            } else if (response.status === 413) {
                                console.log("Cannot add to wishlist");
                            }
                        })
                        .catch(error => {
                            if (!navigator.onLine) {
                                console.error('No internet connection');
                            } else {
                                console.error('Fetch error:', error);
                            }
                        });
                } else {
                    fetch('/removeItemWishlist', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(postData)
                        }).then(response => {
                            if (response.status === 206) {
                                console.log("Removed from Wishlist. ")
                            } else if (response.status === 414) {
                                console.log("Cannot remove from wishlist");
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
            } else if (response.status === 412) {
                console.error("Cannot check if the user is signed in.");
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

let products = [];
let userWishlist = [];

async function getUserWishlist() {
    try {
        const response = await fetch('/checkIfUserIsLoggedIn');

        if (response.status === 200) {
const responseData = await response.json(); // Get JSON response
            const userEmail = responseData.email;
            const { data, error } = await _supabase
                .from('UserWishlist')
                .select('item_id')
                .eq('user_email', userEmail);

            if (error) {
                console.error("Error fetching User Wishlist:", error);
            } else {
                userWishlist = data;
            }
        } else if (response.status === 412) {
            console.error("User is not signed in.");
        }
    } catch (error) {
        if (!navigator.onLine) {
            console.error('No internet connection');
        } else {
            console.error('Fetch error:', error);
        }
    }
}

async function getPerfumeDetails() {

    const {
        data,
        error
    } = await _supabase
        .from('ShopItem')
        .select()

    if (error) {
        console.log("Error with fetching Shop Item Data");
    } else {
        products = data;
    }

    await getUserWishlist();
    populateSections();
}

function updateProductCard(card, product) {
    card.setAttribute('data-id', product.id);
    var card2 = card.closest('.card');

    var image = card2.querySelector('img');

    image.src = product.image_url;
    const cardTitle = card.querySelector('.card-title');
    const cardDescription = card.querySelector('.card-description');
//    const favoriteButton = card.querySelector('.favorite-button');


    cardTitle.textContent = product.name;
    cardDescription.innerHTML = `Price: $${product.price} <br> Stock: ${product.stock_number}`;
//    favoriteButton.classList.remove('active');
}

function populateSections() {
    const maxItemsPerSection = 10;
    const sections = [
        document.querySelector('#highlights-carousel .list'),
        document.querySelector('#her-highlights-carousel .list'),
        document.querySelector('#gift-highlights-carousel .list')
    ];

    let itemCount = 0;
    let sectionIndex = 0;

    products.forEach(product => {
        if (itemCount >= maxItemsPerSection) {
            itemCount = 0;
            sectionIndex++;
        }

        if (sectionIndex < sections.length) {
            const cards = sections[sectionIndex].querySelectorAll('.card');
            if (itemCount < cards.length) {
                updateProductCard(cards[itemCount], product);

const isFavorite = userWishlist.some(item => item.item_id === product.id);
                const favoriteButton = cards[itemCount].querySelector('.favorite-button');
                if (isFavorite) {
                    favoriteButton.classList.add('active');
                } else {
                    favoriteButton.classList.remove('active');
                }
            }
            itemCount++;
        }
    });
}

function updateCardById(productId, updatedData) {
    const allCards = document.querySelectorAll('.card[data-id]');
    const cardToUpdate = Array.from(allCards).find(card => card.getAttribute('data-id') == productId);
    if (cardToUpdate) {
        updateProductCard(cardToUpdate, updatedData);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const highlightsLeftButton = document.getElementById('highlights-scroll-left');
    const herhighlightsLeftButton = document.getElementById('her-highlights-scroll-left');
    const gifthighlightsLeftButton = document.getElementById('gift-highlights-scroll-left');
    const highlightsRightButton = document.getElementById('highlights-scroll-right');
    const herhighlightsRightButton = document.getElementById('her-highlights-scroll-right');
    const gifthighlightsRightButton = document.getElementById('gift-highlights-scroll-right');


    highlightsLeftButton.onclick = function() {
        document.getElementById('highlights-carousel').scrollLeft -= 250;
    };

    herhighlightsLeftButton.onclick = function() {
        document.getElementById('her-highlights-carousel').scrollLeft -= 250;
    };
    gifthighlightsLeftButton.onclick = function() {
        document.getElementById('gift-highlights-carousel').scrollLeft -= 250;
    };

    highlightsRightButton.onclick = function() {
        document.getElementById('highlights-carousel').scrollLeft += 250;
    };

    herhighlightsRightButton.onclick = function() {
        document.getElementById('her-highlights-carousel').scrollLeft += 250;
    };

    gifthighlightsRightButton.onclick = function() {
        document.getElementById('gift-highlights-carousel').scrollLeft += 250;
    };

    getPerfumeDetails();

    _supabase
        .channel('room1')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'ShopItem'
        }, payload => {
            updateCardById(payload['old']['id'], payload['new']);
        })
        .subscribe()

        _supabase
        .channel('room2')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'UserWishlist'
        }, async () => {
            await getUserWishlist();
            populateSections();
        })
        .subscribe();
});