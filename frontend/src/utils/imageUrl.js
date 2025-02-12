// src/utils/imageUrl.js

export const getImageUrl = (path, type) => {
  const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || '';
  const staticBaseURL = API_BASE_URL.replace(/\/api$/, '');

  if (!path) {
    return API_BASE_URL + '/img/wrong.png'
  }  

  if(path.startsWith('http')) {
    return path;
  }

  if(path.startsWith('/')){
    return API_BASE_URL + path;
  }

  switch(type) {
      case 'carousel':
        return `${staticBaseURL}/img/carouselImages/${path.split('/').pop()}`;
      case 'product':
        return `${API_BASE_URL}/img/products/${path.split('/').pop()}`;
      case 'icon':
        return `${API_BASE_URL}/img/icons/${path.split('/').pop()}`;
      default:
        return `${API_BASE_URL}${path}`;
    }
};
export default getImageUrl;