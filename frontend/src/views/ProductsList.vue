<!-- frontend/src/views/ProductsList.vue -->
<template>
    <div class="container mt-5">
        <h2 class="mb-4">商品列表</h2>
        <div v-if="filteredProducts.length === 0">
            <p>暫無符合條件的商品，請修改查詢條件！</p>
        </div>
        <div class="row">
            <div class="tag-filter mb-4">
            <h4>選擇標籤</h4>
                <div>
                    <button 
                        v-for="tag in availableTags" 
                        :key="tag" 
                        @click="toggleTag(tag)"
                        :class="{'btn': true, 'btn-primary': selectedTags.includes(tag), 'btn-outline-primary': !selectedTags.includes(tag)}"
                        class="me-2 mb-2"
                    >
                        {{ tag }}
                    </button>
                </div>
            </div>
            <div class="search-bar mb-4">
                <input type="text" v-model="searchQuery" class="form-control" placeholder="搜尋產品...">
            </div>
            <div class="col-md-3">
                <h4>篩選條件</h4>
                <div>
                    <label>價格區間</label>
                    <input type="range" v-model="priceRange" min="0" :max="maxPrice" step="500"/>
                    <p>價格：{{ priceRange }}元</p>
                </div>

            </div>
        </div>
    </div>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-3 mb-4" v-for="product in filteredProducts" :key="product.id">
                    <ProductCard 
                    :product="product"
                    @add-to-cart="addToCart"
                    />
            </div>
        </div>
    </div>

</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import ProductCard from './ProductCard.vue';
import ApiService from '@/services/api';
import { handleApiError } from '@/utils/errorHandler';



export default {
    name: 'ProductsList',
    components: {
        ProductCard,
    },
    setup() {
        // 創建需要的響應式變量
        const products = ref([]);
        const loading = ref(false);
        const error = ref(null);
        const maxPrice = computed(()=>{
            if (!Array.isArray(products.value)) return 1000000;
            const prices = products.value.map(product => Number(product.price));
            return prices.length ? Math.max(...prices) : 1000000;
        });
        const priceRange = ref(maxPrice.value);

        // 響應式變量
        const availableTags = ref([]);
        const selectedTags = ref([]);

        // 獲取需要的工具
        const store = useStore();
        const router = useRouter();
        const route = useRoute();

        // 計算屬性
        const isLoggedIn = computed(() => store.state.auth.isLoggedIn);
        const searchQuery = ref('');
        
        const filteredProducts = computed(() => {
            if (!Array.isArray(products.value)) return [];
            return products.value.filter(product => {
                const productPrice = Number(product.price);
                const nameMatch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
                const priceMatch = productPrice <= priceRange.value;
                const productTags = product.tags || [];
                const tagMatch = selectedTags.value.length === 0 || selectedTags.value.some(tag => productTags.includes(tag));
                return nameMatch && priceMatch && tagMatch;
            });
        });
        // 方法
        const loadProducts = async () => {
            loading.value = true;
            error.value = null;

            try {
                const productData = await ApiService.productAPI.getAllProducts();

                if(Array.isArray(productData)){
                    products.value = productData.map((product) => ({ 
                        ...product,
                        id: String(product.id).trim(),
                        price:Number(product.price),
                        tags: Array.isArray(product.tags) ? product.tags : [],
                        image: product.image ? `${process.env.VUE_APP_PRODUCT_IMAGE_BASE_URL}/${product.image.split('/').pop()}` : '/img/default-product.jpg'
                    }))
                }else{
                    products.value =[];
                }
                console.log('加載後的商品列表:',products.value);
                priceRange.value = maxPrice.value;
                // 獲取所有標籤     
                const tagsSet = new Set();
                products.value.forEach((product) => {
                    if(product.tags && Array.isArray(product.tags)){
                        product.tags.forEach((tag) =>tagsSet.add(tag));
                    }
                });
                availableTags.value = Array.from(tagsSet);
            }
            catch (err) {
                console.error("加載商品時出錯", err);
                error.value = "加載產品時出錯，請稍後再試！";
            } finally {
                loading.value = false;
            }
        };
        const toggleTag = (tag) =>{
            if (selectedTags.value.includes(tag)){
                selectedTags.value = selectedTags.value.filter((t) => t!== tag);
            }else{
                selectedTags.value.push(tag);
            }
        }
        const addToCart = (product) => {
            if (!isLoggedIn.value) {
                // 未登入將跳轉至登入頁面
                store.dispatch('notifications/showNotification', {
                    type: 'warning',
                    message: '請先登入會員再加入購物車！',
                    timeout:2000,
                });
                
                const returnPath = route.fullPath;
                router.push({
                    name: 'UserLogin',
                    query: { redirect: returnPath }
                });
                return;
            }
            // 透過Vuex Action 添加商品到購物車
            store.dispatch('cart/addProductToCart', product);
            // 透過Vuex Action 顯示成功通知
            store.dispatch('notifications/showNotification', {
                type: 'success',
                message: `已將 ${product.name} 加入購物車`,
                timeout:2000,
            });
        };

        // 在組件掛載時加載商品
        onMounted(() => {
            searchQuery.value = route.query.search || '';
            loadProducts().then(() => {
                console.log('加載後的商品列表:', products.value);
            });
        });
        watch(
            () => route.query.search,
            (newSearch) => {
                searchQuery.value = newSearch || '';
            }
        );

        // 返回模板中需要使用的內容
        return {
            products,
            maxPrice,
            priceRange,
            loading,
            error,
            isLoggedIn,
            filteredProducts,
            availableTags,
            selectedTags,
            searchQuery,
            toggleTag,
            addToCart,
        };
    }
};
</script>
<style scoped>
.product-name{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
    display: block;
}

@media (max-width: 768px) {
    .product-name{
        max-width: 150px;
    }
}
@media (max-width: 576px) {
    .product-name{
        max-width: 100px;
    }
}
</style>