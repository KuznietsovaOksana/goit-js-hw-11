import './../css/common.css';
import './../css/styles.css';
import { PixabayApi } from './pixabay-api.js';
import createGalleryCards from './../templates/gallery-card.hbs';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchFormEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

const pixabayApi = new PixabayApi();

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

searchFormEl.addEventListener('submit', onSearchFormSubmit);
loadMoreBtnEl.addEventListener('click', onLoadMoreBtnClick);

async function onSearchFormSubmit(event) {
  event.preventDefault();

  pixabayApi.page = 1;
  pixabayApi.searchQuery = event.target.elements.searchQuery.value.trim();

  try {
    const response = await pixabayApi.fetchPhotos();
    const { data } = response;

    if (pixabayApi.searchQuery === '') {
      galleryEl.innerHTML = '';
      loadMoreBtnEl.classList.add('is-hidden');

      Notiflix.Notify.info(
        'Please, type the name of images you would like to find.',
        {
          clickToClose: true,
          timeout: 2000,
        }
      );
      return;
    }

    if (data.hits.length === 0) {
      galleryEl.innerHTML = '';
      loadMoreBtnEl.classList.add('is-hidden');

      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        {
          clickToClose: true,
          timeout: 2000,
        }
      );
      return;
    }

    if (data.hits.length < pixabayApi.per_page) {
      galleryEl.innerHTML = createGalleryCards(data.hits);
      loadMoreBtnEl.classList.add('is-hidden');
      lightbox.refresh();

      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results.",
        {
          clickToClose: true,
          timeout: 2000,
        }
      );
      return;
    }

    galleryEl.innerHTML = createGalleryCards(data.hits);
    loadMoreBtnEl.classList.remove('is-hidden');
    lightbox.refresh();

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`, {
      clickToClose: true,
      timeout: 2000,
    });
  } catch (err) {
    console.log(err);
  }
}

async function onLoadMoreBtnClick(event) {
  pixabayApi.page += 1;

  try {
    const response = await pixabayApi.fetchPhotos();
    const { data } = response;
    galleryEl.insertAdjacentHTML('beforeend', createGalleryCards(data.hits));
    lightbox.refresh();
    onBtnScroll();

    if (data.hits.length === pixabayApi.page) {
      loadMoreBtnEl.classList.add('is-hidden');
    }
  } catch (err) {
    console.log(err);
  }
}

function onBtnScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
