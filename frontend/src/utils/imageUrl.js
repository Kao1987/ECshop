// src/utils/imageUrl.js

export const getImageUrl = (path, type) => {
    if (!path) return '/img/wrong.png'
    ? process.env.VUE_APP_API_BASE_URL + '/img/wrong.png'
    :'/api/img/wrong/png';

    if(path.startsWith('http')) return path;

    const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || '';

    switch(type) {
        case 'carousel':
          return `${API_BASE_URL}/img/carouselImages/${path.split('/').pop()}`;
        case 'product':
          return `${API_BASE_URL}/img/products/${path.split('/').pop()}`;
        case 'icon':
          return `${API_BASE_URL}/img/icons/${path.split('/').pop()}`;
        default:
          return `${API_BASE_URL}${path}`;
      }
};
export default getImageUrl;